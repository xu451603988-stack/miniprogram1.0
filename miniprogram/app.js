// miniprogram/app.js
const FinalScoreEngine = require('./utils/finalScoreEngine.js');
import { initLocationAndClimate } from './utils/location';

App({
  globalData: {
    location: null,
    climate: null,
    diagnosticEngine: FinalScoreEngine, // 挂载新算法引擎
    userStats: null // 【新增】存放会员等级和剩余积分
  },

  async onLaunch() {
    // 1. 初始化云开发
    if (wx.cloud) {
      wx.cloud.init({
        env: 'cloud1-8gxcf60t4e66ca9d', // 您的环境ID已确认
        traceUser: true
      });
    }

    // 2. 【核心功能】自动检查并初始化会员档案
    this.checkAndInitUser();

    // 3. 异步获取位置与气候
    try {
      const res = await initLocationAndClimate();
      this.globalData.location = res.location;
      this.globalData.climate = res.climate;
    } catch (e) {
      console.warn('环境初始化失败，算法将以标准模式运行');
    }
  },

  /**
   * 会员系统初始化逻辑
   * 自动在云数据库 users 集合中创建或读取用户信息
   */
  async checkAndInitUser() {
    const db = wx.cloud.database();
    try {
      // 查询当前用户的记录
      const res = await db.collection('users').get();
      
      if (res.data.length === 0) {
        // --- 新用户：执行自动注册 ---
        const newUserConfig = {
          memberLevel: 0,        // 0: 普通用户, 1: VIP
          expireTime: 0,         // 会员过期时间戳
          remainingPoints: 5,    // 初始赠送 5 次诊断机会
          createTime: db.serverDate() // 记录注册时间
        };
        
        await db.collection('users').add({ data: newUserConfig });
        this.globalData.userStats = newUserConfig;
        console.log('✨ [会员系统] 新用户档案创建成功，获赠 5 次积分');
        
      } else {
        // --- 老用户：同步最新数据 ---
        this.globalData.userStats = res.data[0];
        console.log('📊 [会员系统] 用户数据同步成功:', res.data[0]);
      }
    } catch (e) {
      // 如果报错，通常是 users 集合权限没开或集合不存在
      console.error('❌ [会员系统] 初始化失败，请检查云开发 users 集合权限', e);
    }
  }
});