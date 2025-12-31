// miniprogram/pages/question/question.js
const app = getApp();

const scheduler = require('../../domain/questionnaire/scheduler');
const questionBank = require('../../domain/questionnaire/questionBank');

const orchestrator = require('../../domain/orchestrator/diagnosisEngine.js');
const AssemblyMod = require('../../domain/assembly/index.js');
const assemble = (AssemblyMod && typeof AssemblyMod.assemble === 'function')
  ? AssemblyMod.assemble
  : AssemblyMod;

const solutions = require('../../domain/solutions/index.js');
const expertDictionary = require('../../domain/dictionary/expertDictionary.js');
const treatmentPlans = require('../../domain/dictionary/treatmentPlans.js');

const fruitQuestions = require('../../data/questionnaire/fruit_questions.js');
const leafQuestions = require('../../data/questionnaire/leaf_questions.js');
const rootQuestions = require('../../data/questionnaire/root_questions.js');

function parseCSV(v) {
  if (!v) return [];
  return String(v).split(',').map(s => s.trim()).filter(Boolean);
}

function buildSelectedMapFromValue(value) {
  const map = {};
  if (Array.isArray(value)) value.forEach(v => { map[v] = true; });
  else if (value !== undefined && value !== null) map[value] = true;
  return map;
}

// 归一题型：leaf_questions 里是 multiple；wxml 只认 multi
function normalizeQuestion(q) {
  if (!q) return q;
  const type = (q.type === 'multiple') ? 'multi' : q.type;
  return { ...q, type };
}

function pickBaseBank(positions = []) {
  // branch 暂无题库，先当 leaf 处理
  if (positions.includes('fruit')) return fruitQuestions;
  if (positions.includes('leaf')) return leafQuestions;
  if (positions.includes('root')) return rootQuestions;
  if (positions.includes('branch')) return leafQuestions;
  return leafQuestions;
}

function compactPkg(fullPkg) {
  if (!fullPkg) return null;
  return {
    meta: fullPkg.meta,
    summary: fullPkg.summary,
    primarySection: fullPkg.primarySection,
    riskSection: fullPkg.riskSection,
    alternativesSection: fullPkg.alternativesSection,
    nextSteps: fullPkg.nextSteps
  };
}

