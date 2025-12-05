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

    const moduleType = (options.position || "leaf").toLowerCase();
    const month = options.month ? parseInt(options.month) : this.data.month;

    this.setData(
      { moduleType, month },
      () => this.loadQuestionsFromJSON()
    );
  },

  // ===============================
  //   自动加载问卷 JSON（已修复路径）
  // ===============================
  loadQuestionsFromJSON() {
    const type = this.data.moduleType;

    const PATH_MAP = {
      leaf: "../../../data/questionnaire/leaf_questions.json",
      fruit: "../../../data/questionnaire/fruit_questions.json",
      root: "../../../data/questionnaire/root_questions.json"
    };

    const jsonPath = PATH_MAP[type];

    console.log("【QuestionPage】加载问卷文件:", jsonPath);

    let questionFile = null;

    try {
      // ⭐ 小程序 require = 必须是相对路径
      questionFile = require(jsonPath);
    } catch (err) {
      console.error("❌【QuestionPage】问卷加载失败:", err);

      wx.showModal({
        title: "问卷加载失败",
        content: `JSON 文件加载失败：${jsonPath}\n请检查文件是否存在以及 JSON 格式是否正确。`,
        showCancel: false
      });

      // fallback 避免白屏
      questionFile = [{
        id: "fallback",
        title: "问卷加载失败，请检查 JSON 文件路径。",
        type: "single",
        required: true,
        options: [{ label: "我知道了", value: "ok" }]
      }];
    }

    this.setData(
      {
        questions: questionFile,
        totalQuestions: questionFile.length,
        currentQuestion: 0,
        progress: 0,
        answers: {},
        isInitialized: true
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

        console.log(`【QuestionPage】问卷加载成功，共 ${questionFile.length} 题`);
      }
    );
  },

  // ===============================
  //   单选
  // ===============================
  isSingleChecked(questionId, value) {
    return this.data.answers[questionId] === value;
  },

  onSingleSelect(e) {
    const qid = e.currentTarget.dataset.qid;
    const value = e.currentTarget.dataset.value;

    this.setData({
      [`answers.${qid}`]: value
    });
  },

  // ===============================
  //   多选
  // ===============================
  isMultiChecked(questionId, value) {
    const arr = this.data.answers[questionId] || [];
    return arr.includes(value);
  },

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

  // ===============================
  //   导航
  // ===============================
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

  nextQuestion() {
    const q = this.data.questions[this.data.currentQuestion];
    const answer = this.data.answers[q.id];

    if (q.required && (!answer || (Array.isArray(answer) && answer.length === 0))) {
      wx.showToast({ title: "请完成当前题目", icon: "none" });
      return;
    }

    if (this.data.currentQuestion >= this.data.totalQuestions - 1) {
      this.submitDiagnosis();
      return;
    }

    const newIndex = this.data.currentQuestion + 1;

    this.setData({
      currentQuestion: newIndex,
      progress: (newIndex / this.data.totalQuestions) * 100
    });
  },

  // ===============================
  //   数据构建 + 跳转
  // ===============================
  buildDiagnosticData() {
    return {
      crop: this.data.selectedCrop,
      month: this.data.month,
      module: this.data.moduleType,
      answers: this.data.answers
    };
  },

  submitDiagnosis() {
    wx.showLoading({ title: "智能分析中...", mask: true });

    const data = this.buildDiagnosticData();

    wx.hideLoading();

    const url = `/pages/diagnosis/result/result?result=${encodeURIComponent(
      JSON.stringify(data)
    )}`;

    wx.navigateTo({ url });
  }
});
