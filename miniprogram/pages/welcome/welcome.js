// pages/welcome/welcome.js
Page({
  data: {
    title: '作物健康诊断小助手',
    subtitle: '专业诊断作物病害，提供精准解决方案'
  },

  startDiagnosis() {
    console.log('[跳转] 前往作物选择页');
    
    wx.navigateTo({
      url: '/pages/diagnosis/cropSelect/cropSelect',
      success: () => {
        console.log('[跳转成功] 作物选择页');
      },
      fail: (err) => {
        console.error('[跳转失败]', err);
        wx.showToast({
          title: `跳转失败: ${err.errMsg}`,
          icon: 'none',
          duration: 5000
        });
      }
    });
  }
});