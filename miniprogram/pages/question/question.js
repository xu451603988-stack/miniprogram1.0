/**
 * miniprogram/pages/question/question.js
 *
 * 目标：
 * 1) 不依赖 createBaseCursor（你当前 scheduler 没这个 API）
 * 2) 进入页面立即：engine.run -> assemble -> scheduler 出第一题
 * 3) commitAnswer：单选 string，多选 array（防止 ["xxx"] 导致规则永远不命中）
 * 4) 所有 require 必须是字面量 + try/catch（避免 “module is not defined”）
 */

const app = getApp();

let scheduler = null;
let questionBank = null;
let diagnosisEngine = null;
let assemblyIndex = null;

try { scheduler = require('../../domain/questionnaire/scheduler'); } catch (e) { console.warn('[question] require scheduler fail', e); }
try { questionBank = require('../../domain/questionnaire/questionBank'); } catch (e) { console.warn('[question] require questionBank fail', e); }
try { diagnosisEngine = require('../../domain/diagnosisEngine'); } catch (e) { console.warn('[question] require diagnosisEngine fail', e); }
try { assemblyIndex = require('../../domain/assembly/index'); } catch (e) { console.warn('[question] require assembly/index fail', e); }

function getQuestionById(qid) {
  if (!questionBank) return null;
  if (typeof questionBank.getQuestion === 'function') return questionBank.getQuestion(qid);
  return questionBank[qid] || null;
}

function assemblePkg(answers, report) {
  if (!assemblyIndex) return {};
  // 兼容不同导出
  if (typeof assemblyIndex.assemble === 'function') {
    return assemblyIndex.assemble(answers, report, { solutions: app?.globalData?.solutions });
  }
  if (typeof assemblyIndex.assembleDiagnosisPackage === 'function') {
    return assemblyIndex.assembleDiagnosisPackage(answers, report, { solutions: app?.globalData?.solutions });
  }
  // assembly/index 直接导出函数的情况
  if (typeof assemblyIndex === 'function') {
    return assemblyIndex(answers, report, { solutions: app?.globalData?.solutions });
  }
  return {};
}

function runEngine(answers) {
  if (!diagnosisEngine) return {};
  if (typeof diagnosisEngine.run === 'function') return diagnosisEngine.run(answers) || {};
  if (typeof diagnosisEngine.runCombined === 'function') return diagnosisEngine.runCombined(answers) || {};
  return {};
}

