// miniprogram/pages/diagnosis/question/question.js
const config = require('../../../utils/questionConfig.js');
const app = getApp();

Page({
  data: {
    currentStepIndex: 0, // 当前步骤 (0: 根土, 1: 茎叶, 2: 环境)
    stepTitle: "",       // 当前步骤标题
    progress: 0,         // 进度条 (0-100)
    currentQuestions: [],// 当前页面显示的题目列表
    answers: {},         // 存放用户选择的答案 { root_smell: 'sour', ... }
    isLastStep: false    // 是否是最后一步
  },

  onLoad(options) {
    // 初始化第一步
    this.initStep(0);
  },

  /**
   * 初始化指定步骤的题目
   */
  initStep(index) {
    const stepKey = `step${index + 1}`; // step1, step2, step3
    const questions = config[stepKey];
    const title = config.steps[index];

    if (!questions) {
      console.error("未找到步骤配置:", stepKey);
      return;
    }

    // 计算进度
    const progress = Math.round(((index + 1) / config.steps.length) * 100);

    this.setData({
      currentStepIndex: index,
      stepTitle: title,
      currentQuestions: questions,
      progress: progress,
      isLastStep: index === config.steps.length - 1
    });

    // 页面滚动回顶部
    if (wx.pageScrollTo) {
      wx.pageScrollTo({ scrollTop: 0 });
    }
  },

  /**
   * 用户点击选项
   */
  selectOption(e) {
    const { id, value } = e.currentTarget.dataset;
    
    // 1. 更新答案数据
    const newAnswers = { ...this.data.answers, [id]: value };
    
    // 2. 更新视图选中状态 (为了让UI显示高亮)
    this.setData({
      answers: newAnswers
    });

    // 可选：如果是单选题且当前步骤只有一个问题，可以自动跳下一题
    // 但考虑到"中医诊断"需要慎重，建议让用户手动点"下一步"
  },

  /**
   * 点击"下一步"
   */
  onNext() {
    // 1. 验证当前步骤是否已填完
    if (!this.validateCurrentStep()) {
      return;
    }

    // 2. 进入下一步
    if (!this.data.isLastStep) {
      this.initStep(this.data.currentStepIndex + 1);
    } else {
      this.submitDiagnosis();
    }
  },

  /**
   * 点击"上一步"
   */
  onPrev() {
    if (this.data.currentStepIndex > 0) {
      this.initStep(this.data.currentStepIndex - 1);
    } else {
      wx.navigateBack();
    }
  },

  /**
   * 验证逻辑：必填项检查
   */
  validateCurrentStep() {
    const currentQ = this.data.currentQuestions;
    const currentAns = this.data.answers;

    for (let q of currentQ) {
      if (!currentAns[q.id]) {
        wx.showToast({
          title: '请回答所有问题',
          icon: 'none'
        });
        return false;
      }
    }
    return true;
  },

  /**
   * 提交诊断
   */
  submitDiagnosis() {
    wx.showLoading({ title: '中医辨证中...' });

    // 1. 将答案存入全局或本地存储，供 Result 页面读取
    // 这里的 answers 包含了 root_smell, soil_texture 等核心数据
    app.globalData.diagnosisAnswers = this.data.answers;
    
    // 为了防止数据丢失，也可以存一份到 Storage
    wx.setStorageSync('last_diagnosis_answers', this.data.answers);

    // 2. 模拟思考延迟 (提升用户体验)
    setTimeout(() => {
      wx.hideLoading();
      
      // 3. 跳转结果页
      wx.reLaunch({
        url: '/pages/diagnosis/result/result'
      });
    }, 1000);
  }
});