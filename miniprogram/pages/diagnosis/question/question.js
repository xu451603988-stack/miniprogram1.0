// miniprogram/pages/diagnosis/question/question.js

const app = getApp();

Page({
  data: {
    // 模式：single（旧） / combined（新）
    mode: 'single',

    // 组合模式参数
    positions: [],         // ['leaf','fruit']
    stages: [],            // 真实执行顺序
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

    // 页面状态控制
    isInitialized: false, 
    progress: 0
  },

  // ---------------- 页面加载 ----------------
  onLoad(options) {
    console.log("【QuestionPage】收到参数:", options);

    const crop = options.crop || (app.globalData && app.globalData.currentCrop) || "citrus";
    const month = options.month ? parseInt(options.month) : (app.globalData && app.globalData.currentMonth) || (new Date().getMonth() + 1);

    if (options.mode === 'combined' && options.positions) {
      let positions = [];
      try {
        positions = JSON.parse(decodeURIComponent(options.positions));
      } catch (e) {
        console.error("【QuestionPage】positions 解析失败:", e);
      }
      if (!Array.isArray(positions) || positions.length === 0) {
        this.initSingleMode(options, crop, month);
        return;
      }
      this.initCombinedMode(positions, crop, month);
    } else {
      this.initSingleMode(options, crop, month);
    }
  },

  // ---------------- 单模块初始化 ----------------
  initSingleMode(options, crop, month) {
    const moduleType = options.position || options.moduleType || "leaf";

    this.setData(
      {
        mode: 'single',
        moduleType,
        selectedCrop: crop,
        month,
        answers: {},
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
        isInitialized: true,
        progress: file.length > 0 ? Math.round(100 / file.length) : 0
      },
      () => {
        this.syncUIWithCurrentQuestion();
      }
    );
  },

  // ---------------- 组合模式初始化 ----------------
  initCombinedMode(positions, crop, month) {
    console.log("【QuestionPage】[combined] 初始化，positions:", positions);

    const valid = positions.filter(p => p === 'leaf' || p === 'fruit');
    const stages = [...valid, 'root'];

    let leafQ = [], fruitQ = [], rootQ = [];
    try {
      leafQ  = require("../../../data/questionnaire/leaf_questions.js");
    } catch (e) { console.error("[combined] 加载 leaf_questions 失败", e); }
    try {
      fruitQ = require("../../../data/questionnaire/fruit_questions.js");
    } catch (e) { console.error("[combined] 加载 fruit_questions 失败", e); }
    try {
      rootQ  = require("../../../data/questionnaire/root_questions.js");
    } catch (e) { console.error("[combined] 加载 root_questions 失败", e); }

    const stageQuestions = {
      leaf: Array.isArray(leafQ) ? leafQ : [],
      fruit: Array.isArray(fruitQ) ? fruitQ : [],
      root: Array.isArray(rootQ) ? rootQ : []
    };

    this.setData(
      {
        mode: 'combined',
        positions: valid,
        stages,
        currentStageIndex: 0,
        currentStage: stages[0],
        stageQuestions,
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

  // 切换阶段
  switchStage(stageIndex) {
    const stages = this.data.stages;
    if (!stages || stageIndex < 0 || stageIndex >= stages.length) {
      console.warn("[combined] switchStage 参数异常:", stageIndex, stages);
      return;
    }

    const stage = stages[stageIndex];
    const qs = this.data.stageQuestions[stage] || [];
    const answers = this.data.stageAnswers[stage] || {};

    console.log(`[combined] 切换阶段 -> ${stage}，题目数: ${qs.length}`);

    this.setData(
      {
        currentStageIndex: stageIndex,
        currentStage: stage,
        questions: qs,
        totalQuestions: qs.length,
        currentQuestion: 0,
        answers: answers,
        currentAnswer: "",
        currentMultiAnswers: [],
        canGoNext: false,
        isInitialized: true,
        progress: qs.length > 0 ? Math.round(100 / qs.length) : 0
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
        canGoNext: false
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

    const progress = totalQuestions > 0 
      ? Math.round(((currentQuestion + 1) / totalQuestions) * 100)
      : 0;

    this.setData({
      currentAnswer,
      currentMultiAnswers,
      canGoNext,
      progress
    });
  },

  // ---------------- 选项处理：单选 (对应 WXML bindchange="onOptionSelect") ----------------
  onOptionSelect(e) {
    const qid = e.currentTarget.dataset.qid; // 获取题目 ID
    const value = e.detail.value; // 获取选中的值 (radio-group 标准)
    
    console.log("【QuestionPage】单选点击:", qid, value);

    const q = (this.data.questions || []).find(item => item.id === qid) || {};

    // 兼容写法：先拷贝对象，再赋值
    const newAnswers = Object.assign({}, this.data.answers);
    newAnswers[qid] = value;

    this.setData({
      answers: newAnswers,
      currentAnswer: value,
      currentMultiAnswers: [],
      canGoNext: !q.required || !!value
    });

    if (this.data.mode === 'combined') {
      const stage = this.data.currentStage;
      const stageAnswers = Object.assign({}, this.data.stageAnswers);
      stageAnswers[stage] = newAnswers;
      this.setData({ stageAnswers });
    }
  },

  // ---------------- 选项处理：多选 (对应 WXML bindchange="onOptionToggle") ----------------
  onOptionToggle(e) {
    const qid = e.currentTarget.dataset.qid; // 获取题目 ID
    const list = e.detail.value; // 获取选中的值数组 (checkbox-group 标准)

    console.log("【QuestionPage】多选切换:", qid, list);

    const q = (this.data.questions || []).find(item => item.id === qid) || {};

    // 兼容写法：先拷贝对象，再赋值
    const newAnswers = Object.assign({}, this.data.answers);
    newAnswers[qid] = list;

    this.setData({
      answers: newAnswers,
      currentAnswer: "",
      currentMultiAnswers: list,
      canGoNext: !q.required || list.length > 0
    });

    if (this.data.mode === 'combined') {
      const stage = this.data.currentStage;
      const stageAnswers = Object.assign({}, this.data.stageAnswers);
      stageAnswers[stage] = newAnswers;
      this.setData({ stageAnswers });
    }
  },

  // ---------------- 上一题 / 下一题 ----------------
  goBack(e) {
    this.prevQuestion(e);
  },

  prevQuestion(e) {
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

  nextQuestion(e) {
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

    // 根系快速判断逻辑（可选，视具体问卷第一题而定）
    if (stage === 'root' && qIndex === 0) {
      const rootAnswers = this.data.stageAnswers.root || this.data.answers || {};
      // 如果您的根系第一题不是 root_overall，请注释掉下面这段
      if (rootAnswers.root_overall === 'healthy') {
        this.submitDiagnosisCombined(true);
        return;
      }
    }

    // 继续本阶段
    if (qIndex < lastIndex) {
      this.setData(
        {
          currentQuestion: qIndex + 1
        },
        () => this.syncUIWithCurrentQuestion()
      );
      return;
    }

    // 切换下一阶段
    const stageIndex = this.data.currentStageIndex;
    const stages = this.data.stages;

    if (stageIndex < stages.length - 1) {
      this.switchStage(stageIndex + 1);
      return;
    }

    // 提交
    this.submitDiagnosisCombined(false);
  },

  // ---------------- 单模块提交 ----------------
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

    const url = `/pages/diagnosis/result/result?result=${encodeURIComponent(JSON.stringify(data))}`;
    console.log("【QuestionPage】[single] 跳转结果页:", url);
    wx.navigateTo({ url });
  },

  // ---------------- 组合模式提交 ----------------
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

    const finalData = {
      type: 'combined',
      payload,
      result: combinedResult
    };

    const url = `/pages/diagnosis/result/result?result=${encodeURIComponent(JSON.stringify(finalData))}`;
    console.log("[combined] 跳转结果页:", url);

    wx.navigateTo({ url });
  }
});