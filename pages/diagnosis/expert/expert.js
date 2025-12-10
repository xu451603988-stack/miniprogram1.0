// miniprogram/pages/diagnosis/expert/expert.js

Page({
  data: {
    wechatId: "baidu594518",
    phone: "18078459184"
  },

  copyWechat() {
    wx.setClipboardData({
      data: this.data.wechatId,
      success() {
        wx.showToast({ title: "已复制微信号", icon: "none" });
      }
    });
  },

  callPhone() {
    wx.makePhoneCall({
      phoneNumber: this.data.phone
    });
  }
});
