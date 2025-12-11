// miniprogram/pages/user/user.js
const app = getApp();

Page({
  data: {
    userInfo: null,
    isVip: false, // 默认非VIP，改成 true 可以看 VIP 效果
    userData: {
      diagnosisCount: 0,
      points: 0
    }
  },

  onShow() {
    // 模拟数据展示，实际应从 globalData 或云函数获取
    this.setData({
      isVip: app.globalData.isVip || false,
      userInfo: app.globalData.userInfo || { nickName: "测试用户" },
      userData: {
        diagnosisCount: 12,
        points: 50
      }
    });
  },

  // 【新增】跳转到果园托管页
  goOrchard() {
    wx.navigateTo({
      url: '/pages/orchard/orchard'
    });
  },

  // 点击开通会员
  onBuyVip() {
    wx.showToast({ title: '会员功能开发中', icon: 'none' });
  },

  // 跳转历史记录
  goHistory() {
    wx.navigateTo({ url: '/pages/diagnosis/history/history' });
  },

  // 跳转药方（带锁逻辑）
  goMyPrescription() {
    if (!this.data.isVip) {
      wx.showModal({
        title: '会员专属',
        content: '“专家处方”功能仅对VIP会员开放，是否开通？',
        success: (res) => {
          if (res.confirm) {
            this.onBuyVip();
          }
        }
      });
    } else {
      wx.showToast({ title: '进入药方页面', icon: 'none' });
    }
  },

  // 联系客服
  contactSupport() {
    wx.showToast({ title: '客服功能待接入', icon: 'none' });
  },
  
  // 关于我们
  aboutUs() {
    wx.showToast({ title: '版本 2.3.0', icon: 'none' });
  }
});