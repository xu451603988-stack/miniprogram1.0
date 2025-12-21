// pages/welcome/welcome.js
const app = getApp();

Page({
  data: {},

  onLoad() {
    // 可以在这里预加载一些数据
  },

  // 开始诊断
  onStart() {
    wx.navigateTo({
      url: '/pages/cropSelect/cropSelect',
    });
  },

  // 跳转会员中心 (新增)
  toUser() {
    // 尝试跳转 (如果user是tabbar页面，请改用 wx.switchTab)
    wx.navigateTo({
      url: '/pages/user/user',
      fail: (err) => {
        // 如果失败（比如user是底部tab页），尝试 switchTab
        wx.switchTab({ url: '/pages/user/user' });
      }
    });
  },

  // 跳转历史记录
  toHistory() {
    wx.navigateTo({
      url: '/pages/diagnosis/history/history',
    });
  },

  // 联系专家
  toExpert() {
    wx.makePhoneCall({
      phoneNumber: '13800000000', // 请替换为您的客服电话
    });
  }
});