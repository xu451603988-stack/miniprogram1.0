// pages/orangeForm/orangeForm.js

Page({
  data: {
    optionLabels: {
      phenology_input: ["1月（越冬期）","2月（萌芽期）","3月（春梢+初花期）","4月（盛花+生理落果期）","5月（落果+雨季开始）","6月（高温多雨疫霉期）","7月（花芽分化期）","8月（秋梢期）","9月（秋梢期）","10月（果实膨大&转色期）","11月（果实膨大&转色期）","12月（越冬期）"]
    },
    currentMonth: new Date().getMonth() + 1
  },

  onLoad() {
    // 默认选中当前月份
    this.setData({ currentMonth: this.data.currentMonth });
  },

  onMonthChange(e) {
    const month = parseInt(e.detail.value) + 1;
    
    // 跳转到问题页，传递月份参数
    wx.navigateTo({
      url: `/pages/question/question?month=${month}`,
      success: () => {
        console.log('[跳转] 到问题页，月份:', month);
      },
      fail: (err) => {
        console.error('[跳转失败]', err);
        wx.showToast({ title: '跳转失败', icon: 'error' });
      }
    });
  }
});