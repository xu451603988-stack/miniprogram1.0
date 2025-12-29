// miniprogram/pages/expert/expert.js
Page({
  data: {},

  onLoad() {},

  goBackHome() {
    wx.reLaunch({
      url: '/pages/index/index'
    });
  },

  goHistory() {
    wx.navigateTo({
      url: '/pages/history/history'
    });
  }
});
