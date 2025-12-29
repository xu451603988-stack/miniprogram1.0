// miniprogram/pages/orchard/orchard.js
const app = getApp();

Page({
  data: {
    hasLocation: false,
    loading: true,
    orchard: {
      name: '',
      address: '',
      latitude: 0,
      longitude: 0,
      variety: '沙糖桔',
      age: ''
    },
    varieties: ['沙糖桔', '沃柑', '脐橙', '柚子', '柠檬', '其他'],
    varietyIndex: 0,
    
    // 天气与风险预警数据
    weatherData: null, 
    riskWarnings: [],
    smartDesc: '请完善果园位置，开启智能守护。',
    
    currentTask: null,
    currentMonth: new Date().getMonth() + 1
  },

  onLoad() {
    this.loadData();
  },

  /**
   * 加载云端果园档案及农事方案
   */
  async loadData() {
    wx.showLoading({ title: '同步档案中...' });
    try {
      // 1. 获取果园基础信息 
      const orchardRes = await wx.cloud.callFunction({
        name: 'orchardService',
        data: { type: 'getMyOrchard' }
      });
      
      if (orchardRes.result.data && orchardRes.result.data.length > 0) {
        const saved = orchardRes.result.data[0];
        const vIndex = this.data.varieties.indexOf(saved.variety);
        this.setData({
          orchard: saved,
          hasLocation: !!saved.latitude,
          varietyIndex: vIndex > -1 ? vIndex : 0
        });

        // 如果已有位置，自动触发预警分析 
        if (saved.latitude && saved.longitude) {
          this.initIntelligence(saved.latitude, saved.longitude);
        }
      }

      // 2. 获取当月农事方案 
      const taskRes = await wx.cloud.callFunction({
        name: 'orchardService',
        data: { type: 'getMonthlyTask', month: this.data.currentMonth }
      });
      
      if (taskRes.result.data && taskRes.result.data.length > 0) {
        this.setData({ currentTask: taskRes.result.data[0] });
      }

    } catch (e) {
      console.error("数据加载失败", e);
      wx.showToast({ title: '档案同步失败', icon: 'none' });
    } finally {
      wx.hideLoading();
      this.setData({ loading: false });
    }
  },

  /**
   * 开启智能分析：抓取天气并评估风险
   */
  async initIntelligence(lat, lng) {
    try {
      // 1. 模拟抓取未来天气数据 (实际开发中需对接第三方API或云函数) 
      // 这里构建符合云函数算法要求的 forecast 数组
      const mockForecast = [
        { date: '明天', maxTemp: 28, minTemp: 20, text: '阵雨', iconText: '🌧️' },
        { date: '后天', maxTemp: 29, minTemp: 21, text: '雷阵雨', iconText: '⛈️' },
        { date: '周五', maxTemp: 30, minTemp: 22, text: '多云', iconText: '☁️' },
        { date: '周六', maxTemp: 27, minTemp: 19, text: '中雨', iconText: '🌧️' },
        { date: '周日', maxTemp: 26, minTemp: 18, text: '阴', iconText: '🌥️' }
      ];
      this.setData({ weatherData: mockForecast });

      // 2. 调用云函数进行精准风险评估 
      const riskRes = await wx.cloud.callFunction({
        name: 'orchardService',
        data: {
          type: 'getRiskAssessment',
          data: { forecast: mockForecast }
        }
      });

      if (riskRes.result.success) {
        const warnings = riskRes.result.data;
        this.setData({
          riskWarnings: warnings,
          smartDesc: warnings.length > 0 
            ? `${warnings[0].icon}${warnings[0].name}风险：${warnings[0].advice}`
            : '当前气候条件下，果园病虫害风险较低。'
        });
      }
    } catch (err) {
      console.error("智能分析失败", err);
    }
  },

  /**
   * 位置选择
   */
  chooseLocation() {
    const that = this;
    wx.chooseLocation({
      success(res) {
        that.setData({
          'orchard.name': res.name,
          'orchard.address': res.address,
          'orchard.latitude': res.latitude,
          'orchard.longitude': res.longitude,
          hasLocation: true
        });
        // 选择位置后重新刷新分析数据 
        that.initIntelligence(res.latitude, res.longitude);
      },
      fail(err) {
        if (err.errMsg.indexOf('cancel') === -1) {
          wx.showToast({ title: '位置获取失败', icon: 'none' });
        }
      }
    });
  },

  /**
   * 品种与树龄输入绑定
   */
  bindVarietyChange(e) {
    const index = e.detail.value;
    this.setData({
      varietyIndex: index,
      'orchard.variety': this.data.varieties[index]
    });
  },

  bindAgeInput(e) {
    this.setData({ 'orchard.age': e.detail.value });
  },

  /**
   * 保存并开启托管
   */
  async saveOrchard() {
    if (!this.data.hasLocation) {
      wx.showToast({ title: '请先标注果园位置', icon: 'none' });
      return;
    }
    
    wx.showLoading({ title: '正在加密保存...' });
    
    try {
      await wx.cloud.callFunction({
        name: 'orchardService',
        data: {
          type: 'save',
          data: this.data.orchard
        }
      });

      wx.hideLoading();
      wx.showModal({
        title: '托管已启动',
        content: `系统已根据 ${this.data.currentMonth}月 物候为您匹配预警规则。`,
        showCancel: false,
        confirmText: '我知道了'
      });
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: '保存失败', icon: 'none' });
    }
  }
});