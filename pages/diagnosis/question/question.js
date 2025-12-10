// miniprogram/pages/diagnosis/question/question.js
const app = getApp();

Page({
  data: {
    // 模式：single（旧） / combined（新）
    mode: 'single',

    // 组合模式参数
    positions: [],         // ['leaf','fruit']
    stages: [],            // 真实执行顺序：如 ['leaf','fruit','root']
    currentStageIndex: 0,
    currentStage: 'leaf',  // 'leaf' | 'fruit' | 'root'

    // 各模块题目与答案
    stageQuestions: {
      leaf: [],
      fruit: [],
      root: []
    },
    stageAnswers: {
      leaf: {},
      fruit: {},
      root: {}
    },

    // 当前正在展示的这一段
    questions: [],
    currentQuestion: 0,
    totalQuestions: 0,

    // 当前题目的 UI 状态
    currentAnswer: "",
    currentMultiAnswers: [],
    canGoNext: false,

    // 单模块模式下使用的字段（兼容）
    moduleType: "leaf",
    answers: {},

    // 诊断上下文
    selectedCrop: "citrus",
    month: new Date().getMonth() + 1,

    // 是否已经完成初始化（控制 wxml 显示）
    isInitialized: false,

    // 进度条百分比
    progress: 0
  },

  // ---------------- 页面加载 ----------------
  onLoad(options) {
    console.log("【QuestionPage】收到参数:", options);

    const crop =
      options.crop ||
      (app.globalData && app.globalData.currentCrop) ||
      "citrus";

    const month = options.month
      ? parseInt(options.month)
      : (app.globalData && app.globalData.currentMonth) ||
        (new Date().getMonth() + 1);

    // 组合模式（多模块）优先
    if (options.mode === 'combined' && options.positions) {
      let positions = [];
      try {
        positions = JSON.parse(decodeURIComponent(options.positions));
      } catch (e) {
        console.error("【QuestionPage】positions 解析失败:", e);
      }

      if (!Array.isArray(positions) || positions.length === 0) {
        console.warn("【QuestionPage】positions 非法，回退到单模块模式");
        this.initSingleMode(options, crop, month);
        return;
      }

      this.initCombinedMode(positions, crop, month);
    } else {
      // 旧逻辑：单模块
      this.initSingleMode(options, crop, month);
    }
  },

  // ---------------- 单模块初始化（旧逻辑兼容） ----------------
  initSingleMode(options, crop, month) {
    const moduleType = options.position || options.moduleType || "leaf";

    this.setData(
      {
        mode: 'single',
        moduleType,
        selectedCrop: crop,
        month,
        isInitialized: false
      },
      () => {
        this.loadSingleModuleQuestions();
      }
    );
  },

  loadSingleModuleQuestions() {
    const type = this.data.moduleType;
    console.log("【QuestionPage】[single] 准备加载问卷，类型:", type);

    let file = [];
    try {
      if (type === "leaf") {
        file = require("../../../data/questionnaire/leaf_questions.js");
      } else if (type === "fruit") {
        file = require("../../../data/questionnaire/fruit_questions.js");
      } else if (type === "root") {
        file = require("../../../data/questionnaire/root_questions.js");
      } else {
        file = [];
      }
    } catch (err) {
      console.error("❌【QuestionPage】[single] 问卷加载失败:", err);
      file = [];
    }

    if (!Array.isArray(file)) file = [];

    this.setData(
      {
        questions: file,
        totalQuestions: file.length,
        currentQuestion: 0,
        answers: {},
        currentAnswer: "",
        currentMultiAnswers: [],
        canGoNext: false,
        isInitialized: true,
        progress: file.length > 0 ? Math.round(100 / file.length) : 0
      },
      () => {
        this.syncUIWithCurrentQuestion();
        console.log(`【QuestionPage】[single] 问卷加载成功，共 ${file.length} 题`);
      }
    );
  },

  // ---------------- 组合模式初始化 ----------------
  initCombinedMode(positions, crop, month) {
    console.log("【QuestionPage】[combined] 初始化，positions:", positions);

    const validPositions = positions.filter(p => p === 'leaf' || p === 'fruit');
    const stages = [...validPositions, 'root'];  // 根系必查

    let leafQ = [];
    let fruitQ = [];
    let rootQ = [];

    try {
      leafQ = require("../../../data/questionnaire/leaf_questions.js");
    } catch (e) {
      console.error("[combined] 叶片问卷加载失败:", e);
    }
    try {
      fruitQ = require("../../../data/questionnaire/fruit_questions.js");
    } catch (e) {
      console.error("[combined] 果实问卷加载失败:", e);
    }
    try {
      rootQ = require("../../../data/questionnaire/root_questions.js");
    } catch (e) {
      console.error("[combined] 根系问卷加载失败:", e);
    }

    this.setData(
      {
        mode: 'combined',
        positions: validPositions,
        stages,
        currentStageIndex: 0,
        currentStage: stages[0],

        stageQuestions: {
          leaf: Array.isArray(leafQ) ? leafQ : [],
          fruit: Array.isArray(fruitQ) ? fruitQ : [],
          root: Array.isArray(rootQ) ? rootQ : []
        },
        stageAnswers: {
          leaf: {},
          fruit: {},
          root: {}
        },

        selectedCrop: crop,
        month,
        isInitialized: false
      },
      () => {
        this.switchStage(0);
      }
    );
  },

  // ---------------- 切换阶段（叶片 / 果实 / 根系） ----------------
  switchStage(stageIndex) {
    const stages = this.data.stages || [];
    const stage = stages[stageIndex];
    const questions = (this.data.stageQuestions && this.data.stageQuestions[stage]) || [];
    const stageAnswers = this.data.stageAnswers || {};
    const answers = stageAnswers[stage] || {};

    console.log("【QuestionPage】[combined] 切换阶段:", stage);

    this.setData(
      {
        currentStageIndex: stageIndex,
        currentStage: stage,
        questions,
        currentQuestion: 0,
        totalQuestions: questions.length,
        answers,                 // 把该阶段已有答案灌进来
        currentAnswer: "",
        currentMultiAnswers: [],
        canGoNext: false,
        isInitialized: true,
        progress:
          questions.length > 0
            ? Math.round((1 / questions.length) * 100)
            : 0
      },
      () => {
        this.syncUIWithCurrentQuestion();
      }
    );
  },

  // ---------------- 同步当前题目 UI ----------------
  syncUIWithCurrentQuestion() {
    const { questions, currentQuestion, answers, totalQuestions } = this.data;
    const q = questions[currentQuestion];

    if (!q) {
      this.setData({
        currentAnswer: "",
        currentMultiAnswers: [],
        canGoNext: false,
        progress: 0
      });
      return;
    }

    const stored = answers[q.id];
    let currentAnswer = "";
    let currentMultiAnswers = [];
    let canGoNext = !q.required;

    if (q.type === "single") {
      currentAnswer = stored || "";
      canGoNext = !q.required || !!currentAnswer;
    } else if (q.type === "multiple" || q.type === "multi") {
      currentMultiAnswers = Array.isArray(stored) ? stored : [];
      canGoNext = !q.required || currentMultiAnswers.length > 0;
    }

    const progress =
      totalQuestions > 0
        ? Math.round(((currentQuestion + 1) / totalQuestions) * 100)
        : 0;

    this.setData({
      currentAnswer,
      currentMultiAnswers,
      canGoNext,
      progress
    });
  },

  // ---------------- 选中状态辅助方法 ----------------
  isSingleSelected(value) {
    const { questions, currentQuestion, currentAnswer, answers } = this.data;
    const q = questions[currentQuestion];
    if (!q) return false;

    const val = currentAnswer || answers[q.id];
    return val === value;
  },

  isMultiSelected(value) {
    const { questions, currentQuestion, currentMultiAnswers, answers } = this.data;
    const q = questions[currentQuestion];
    if (!q) return false;

    const list =
      currentMultiAnswers && currentMultiAnswers.length
        ? currentMultiAnswers
        : (Array.isArray(answers[q.id]) ? answers[q.id] : []);

    return list.includes(value);
  },

  // ---------------- 事件适配（WXML 老名字 → 新逻辑） ----------------
  onOptionSelect(e) {
    this.onSingleSelect(e);
  },

  onOptionToggle(e) {
    this.onMultiToggle(e);
  },

  goBack(e) {
    this.prevQuestion(e);
  },

  // ---------------- 选项逻辑：单选（修正版） ----------------
  onSingleSelect(e) {
    const questions = this.data.questions || [];
    const currentIndex = this.data.currentQuestion || 0;
    const currentQ = questions[currentIndex] || {};

    // 题目 id：优先用 data-qid，没有就用当前题目的 id
    const qid =
      (e.currentTarget &&
        e.currentTarget.dataset &&
        e.currentTarget.dataset.qid) ||
      currentQ.id ||
      "";

    // 选项值：优先用 e.detail.value（radio-group 的标准行为）
    const value =
      (e.detail && e.detail.value) ||
      (e.currentTarget &&
        e.currentTarget.dataset &&
        e.currentTarget.dataset.value) ||
      "";

    console.log("【QuestionPage】单选切换:", qid, value);

    const q = currentQ || {};

    const newAnswers = Object.assign({}, this.data.answers, {
      [qid]: value
    });

    this.setData({
      answers: newAnswers,
      currentAnswer: value,
      currentMultiAnswers: [],
      canGoNext: !q.required || !!value
    });

    // 组合模式下，同步到对应阶段
    if (this.data.mode === "combined") {
      const stage = this.data.currentStage;
      const stageAnswers = Object.assign({}, this.data.stageAnswers);
      stageAnswers[stage] = newAnswers;
      this.setData({ stageAnswers });
    }
  },

  // ---------------- 选项逻辑：多选（修正版） ----------------
  onMultiToggle(e) {
    const questions = this.data.questions || [];
    const currentIndex = this.data.currentQuestion || 0;
    const currentQ = questions[currentIndex] || {};

    const qid =
      (e.currentTarget &&
        e.currentTarget.dataset &&
        e.currentTarget.dataset.qid) ||
      currentQ.id ||
      "";

    const q = currentQ || {};

    // checkbox-group 的 bindchange 返回所有勾选值数组
    const listRaw = (e.detail && e.detail.value) || [];
    const list = Array.isArray(listRaw) ? listRaw : [];

    console.log("【QuestionPage】多选切换:", qid, list);

    const newAnswers = Object.assign({}, this.data.answers, {
      [qid]: list
    });

    this.setData({
      answers: newAnswers,
      currentAnswer: "",
      currentMultiAnswers: list,
      canGoNext: !q.required || list.length > 0
    });

    if (this.data.mode === "combined") {
      const stage = this.data.currentStage;
      const stageAnswers = Object.assign({}, this.data.stageAnswers);
      stageAnswers[stage] = newAnswers;
      this.setData({ stageAnswers });
    }
  },

  // ---------------- 上一题 / 下一题（外部事件名保持不变） ----------------
  prevQuestion() {
    if (this.data.currentQuestion <= 0) return;

    const newIndex = this.data.currentQuestion - 1;
    this.setData(
      {
        currentQuestion: newIndex
      },
      () => {
        this.syncUIWithCurrentQuestion();
      }
    );
  },

  nextQuestion() {
    if (this.data.mode === 'single') {
      this.handleNextSingle();
    } else {
      this.handleNextCombined();
    }
  },

  // -------- 单模块下一题 / 提交 --------
  handleNextSingle() {
    if (!this.data.canGoNext) {
      wx.showToast({ title: "请完成当前题目", icon: "none" });
      return;
    }

    const lastIndex = this.data.totalQuestions - 1;

    if (this.data.currentQuestion >= lastIndex) {
      this.submitDiagnosisSingle();
      return;
    }

    const newIndex = this.data.currentQuestion + 1;

    this.setData(
      {
        currentQuestion: newIndex
      },
      () => {
        this.syncUIWithCurrentQuestion();
      }
    );
  },

  // -------- 组合模式下一题 / 切阶段 / 提交 --------
  handleNextCombined() {
    if (!this.data.canGoNext) {
      wx.showToast({ title: "请完成当前题目", icon: "none" });
      return;
    }

    const qIndex = this.data.currentQuestion;
    const lastIndex = this.data.totalQuestions - 1;
    const stage = this.data.currentStage;

    // 根系快速判断逻辑：假设 root_questions 第一道题 id = 'root_overall'
    if (stage === 'root' && qIndex === 0) {
      const rootAnswers = this.data.stageAnswers.root || this.data.answers || {};
      const overall = rootAnswers.root_overall;
      if (overall === 'healthy') {
        console.log("[combined] 根系整体健康，跳过后续根题，直接提交");
        this.submitDiagnosisCombined(true);
        return;
      }
    }

    // 当前阶段未结束 → 继续本阶段
    if (qIndex < lastIndex) {
      this.setData(
        {
          currentQuestion: qIndex + 1
        },
        () => {
          this.syncUIWithCurrentQuestion();
        }
      );
      return;
    }

    // 当前阶段已经结束 → 看看是否还有下一个阶段
    const stageIndex = this.data.currentStageIndex;
    const stages = this.data.stages || [];

    if (stageIndex < stages.length - 1) {
      this.switchStage(stageIndex + 1);
      return;
    }

    // 已经是最后一个阶段的最后一题 → 提交综合诊断
    this.submitDiagnosisCombined(false);
  },

  // ---------------- 单模块提交：沿用旧逻辑 ----------------
  submitDiagnosisSingle() {
    const data = {
      module: this.data.moduleType,
      crop: this.data.selectedCrop,
      month: this.data.month,
      answers: this.data.answers
    };

    const engine = app.globalData && app.globalData.diagnosticEngine;

    try {
      if (engine && typeof engine.run === "function") {
        const finalCode = engine.run(data) || "";
        data.finalCode = finalCode;
      } else {
        data.finalCode = "";
      }
    } catch (e) {
      console.error("【QuestionPage】[single] 调用引擎出错:", e);
      data.finalCode = "";
    }

    const url = `/pages/diagnosis/result/result?result=${encodeURIComponent(
      JSON.stringify(data)
    )}`;
    console.log("【QuestionPage】[single] 跳转结果页:", url);
    wx.navigateTo({ url });
  },

  // ---------------- 组合模式提交：调用 runCombined ----------------
  submitDiagnosisCombined(rootSkipped) {
    const engine = app.globalData && app.globalData.diagnosticEngine;
    if (!engine || typeof engine.runCombined !== 'function') {
      console.error("[combined] 诊断引擎 runCombined 不可用");
      wx.showModal({
        title: '诊断失败',
        content: '诊断引擎不可用，请联系技术人员。',
        showCancel: false
      });
      return;
    }

    const payload = {
      positions: this.data.positions,
      crop: this.data.selectedCrop,
      month: this.data.month,
      answers: {
        leaf: this.data.stageAnswers.leaf || {},
        fruit: this.data.stageAnswers.fruit || {},
        root: this.data.stageAnswers.root || {}
      },
      rootQuick: (this.data.stageAnswers.root || {}).root_overall || null
    };

    console.log("[combined] 提交诊断 payload:", payload);

    let combinedResult = {};
    try {
      combinedResult = engine.runCombined(payload);
    } catch (e) {
      console.error("[combined] runCombined 出错:", e);
      wx.showModal({
        title: '诊断失败',
        content: '诊断算法执行出错，请稍后重试。',
        showCancel: false
      });
      return;
    }

    // 把原始 payload 带过去备用
    const finalData = {
      type: 'combined',
      payload,
      result: combinedResult
    };

    const url = `/pages/diagnosis/result/result?result=${encodeURIComponent(
      JSON.stringify(finalData)
    )}`;
    console.log("[combined] 跳转结果页:", url);

    wx.navigateTo({ url });
  }
});
