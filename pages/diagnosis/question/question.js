// miniprogram/pages/diagnosis/question/question.js

Page({
  data: {
    currentQuestion: 0,
    questions: [],
    answers: {},
    totalQuestions: 0,
    progress: 0,
    isInitialized: false,
    moduleType: "leaf", // leaf / fruit / root
    selectedCrop: "citrus",
    month: new Date().getMonth() + 1
  },

  onLoad(options) {
    console.log("【QuestionPage】收到参数:", options);

    const moduleType = options.position || "leaf";
    const month = options.month ? parseInt(options.month) : this.data.month;

    this.setData(
      {
        moduleType,
        month
      },
      () => {
        this.loadQuestionsFromJSON();
      }
    );
  },

  // 加载不同模块的 JSON 文件
  loadQuestionsFromJSON() {
    const type = this.data.moduleType;

    let jsonPath = "";

    if (type === "leaf") {
      jsonPath = "/data/questionnaire/leaf_questions.json";
    } else if (type === "fruit") {
      jsonPath = "/data/questionnaire/fruit_questions.json";
    } else if (type === "root") {
      jsonPath = "/data/questionnaire/root_questions.json";
    }

    console.log("【QuestionPage】加载问卷文件:", jsonPath);

    const file = require(`../../../..${jsonPath}`);

    this.setData(
      {
        questions: file,
        totalQuestions: file.length,
        currentQuestion: 0,
        progress: 0,
        answers: {}
      },
      () => {
        wx.setNavigationBarTitle({
          title:
            type === "leaf"
              ? "叶片诊断问卷"
              : type === "fruit"
              ? "果实诊断问卷"
              : "根系诊断问卷"
        });

        this.setData({ isInitialized: true });

        console.log("【QuestionPage】问卷加载完成:", file);
      }
    );
  },

  // 检查是否选中（单选）
  isSingleChecked(questionId, value) {
    return this.data.answers[questionId] === value;
  },

  // 检查是否选中（多选）
  isMultiChecked(questionId, value) {
    const arr = this.data.answers[questionId] || [];
    return arr.includes(value);
  },

  // 处理单选
  onSingleSelect(e) {
    const qid = e.currentTarget.dataset.qid;
    const value = e.currentTarget.dataset.value;

    this.setData({
      [`answers.${qid}`]: value
    });
  },

  // 处理多选
  onMultiToggle(e) {
    const qid = e.currentTarget.dataset.qid;
    const value = e.currentTarget.dataset.value;

    let current = this.data.answers[qid] || [];

    if (current.includes(value)) {
      current = current.filter((v) => v !== value);
    } else {
      current.push(value);
    }

    this.setData({
      [`answers.${qid}`]: current
    });
  },

  // 上一题
  goBack() {
    if (this.data.currentQuestion === 0) {
      wx.navigateBack();
      return;
    }

    const newIndex = this.data.currentQuestion - 1;

    this.setData({
      currentQuestion: newIndex,
      progress: (newIndex / this.data.totalQuestions) * 100
    });
  },

  // 下一题或提交
  nextQuestion() {
    const q = this.data.questions[this.data.currentQuestion];
    const answer = this.data.answers[q.id];

    // 必填校验
    if (q.required && (!answer || (Array.isArray(answer) && answer.length === 0))) {
      wx.showToast({ title: "请完成当前题目", icon: "none" });
      return;
    }

    // 最后一题 → 提交
    if (this.data.currentQuestion >= this.data.totalQuestions - 1) {
      this.submitDiagnosis();
      return;
    }

    // 下一题
    const newIndex = this.data.currentQuestion + 1;

    this.setData({
      currentQuestion: newIndex,
      progress: (newIndex / this.data.totalQuestions) * 100
    });
  },

  // 构建诊断数据
  buildDiagnosticData() {
    return {
      crop: this.data.selectedCrop,
      month: this.data.month,
      module: this.data.moduleType,
      answers: this.data.answers
    };
  },

  // 提交诊断
  submitDiagnosis() {
    wx.showLoading({ title: "智能分析中...", mask: true });

    const data = this.buildDiagnosticData();

    console.log("【QuestionPage】提交诊断数据:", data);

    wx.hideLoading();

    const url = `/pages/diagnosis/result/result?result=${encodeURIComponent(
      JSON.stringify(data)
    )}`;

    console.log("【QuestionPage】跳转结果页:", url);

    wx.navigateTo({ url });
  }
});
