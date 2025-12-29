// miniprogram/app.js
App({
  globalData: {
    diagnosisAnswers: null,
    diagnosisMeta: null,
    weatherData: null
  },

  onLaunch() {
    // 如果你用云开发再打开；不需要就保持注释
    // if (wx.cloud) {
    //   wx.cloud.init({ traceUser: true });
    // }

    // 启动时恢复上次缓存（给 result.js 兜底使用）
    try {
      const answers = wx.getStorageSync('last_diagnosis_answers');
      const meta = wx.getStorageSync('last_diagnosis_meta');
      if (answers) this.globalData.diagnosisAnswers = answers;
      if (meta) this.globalData.diagnosisMeta = meta;
    } catch (e) {
      console.warn('恢复缓存失败：', e);
    }
  }
});
