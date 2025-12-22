// miniprogram/app.js
const FinalScoreEngine = require('./utils/finalScoreEngine.js');
import { initLocationAndClimate } from './utils/location';

App({
  globalData: {
    location: null,
    climate: null,
    diagnosticEngine: FinalScoreEngine,
    userStats: null, // 用户数据现由 user 页面按需获取
    userInfo: null   // 预留给用户头像昵称
  },

  async onLaunch() {
    // 1. 初始化云开发环境 (保持你原有的ID)
    if (wx.cloud) {
      wx.cloud.init({
        env: 'cloud1-8gxcf60t4e66ca9d', 
        traceUser: true
      });
    }

    // 2. 异步获取位置与气候 (不阻塞程序启动)
    try {
      const res = await initLocationAndClimate();
      this.globalData.location = res.location;
      this.globalData.climate = res.climate;
      console.log('🌍 环境感知系统初始化完毕');
    } catch (e) {
      console.warn('⚠️ 环境初始化失败，将使用默认参数运行');
    }
  }
});