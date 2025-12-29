// miniprogram/pages/user/user.js
Page({
  data: {
    redeemCode: '',
    userInfo: {
      avatarUrl: '/images/icons/avatar.png',
      nickName: '未登录用户'
    }
  },

  onLoad() {},

  onInputRedeemCode(e) {
    this.setData({ redeemCode: e.detail.value || '' });
  },

  goOrchard() {
    wx.navigateTo({ url: '/pages/orchard/orchard' });
  },

  goHistory() {
    wx.navigateTo({ url: '/pages/history/history' });
  },

  // ✅ WXML: bindtap="submitRedeem"
  submitRedeem() {
    const code = (this.data.redeemCode || '').trim();
    if (!code) {
      wx.showToast({ title: '请输入兑换码', icon: 'none' });
      return;
    }

    // 先占位：你后续接 orchardService 云函数即可
    wx.showModal({
      title: '兑换码提交',
      content: `已收到兑换码：${code}\n（当前为占位逻辑，下一步接云函数 orchardService）`,
      showCancel: false
    });
  },

  // ✅ WXML: bindtap="goMyPrescription"
  goMyPrescription() {
    wx.showToast({
      title: '我的处方功能开发中',
      icon: 'none'
    });
  }
});