Page({
  data: {
    crop: 'citrus',
    month: 1,
    positions: [],

    currentQuestion: null,

    // 高亮
    selectedSingle: null,
    selectedMulti: [],

    toast: '',
  },

  // 运行态
  answers: {},
  askedKeys: [],

  onLoad(options) {
    const crop = options.crop || 'citrus';
    const month = Number(options.month || 1);

    let positions = [];
    if (options.positions) {
      try {
        positions = Array.isArray(options.positions)
          ? options.positions
          : String(options.positions).split(',').filter(Boolean);
      } catch (e) {}
    }

    console.log('[question][onLoad] crop/month/positions=', crop, month, positions);

    // 初始化 answers（非常关键：没有它，engine 很可能走默认）
    this.answers = { crop, month, positions };

    // 恢复 session（如果你希望断点续答）
    try {
      const cached = wx.getStorageSync('latest_diagnosis_session') || {};
      const cachedAnswers = cached.answers || {};
      this.answers = Object.assign({}, this.answers, cachedAnswers);

      this.askedKeys = Array.isArray(cached.askedKeys) ? cached.askedKeys.slice() : [];

      console.log('[question][onLoad] cached followupKeys=', cached.followupKeys || []);
      console.log('[question][onLoad] cached needMore=', cached.needMore || []);
    } catch (e) {}

    this.setData({ crop, month, positions });

    // 出第一题
    this.refreshPlanAndNextQuestion();
  },

  refreshPlanAndNextQuestion() {
    const answers = this.answers || {};

    // 1) 引擎输出 report
    const report = runEngine(answers);

    // 2) 组装 pkg（翻译出 followupKeys / needMore / summary / steps）
    const pkg = assemblePkg(answers, report) || {};
    const followupKeys = pkg?.nextSteps?.followupKeys || [];
    const needMore = pkg?.nextSteps?.needMore || [];

    // 3) 缓存 session
    try {
      wx.setStorageSync('latest_diagnosis_session', {
        answers,
        askedKeys: this.askedKeys,
        followupKeys,
        needMore,
      });
    } catch (e) {}

    // 4) scheduler 决策下一题
    const node = (typeof scheduler === 'function')
      ? scheduler({
          answers,
          followupKeys,
          needMore,
          askedKeys: this.askedKeys,
        })
      : null;

    console.log('[question] scheduler node=', node);

    if (!node) {
      this.finishAndGoResult(pkg);
      return;
    }

    const qid = node.questionId || node.key;
    const q = getQuestionById(qid);

    if (!q) {
      console.warn('[question] question not found:', qid);
      this.finishAndGoResult(pkg);
      return;
    }

    // 防止重复问
    const k = q.key || q.id || node.key;
    if (k && answers[k] !== undefined) {
      if (!this.askedKeys.includes(k)) this.askedKeys.push(k);
      this.refreshPlanAndNextQuestion();
      return;
    }

    if (k && !this.askedKeys.includes(k)) this.askedKeys.push(k);

    this.setData({
      currentQuestion: q,
      selectedSingle: null,
      selectedMulti: [],
      toast: '',
    });
  },

  finishAndGoResult(pkg) {
    console.log('[question] diagnosis finished');

    try {
      wx.setStorageSync('latest_result_pkg', pkg);
      const steps = pkg?.primarySection?.actions?.steps;
      const stepsCount = Array.isArray(steps) ? steps.length : 0;
      console.log('[question] saved pkg key=latest_result_pkg steps=', stepsCount);
    } catch (e) {
      console.warn('[question] save latest_result_pkg fail', e);
    }

    wx.redirectTo({
      url: '/pages/result/result',
      success: () => console.log('[question] redirectTo result ok'),
      fail: (e) => console.warn('[question] redirectTo result fail', e),
    });
  },

  // 点击选项
  onSelectOption(e) {
    const q = this.data.currentQuestion;
    if (!q) return;

    const opt = e.currentTarget.dataset.opt;
    const value = e.currentTarget.dataset.value;
    const v = (opt && opt.value !== undefined) ? opt.value : value;

    // 单选：点即提交
    if (q.type === 'single') {
      this.setData({ selectedSingle: v });
      this.commitAnswer(q, v);
      return;
    }

    // 多选：先切换
    if (q.type === 'multi') {
      const cur = Array.isArray(this.data.selectedMulti) ? this.data.selectedMulti.slice() : [];
      const idx = cur.indexOf(v);
      if (idx >= 0) cur.splice(idx, 1);
      else cur.push(v);
      this.setData({ selectedMulti: cur });
    }
  },

  // 多选确认按钮
  onConfirmMulti() {
    const q = this.data.currentQuestion;
    if (!q || q.type !== 'multi') return;

    const vals = Array.isArray(this.data.selectedMulti) ? this.data.selectedMulti : [];
    if (!vals.length) {
      this.toast('请至少选择一项');
      return;
    }

    this.commitAnswer(q, vals);
  },

  // ✅ 关键：单选必须是 string，多选才是 array
  commitAnswer(q, value) {
    const key = q.key || q.id;
    if (!key) return;

    let v = value;

    // 单选数组压平（防止 ["xxx"]）
    if (q.type === 'single' && Array.isArray(v) && v.length === 1) v = v[0];

    this.answers[key] = v;

    console.log('[question] commitAnswer key=', key, 'value=', v);

    this.setData({
      currentQuestion: null,
      selectedSingle: null,
      selectedMulti: [],
    });

    this.refreshPlanAndNextQuestion();
  },

  toast(msg) {
    this.setData({ toast: msg });
    setTimeout(() => {
      if (this.data.toast === msg) this.setData({ toast: '' });
    }, 1500);
  }
});
