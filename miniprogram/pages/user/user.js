// miniprogram/pages/user/user.js
const app = getApp();

Page({
  data: {
    userInfo: null,
    isVip: false,
    inputCode: '',
    // 使用 userStats 统一管理
    userStats: {
      diagnosisCount: 0,
      remainingPoints: 0
    }
  },

  onShow() {
    this.refreshUserStatus();
  },

  onPullDownRefresh() {
    this.refreshUserStatus();
  },

  // 核心：调用云函数获取最新数据 (绕过缓存)
  async refreshUserStatus() {
    console.log('🔄 正在刷新数据...');
    try {
      // 调用云函数里的查询接口，强制拿最新数据
      const res = await wx.cloud.callFunction({
        name: 'orchardFunctions',
        data: { type: 'getLatestUserInfo' }
      });

      console.log('☁️ 云端返回:', res.result);

      // 容错处理：确保拿到数据
      if (res.result && res.result.data && res.result.data.length > 0) {
        const stats = res.result.data[0];
        
        app.globalData.userStats = stats;
        
        this.setData({
          isVip: stats.memberLevel > 0,
          userStats: stats, 
          userInfo: app.globalData.userInfo || null
        });
        
        console.log(`✅ 刷新成功 | 积分: ${stats.remainingPoints}`);
      }
    } catch (e) {
      console.error("❌ 刷新失败:", e);
    } finally {
      wx.stopPullDownRefresh();
    }
  },

  onCodeInput(e) {
    this.setData({ inputCode: e.detail.value });
  },

  async submitRedeem() {
    const code = this.data.inputCode.trim();
    if (!code) {
      wx.showToast({ title: '请输入激活码', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '激活中...' });

    try {
      const res = await wx.cloud.callFunction({
        name: 'orchardFunctions',
        data: { type: 'redeemCode', data: { code: code } }
      });

      wx.hideLoading();

      if (res.result && res.result.success) {
        // 【核心修复】这里不再读取 res.result.latestStats，避免报错！
        // 直接弹窗提示成功，点击确定后刷新页面
        
        wx.showModal({
          title: '激活成功',
          content: '积分已到账，点击确定刷新数据。',
          showCancel: false,
          success: () => {
            this.setData({ inputCode: '' });
            // 强制刷新一次数据
            this.refreshUserStatus();
          }
        });
      } else {
        wx.showModal({ title: '激活失败', content: res.result.msg, showCancel: false });
      }
    } catch (err) {
      wx.hideLoading();
      wx.showModal({ title: '网络错误', content: err.message, showCancel: false });
    }
  },

  goOrchard() { wx.navigateTo({ url: '/pages/orchard/orchard' }); },
  goHistory() { wx.navigateTo({ url: '/pages/diagnosis/history/history' }); },
  goMyPrescription() {
    if (!this.data.isVip) {
      wx.showToast({ title: '请先激活会员', icon: 'none' });
    } else {
      wx.showToast({ title: '进入药方页面', icon: 'none' });
    }
  },
  aboutUs() { wx.showToast({ title: '版本 2.6.0', icon: 'none' }); },
  contactSupport() { wx.showToast({ title: '请联系客服', icon: 'none' }); }
});