// miniprogram/pages/diagnosis/welcome/welcome.js
const app = getApp();

Page({
  data: {
    version: "V2.0.5"
  },

  onLoad() {
    console.log("[Welcome] 作物健康诊断系统欢迎页加载");
  },

  // 开始诊断：去作物选择页
  goStart() {
    console.log("[Welcome] 跳转作物选择页");
    wx.redirectTo({
      url: "/pages/diagnosis/cropSelect/cropSelect"
    });
  },

  // 查看历史记录
  goHistory() {
    console.log("[Welcome] 跳转历史记录页");
    wx.navigateTo({
      url: "/pages/diagnosis/history/history"
    });
  }
});
