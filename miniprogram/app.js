// miniprogram/app.js
// 1. 【修改这里】引入刚才新建的 citrus_algo.js 核心算法文件
const CitrusAlgo = require('./utils/citrus_algo.js');

App({
  onLaunch: function () {
    // 1. 初始化云开发环境
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        // 您的环境ID (保持原有配置不变)
        env: 'cloud1-8gxcf60t4e66ca9d', 
        traceUser: true,
      });
      console.log('☁️ 云开发环境初始化成功');
    }

    // 2. 初始化诊断引擎
    this._initDiagnosticEngine();
    
    // 3. 模拟获取用户信息
    const mockUser = wx.getStorageSync('userInfo') || { nickName: "果农朋友" };
    this.globalData.userInfo = mockUser;
    
    console.log("🚀 作物健康诊断系统启动");
  },

  // 初始化诊断引擎的方法
  _initDiagnosticEngine: function() {
    // 2. 【修改这里】将全局诊断引擎指向新的 CitrusAlgo
    this.globalData.diagnosticEngine = CitrusAlgo;
    
    // 自动更新月份
    const currentMonth = new Date().getMonth() + 1;
    this.globalData.currentMonth = currentMonth;
    
    console.log(`✅ 系统已切换至 [CitrusAlgo 治未病引擎]，当前月份: ${currentMonth}`);
  },

  // 全局数据
  globalData: {
    userInfo: null,
    isVip: false, // 默认非VIP
    diagnosticEngine: null,
    currentCrop: 'citrus', // 默认作物
    currentMonth: 1,
    diagnosisHistory: []
  }
});