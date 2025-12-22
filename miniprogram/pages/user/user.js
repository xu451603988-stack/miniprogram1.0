// miniprogram/pages/user/user.js
const app = getApp();

Page({
  data: {
    // 给个默认头像，防止 user.js 报错找不到图片
    userInfo: {
      avatarUrl: '/images/icons/avatar.png', 
      nickName: '未登录用户'
    },
    isVip: false,
    inputCode: '',
    userStats: {
      diagnosisCount: 0,
      remainingPoints: 0 // 默认显示0，加载后更新
    }
  },

  onShow() {
    this.refreshUserStatus();
  },

  onPullDownRefresh() {
    this.refreshUserStatus();
  },

  // 核心：调用云函数获取最新数据
  async refreshUserStatus() {
    console.log('🔄 正在同步用户数据...');
    try {
      const res = await wx.cloud.callFunction({
        name: 'orchardFunctions',
        data: { type: 'getLatestUserInfo' }
      });

      // 只要云函数返回 success: true
      if (res.result && res.result.success && res.result.data.length > 0) {
        const stats = res.result.data[0];
        
        // 更新全局变量
        app.globalData.userStats = stats;
        
        this.setData({
          isVip: stats.memberLevel > 0,
          userStats: stats,
          // 如果全局有用户信息就用全局的，否则显示默认的
          userInfo: app.globalData.userInfo || this.data.userInfo
        });
        
        console.log(`✅ 同步成功 | 剩余积分: ${stats.remainingPoints}`);
      }
    } catch (e) {
      console.error("❌ 同步失败:", e);
      wx.showToast({ title: '数据同步失败', icon: 'none' });
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
      return wx.showToast({ title: '请输入激活码', icon: 'none' });
    }

    wx.showLoading({ title: '验证中...' });

    try {
      const res = await wx.cloud.callFunction({
        name: 'orchardFunctions',
        data: { 
          type: 'redeemCode', 
          data: { code: code } 
        }
      });

      wx.hideLoading();

      if (res.result && res.result.success) {
        wx.showModal({
          title: '激活成功',
          content: '积分已到账！',
          showCancel: false,
          success: () => {
            this.setData({ inputCode: '' });
            this.refreshUserStatus(); // 重新拉取最新积分
          }
        });
      } else {
        wx.showModal({ 
          title: '激活失败', 
          content: res.result.msg || '激活码无效', 
          showCancel: false 
        });
      }
    } catch (err) {
      wx.hideLoading();
      wx.showModal({ title: '网络错误', content: err.message, showCancel: false });
    }
  },

  // 页面跳转逻辑
  goOrchard() { wx.switchTab({ url: '/pages/orchard/orchard' }).catch(()=> wx.navigateTo({ url: '/pages/orchard/orchard' })); },
  goHistory() { wx.navigateTo({ url: '/pages/diagnosis/history/history' }); },
  
  goMyPrescription() {
    if (!this.data.isVip) {
      wx.showToast({ title: '会员专享功能', icon: 'none' });
    } else {
      wx.showToast({ title: '药方功能开发中', icon: 'none' });
    }
  },
  
  aboutUs() { wx.showModal({ title: '关于我们', content: '作物病虫害智能诊断系统 v2.6.0', showCancel: false }); },
  contactSupport() { wx.showToast({ title: '请使用右上角反馈功能', icon: 'none' }); }
});