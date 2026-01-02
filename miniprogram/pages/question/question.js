/**
 * pages/question/question.js
 * ✅ 关键修复：
 * - assembly.assemble 的正确签名：assemble(answers, diagnosisResult, libraries)
 * - 传入 libraries（solutions/expertDictionary/treatmentPlans），让方案 steps 不为空
 * - scheduler 只依赖 followupKeys/needMore：必须从 assembly.nextSteps 得到这些
 */

let scheduler, questionBank, diagnosisEngine, assembly;
let solutions, expertDictionary, treatmentPlans;

try { scheduler = require('../../domain/questionnaire/scheduler'); }
catch (e) { console.error('[question] require scheduler fail', e); }

try { questionBank = require('../../domain/questionnaire/questionBank'); }
catch (e) { console.error('[question] require questionBank fail', e); }

try { diagnosisEngine = require('../../domain/orchestrator/diagnosisEngine'); }
catch (e) { console.error('[question] require orchestrator fail', e); }

try { assembly = require('../../domain/assembly/index'); }
catch (e) { console.error('[question] require assembly fail', e); }

try { solutions = require('../../domain/solutions/index'); } catch (e) { solutions = null; }
try { expertDictionary = require('../../domain/dictionary/expertDictionary'); } catch (e) { expertDictionary = null; }
try { treatmentPlans = require('../../domain/dictionary/treatmentPlans'); } catch (e) { treatmentPlans = null; }

Page({
  data: {
    crop: '',
    month: 0,
    positions: [],
    currentQuestion: null,
    selectedMap: {},
    followupKeys: [],
    needMore: [],
    loading: false,
    toast: '',
  },

  onLoad(options) {
    const crop = options.crop || '';
    const month = Number(options.month || 0) || 0;

    let positions = [];
    try { positions = options.positions ? JSON.parse(options.positions) : []; }
    catch (e) { positions = []; }

    this.answers = { crop, month, positions };
    this.askedKeys = [];
    this.currentNode = null;

    console.log('[question][onLoad] crop/month/positions=', crop, month, positions);

    if (!scheduler || !questionBank || !diagnosisEngine || !assembly) {
      this.setData({ crop, month, positions, toast: '问诊模块加载失败：请看控制台 require 报错' });
      return;
    }

    const cached = wx.getStorageSync('question_progress_cache') || {};
    const followupKeys = Array.isArray(cached.followupKeys) ? cached.followupKeys : [];
    const needMore = Array.isArray(cached.needMore) ? cached.needMore : [];
    this.setData({ crop, month, positions, followupKeys, needMore });

    this.refreshPlanAndNextQuestion();
  },

  refreshPlanAndNextQuestion() {
    this.setData({ loading: true, toast: '' });

    try {
      // ✅ 诊断 report
      const report = (diagnosisEngine.run && diagnosisEngine.run({ answers: this.answers })) || {};

      // ✅ assembly 正确调用：assemble(answers, report, libraries)
      const libraries = { solutions, expertDictionary, treatmentPlans };
      const pkg = assembly.assemble ? assembly.assemble(this.answers, report, libraries) : null;

      if (pkg) wx.setStorageSync('latest_result_pkg', pkg);

      const nextSteps = (pkg && pkg.nextSteps) || {};
      const followupKeys = Array.isArray(nextSteps.followupKeys) ? nextSteps.followupKeys : [];
      const needMore = Array.isArray(nextSteps.needMore) ? nextSteps.needMore : [];

      wx.setStorageSync('question_progress_cache', { followupKeys, needMore });

      this.setData({ followupKeys, needMore, loading: false });

      this.advance();
    } catch (err) {
      console.error('[question] refreshPlan failed:', err);
      this.setData({
        loading: false,
        currentQuestion: null,
        selectedMap: {},
        toast: '诊断计算失败，可先看初步建议'
      });
    }
  },

  advance() {
    const { followupKeys, needMore } = this.data;

    let node = null;
    try {
      node = scheduler({
        answers: this.answers,
        followupKeys,
        needMore,
        askedKeys: this.askedKeys
      });
    } catch (e) {
      console.error('[question] scheduler failed:', e);
      node = null;
    }

    console.log('[question] scheduler node=', node);

    if (!node) {
      this.setData({ currentQuestion: null, selectedMap: {} });
      wx.navigateTo({ url: '/pages/result/result' });
      return;
    }

    this.currentNode = node;

    let q = null;
    try {
      q = questionBank.getQuestion ? questionBank.getQuestion(node.questionId, { crop: this.data.crop }) : null;
    } catch (e) {
      console.error('[question] questionBank.getQuestion failed:', e);
      q = null;
    }

    if (!q) {
      console.warn('[question] question not found for id=', node.questionId);
      this.currentNode = null;
      this.setData({ currentQuestion: null, selectedMap: {} });
      wx.navigateTo({ url: '/pages/result/result' });
      return;
    }

    // 记已问（scheduler 用 askedKeys 限制 3 题）
    if (node.key && !this.askedKeys.includes(node.key)) this.askedKeys.push(node.key);

    this.setData({ currentQuestion: q, selectedMap: {}, toast: '' });
  },

  onSelectOption(e) {
    const value = e.currentTarget.dataset.value;
    const q = this.data.currentQuestion;
    if (!q) return;

    if (q.type === 'single') {
      const selectedMap = {};
      selectedMap[value] = true;
      this.setData({ selectedMap });
      this.commitAnswer(value);
      return;
    }

    if (q.type === 'multi') {
      const selectedMap = Object.assign({}, this.data.selectedMap || {});
      selectedMap[value] = !selectedMap[value];
      this.setData({ selectedMap });
    }
  },

  onConfirmMulti() {
    const q = this.data.currentQuestion;
    if (!q || q.type !== 'multi') return;

    const selectedMap = this.data.selectedMap || {};
    const values = Object.keys(selectedMap).filter(k => !!selectedMap[k]);
    if (!values.length) {
      this.toast('请至少选择一项');
      return;
    }
    this.commitAnswer(values);
  },

  commitAnswer(value) {
    const node = this.currentNode;
    const q = this.data.currentQuestion;

    // ✅ answers 写入用题的 key（questionBank 里定义的 key）
    const key = (q && q.key) || (node && node.key);
    if (!key) {
      console.warn('[question] commitAnswer missing key');
      this.refreshPlanAndNextQuestion();
      return;
    }

    this.answers[key] = value;
    console.log('[question] commitAnswer key=', key, 'value=', value);

    this.currentNode = null;
    this.setData({ currentQuestion: null, selectedMap: {} });

    this.refreshPlanAndNextQuestion();
  },

  goResult() {
    wx.navigateTo({ url: '/pages/result/result' });
  },

  toast(msg) {
    this.setData({ toast: msg });
    setTimeout(() => {
      if (this.data.toast === msg) this.setData({ toast: '' });
    }, 1500);
  }
});