Page({
  data: {
    // 渲染
    currentQuestion: null,
    selectedMap: {},

    // 答案与调度
    answers: {},
    askedKeys: [],

    // base 问卷链路
    stage: 'base',          // 'base' | 'followup'
    baseBank: null,
    baseNodeId: 'start',

    // followup 追问输入
    followupKeys: [],
    needMore: [],

    // 上下文
    crop: 'citrus',
    month: new Date().getMonth() + 1,
    positions: []
  },

  onLoad(options = {}) {
    const crop = options.crop ? decodeURIComponent(options.crop) : 'citrus';
    const month = options.month ? Number(decodeURIComponent(options.month)) : (new Date().getMonth() + 1);
    const positions = options.positions ? parseCSV(decodeURIComponent(options.positions)) : [];

    // 新一轮从 positionSelect 进来通常会清空缓存，这里再兜底一次
    const answers = wx.getStorageSync('last_diagnosis_answers') || {};
    answers.crop = crop;
    answers.month = month;
    answers.positions = positions;

    const baseBank = pickBaseBank(positions);

    this.setData({
      crop, month, positions,
      answers,
      askedKeys: [],
      stage: 'base',
      baseBank,
      baseNodeId: 'start',
      followupKeys: wx.getStorageSync('last_followup_keys') || [],
      needMore: wx.getStorageSync('last_need_more') || []
    });

    wx.setStorageSync('last_diagnosis_answers', answers);
    wx.setStorageSync('answers', answers);

    this.loadNextQuestion();
  },

  loadNextQuestion() {
    if (this.data.stage === 'base') {
      this.loadBaseQuestion();
    } else {
      this.loadFollowupQuestion();
    }
  },

  // ========== base 问卷 ==========
  loadBaseQuestion() {
    const { baseBank, baseNodeId, answers } = this.data;
    const node = baseBank && baseBank[baseNodeId];

    if (!node) {
      // base 题库异常：直接尝试结算
      this.finishAndMaybeFollowup();
      return;
    }

    const q = normalizeQuestion(node);
    const existing = answers[q.id];
    this.setData({
      currentQuestion: q,
      selectedMap: buildSelectedMapFromValue(existing)
    });
  },

  advanceBaseNode(chosenValue) {
    const q = this.data.currentQuestion;
    const bank = this.data.baseBank;

    const v = Array.isArray(chosenValue) ? chosenValue[0] : chosenValue;
    const opt = (q.options || []).find(o => o.value === v);

    // 没找到 next / 或 isEnd 就结束 base
    if (!opt || opt.isEnd || !opt.next || !bank[opt.next]) {
      this.finishAndMaybeFollowup();
      return;
    }

    this.setData({ baseNodeId: opt.next });
    this.loadNextQuestion();
  },

  // ========== followup 追问 ==========
  loadFollowupQuestion() {
    const { answers, followupKeys, needMore, askedKeys } = this.data;

    const next = scheduler({
      answers,
      followupKeys,
      needMore,
      askedKeys
    });

    if (!next || !next.questionId) {
      // 追问也结束了，直接进结果页
      this.goResult();
      return;
    }

    const q0 = questionBank.getQuestion(next.questionId);
    const q = normalizeQuestion(q0);

    if (!q) {
      this.goResult();
      return;
    }

    const existing = (answers[q.key] !== undefined) ? answers[q.key] : answers[q.id];

    this.setData({
      currentQuestion: q,
      selectedMap: buildSelectedMapFromValue(existing),
      askedKeys: askedKeys.concat(next.key)
    });
  },

  // ========== wxml 事件 ==========
  // bindtap="onSelectOption"
  onSelectOption(e) {
    const value = e.currentTarget.dataset.value;
    const q = this.data.currentQuestion;
    if (!q || value === undefined) return;

    // 单选：立即提交
    if (q.type === 'single') {
      this.setData({ selectedMap: { [value]: true } });
      this.commitAnswer(value);

      if (this.data.stage === 'base') {
        this.advanceBaseNode(value);
      } else {
        // followup：每答一次就刷新 pkg / followupKeys，保证闭环
        this.finishAndMaybeFollowup(true);
      }
      return;
    }

    // 多选：toggle，点“下一步”再提交
    if (q.type === 'multi') {
      const selectedMap = { ...(this.data.selectedMap || {}) };

      if (value === 'unknown') {
        this.setData({ selectedMap: { unknown: true } });
        return;
      }
      if (selectedMap.unknown) delete selectedMap.unknown;

      if (selectedMap[value]) delete selectedMap[value];
      else selectedMap[value] = true;

      const chosen = Object.keys(selectedMap).filter(k => selectedMap[k]);
      if (chosen.length > 2) {
        wx.showToast({ title: '最多选择 2 项', icon: 'none' });
        delete selectedMap[value];
      }

      this.setData({ selectedMap });
    }
  },

  // bindtap="onConfirmMulti"
  onConfirmMulti() {
    const q = this.data.currentQuestion;
    if (!q || q.type !== 'multi') return;

    const selectedMap = this.data.selectedMap || {};
    const values = Object.keys(selectedMap).filter(k => selectedMap[k]);

    if (values.length === 0) {
      wx.showToast({ title: '请至少选择 1 项', icon: 'none' });
      return;
    }

    this.commitAnswer(values);

    if (this.data.stage === 'base') {
      this.advanceBaseNode(values);
    } else {
      this.finishAndMaybeFollowup(true);
    }
  },

  // 提交答案：base 用 q.id；followup 用 q.key + q.id 双写
  commitAnswer(value) {
    const q = this.data.currentQuestion;
    const answers = { ...(this.data.answers || {}) };

    if (this.data.stage === 'base') {
      // base 问卷用 node.id
      answers[q.id] = value;
    } else {
      // followup 问卷：id + key 双写
      if (q.key) answers[q.key] = value;
      if (q.id && q.id !== q.key) answers[q.id] = value;
    }

    this.setData({ answers });
    app.globalData.diagnosisAnswers = answers;

    wx.setStorageSync('last_diagnosis_answers', answers);
    wx.setStorageSync('answers', answers);
  },

  /**
   * base 结束 或 followup 每答一次：都走一次 “结算+更新followupKeys”
   * @param {boolean} fromFollowup 是否来自追问阶段
   */
  finishAndMaybeFollowup(fromFollowup = false) {
    const answers =
      this.data.answers ||
      wx.getStorageSync('last_diagnosis_answers') ||
      wx.getStorageSync('answers') ||
      {};

    if (!answers || Object.keys(answers).length === 0) {
      wx.showToast({ title: '缺少问卷答案', icon: 'none' });
      return;
    }

    // 1) 诊断 & assemble
    let report, fullPkg, pkg;
    try {
      report = orchestrator.run(answers);
      fullPkg = assemble(answers, report, { solutions, expertDictionary, treatmentPlans });
      pkg = compactPkg(fullPkg);

      wx.setStorageSync('last_assembly_package', pkg);
      wx.setStorageSync('last_diagnosis_pkg', pkg);
      wx.setStorageSync('last_diagnosis_answers', answers);
      wx.setStorageSync('answers', answers);
    } catch (e) {
      console.error('[question] finish failed:', e);
      // 结算失败：直接进结果页（结果页会自己算一次）
      this.goResult();
      return;
    }

    // 2) 拿 followupKeys
    const nextSteps = pkg && pkg.nextSteps ? pkg.nextSteps : {};
    const followupKeys = Array.isArray(nextSteps.followupKeys) ? nextSteps.followupKeys : [];
    const needMore = Array.isArray(nextSteps.needMore) ? nextSteps.needMore : [];

    wx.setStorageSync('last_followup_keys', followupKeys);
    wx.setStorageSync('last_need_more', needMore);

    // 3) base -> followup（有缺口就继续问），否则结果页
    if (followupKeys.length > 0 || needMore.length > 0) {
      this.setData({
        stage: 'followup',
        followupKeys,
        needMore
      });
      this.loadNextQuestion();
      return;
    }

    // 没缺口：直接结果页
    this.goResult();
  },

  goResult() {
    wx.redirectTo({ url: '/pages/result/result' });
  }
});
