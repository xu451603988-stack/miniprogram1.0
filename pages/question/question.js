// miniprogram/pages/diagnosis/question/question.js
const NewDiagnosticEngine = require('../../../utils/newDiagnosticEngine');

Page({
  data: {
    currentQuestion: 0,
    answers: {},
    questions: [],
    isLeafModule: true,
    selectedCrop: 'citrus',
    currentMonth: new Date().getMonth() + 1,
    totalQuestions: 0,
    progress: 0,
    isInitialized: false  // 添加初始化完成标志
  },

  onLoad: function (options) {
    console.log('[QuestionPage] onLoad 接收参数:', options);
    
    // 修复：兼容 positionSelect 传递的参数
    const { position = 'leaf', algorithm, month } = options;
    const isLeaf = position && position.toLowerCase() === 'leaf';
    const currentMonth = month ? parseInt(month) : new Date().getMonth() + 1;
    
    console.log('[QuestionPage] 模块类型:', isLeaf ? '叶片' : '果实', '月份:', currentMonth);
    
    // 使用 setData 的回调函数确保数据设置完成
    this.setData({
      isLeafModule: isLeaf,
      selectedCrop: 'citrus',
      currentMonth: currentMonth
    }, () => {
      // 数据设置完成后再加载问题
      this._loadQuestions();
    });
  },

  // 加载问题列表
  _loadQuestions() {
    console.log('[QuestionPage] 开始加载问题列表');
    
    const questions = this.data.isLeafModule ? this._getLeafQuestions() : this._getFruitQuestions();
    
    // 确保数据正确设置，并在回调中设置初始化完成标志
    this.setData({
      questions: questions,
      totalQuestions: questions.length,
      progress: 0,
      currentQuestion: 0,
      answers: {}
    }, () => {
      console.log('[QuestionPage] 问题加载完成:', {
        totalQuestions: this.data.totalQuestions,
        questions: this.data.questions
      });
      
      // 设置导航栏标题
      wx.setNavigationBarTitle({
        title: this.data.isLeafModule ? '叶片诊断问卷' : '果实诊断问卷'
      });
      
      // 标记初始化完成
      this.setData({ isInitialized: true });
    });
  },

  // 叶片诊断问题配置
  _getLeafQuestions() {
    const questions = [
      {
        id: 'leaf_age',
        title: '请选择叶龄（必须）',
        type: 'single',
        required: true,
        options: [
          { label: '新梢幼叶（顶端）', value: 'young' },
          { label: '功能叶（中部）', value: 'mature' },
          { label: '老叶（基部）', value: 'old' }
        ]
      },
      {
        id: 'symptoms',
        title: '叶片主要症状（可多选）',
        type: 'multiple',
        required: true,
        options: [
          { label: '叶脉间黄化（缺铁/锌）', value: 'interveinal_chlorosis' },
          { label: '叶脉黄化（失绿）', value: 'vein_chlorosis' },
          { label: '花叶斑驳（病毒）', value: 'mottling_variegation' },
          { label: '局部病斑', value: 'local_spots_lesions' },
          { label: '水渍状斑（雨后）', value: 'water_soaked_spots' },
          { label: '叶缘焦枯', value: 'necrotic_margin' },
          { label: '叶尖灼伤（肥害）', value: 'tip_burn' },
          { label: '叶片卷曲', value: 'leaf_curl' },
          { label: '全叶黄化', value: 'chlorotic_whole_leaf' },
          { label: '蜜露/煤污（虫害）', value: 'honeydew_sooty' },
          { label: '可见害虫', value: 'insects_visible' }
        ]
      },
      {
        id: 'distribution',
        title: '症状分布模式（必须）',
        type: 'single',
        required: true,
        options: [
          { label: '局部/扇形（病毒）', value: 'sectoral' },
          { label: '全株均匀（营养）', value: 'uniform' },
          { label: '零散分布（真菌）', value: 'scattered' }
        ]
      },
      {
        id: 'onset',
        title: '发病速度（必须）',
        type: 'single',
        required: true,
        options: [
          { label: '一夜之间（药害）', value: 'overnight' },
          { label: '1-2天内', value: 'days' },
          { label: '1-2周内', value: 'weeks' }
        ]
      },
      {
        id: 'recent_events',
        title: '近期田间事件（可多选）',
        type: 'multiple',
        required: false,
        options: [
          { label: '连续降雨（真菌）', value: 'ev_rain' },
          { label: '高温强光（日灼）', value: 'ev_hot' },
          { label: '大量追施氮肥（肥害）', value: 'ev_heavy_n' },
          { label: '最近喷药（药害）', value: 'ev_recent_spray' },
          { label: '频繁灌溉', value: 'ev_freq_irrig' }
        ]
      }
    ];
    
    console.log('[QuestionPage] 叶片问题配置:', questions.length, '题');
    return questions;
  },

  // 果实诊断问题配置
  _getFruitQuestions() {
    const questions = [
      {
        id: 'fruit_position',
        title: '果实在树冠的位置（必须）',
        type: 'single',
        required: true,
        options: [
          { label: '外围果（易日灼）', value: 'outer' },
          { label: '内膛果', value: 'inner' },
          { label: '下部果', value: 'lower' },
          { label: '上部果', value: 'upper' }
        ]
      },
      {
        id: 'fruit_symptoms',
        title: '果实主要症状（可多选）',
        type: 'multiple',
        required: true,
        options: [
          { label: '表面斑点/凹陷（病斑）', value: 'surface_spots_pits' },
          { label: '油渍状斑点（油斑病）', value: 'oily_spots' },
          { label: '日灼烧伤斑（晒伤）', value: 'sunburn_burn' },
          { label: '裂果/开裂（生理）', value: 'cracking_split' },
          { label: '成熟期返青（黄龙病）', value: 'color_inversion_green_when_ripen' },
          { label: '早期落果（生理）', value: 'premature_drop' },
          { label: '产卵孔/蛀孔（果蝇）', value: 'oviposition_punctures' },
          { label: '果小畸形（缺素/HLB）', value: 'small_lopsided' }
        ]
      },
      {
        id: 'fruit_size',
        title: '果实大小评估（必须）',
        type: 'single',
        required: true,
        options: [
          { label: '正常大小', value: 'normal' },
          { label: '明显偏小', value: 'small' },
          { label: '异常偏大', value: 'large' }
        ]
      },
      {
        id: 'onset',
        title: '症状发展速度（必须）',
        type: 'single',
        required: true,
        options: [
          { label: '一夜之间（急性）', value: 'overnight' },
          { label: '几天内', value: 'days' },
          { label: '几周内', value: 'weeks' }
        ]
      },
      {
        id: 'recent_events',
        title: '近期田间事件（可多选）',
        type: 'multiple',
        required: false,
        options: [
          { label: '连续降雨（病害）', value: 'ev_rain' },
          { label: '高温强光（日灼）', value: 'ev_hot' },
          { label: '大量追施氮肥', value: 'ev_heavy_n' },
          { label: '最近喷药', value: 'ev_recent_spray' },
          { label: '授粉不良', value: 'ev_pollination_issue' }
        ]
      }
    ];
    
    console.log('[QuestionPage] 果实问题配置:', questions.length, '题');
    return questions;
  },

  // 选项选择（单选）
  onOptionSelect(e) {
    const { questionId, option } = e.currentTarget.dataset;
    console.log('[Select] 单选:', questionId, '=', option.value);
    
    this.setData({
      [`answers.${questionId}`]: option.value
    });
  },

  // 选项切换（多选）
  onOptionToggle(e) {
    const { questionId, option } = e.currentTarget.dataset;
    const currentValue = this.data.answers[questionId] || [];
    console.log('[Toggle] 多选前:', questionId, '=', currentValue);
    
    // 切换当前选项
    let newValue = [...currentValue];
    if (newValue.includes(option.value)) {
      newValue = newValue.filter(v => v !== option.value);
    } else {
      newValue.push(option.value);
    }
    
    this.setData({
      [`answers.${questionId}`]: newValue
    }, () => {
      console.log('[Toggle] 多选后:', questionId, '=', this.data.answers[questionId]);
    });
  },

  // 上一题
  goBack() {
    if (this.data.currentQuestion > 0) {
      this.setData({
        currentQuestion: this.data.currentQuestion - 1,
        progress: ((this.data.currentQuestion - 1) / this.data.totalQuestions) * 100
      }, () => {
        console.log('[Nav] 上一题:', this.data.currentQuestion + 1);
      });
    } else {
      // 返回上一页
      wx.navigateBack();
    }
  },

  // 下一题/提交
  nextQuestion() {
    // 验证当前题是否已答
    const currentQ = this.data.questions[this.data.currentQuestion];
    const answer = this.data.answers[currentQ.id];
    
    console.log('[Validate] 验证题目:', currentQ.id, '答案:', answer);
    
    if (currentQ.required && (!answer || (Array.isArray(answer) && answer.length === 0))) {
      wx.showToast({
        title: '请完成当前问题',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    // 如果是最后一题，则提交诊断
    if (this.data.currentQuestion >= this.data.totalQuestions - 1) {
      console.log('[Submit] 最后一题，准备提交');
      this.submitDiagnosis();
    } else {
      // 否则进入下一题
      this.setData({
        currentQuestion: this.data.currentQuestion + 1,
        progress: ((this.data.currentQuestion + 1) / this.data.totalQuestions) * 100
      }, () => {
        console.log('[Nav] 下一题:', this.data.currentQuestion + 1);
      });
    }
  },

  // 提交诊断
  submitDiagnosis() {
    console.log('[Submit] 开始提交诊断');
    wx.showLoading({ title: '智能分析中...', mask: true });
    
    try {
      // 构建诊断数据
      const diagnosticData = this._buildDiagnosticData();
      console.log('[Submit] 诊断数据:', diagnosticData);
      
      // 调用新算法引擎
      let result;
      if (this.data.isLeafModule) {
        console.log('[Submit] 调用叶片诊断算法');
        result = NewDiagnosticEngine.diagnoseLeaf(diagnosticData);
      } else {
        console.log('[Submit] 调用果实诊断算法');
        result = NewDiagnosticEngine.diagnoseFruit(diagnosticData);
      }
      
      wx.hideLoading();
      console.log('[Result] 诊断结果:', result);
      
      // 跳转到结果页
      wx.navigateTo({
        url: `/pages/diagnosis/result/result?result=${encodeURIComponent(JSON.stringify(result))}`,
        success: () => {
          console.log('[Nav] 跳转结果页成功');
          // 记录日志
          this._logDiagnosis(diagnosticData, result);
        },
        fail: (err) => {
          console.error('[Nav] 跳转失败', err);
          wx.showToast({ title: '跳转失败，请重试', icon: 'none' });
        }
      });
      
    } catch (error) {
      wx.hideLoading();
      console.error('[Submit] 诊断失败:', error);
      wx.showModal({
        title: '诊断失败',
        content: '分析过程中出现错误：' + error.message,
        showCancel: false,
        confirmText: '返回重试'
      });
    }
  },

  // 构建诊断数据
  _buildDiagnosticData() {
    const answers = this.data.answers;
    console.log('[BuildData] 原始答案:', answers);
    
    const data = {
      crop: this.data.selectedCrop,
      month: this.data.currentMonth,
      recent_events: answers.recent_events || []
    };
    
    if (this.data.isLeafModule) {
      data.leaf = {
        age: answers.leaf_age,
        symptoms: answers.symptoms || [],
        distribution: answers.distribution,
        onset: answers.onset,
        honeydew_sooty: (answers.symptoms || []).includes('honeydew_sooty'),
        insects_visible: (answers.symptoms || []).includes('insects_visible')
      };
    } else {
      data.fruit = {
        position: answers.fruit_position,
        symptoms: answers.fruit_symptoms || [],
        size: answers.fruit_size,
        onset: answers.onset,
        visible_holes_or_larvae: (answers.fruit_symptoms || []).includes('oviposition_punctures')
      };
    }
    
    console.log('[BuildData] 构建的诊断数据:', data);
    return data;
  },

  // 记录诊断日志
  _logDiagnosis(input, output) {
    const app = getApp();
    if (app && app.addToHistory) {
      app.addToHistory(input, output);
      console.log('[Log] 诊断记录已保存');
    } else {
      console.log('[Log] 无app实例，记录到本地:', { input, output });
    }
  }
});