// miniprogram/pages/index/index.js
const app = getApp();

Page({
  data: {
    lastRecord: null
  },

  onShow() {
    this.loadLastRecord();
  },

  // 加载最近一条记录
  loadLastRecord() {
    try {
      // 这里的 key 必须和 result.js 里保存的 key 一致 ('diagnosisRecords')
      const history = wx.getStorageSync('diagnosisRecords') || [];
      
      if (Array.isArray(history) && history.length > 0) {
        this.setData({ lastRecord: history[0] });
      } else {
        this.setData({ lastRecord: null });
      }
    } catch (e) {
      console.error('首页加载记录失败', e);
      this.setData({ lastRecord: null });
    }
  },

  goToForm() {
    wx.navigateTo({
      url: '/pages/diagnosis/cropSelect/cropSelect'
    });
  },

  viewRecord() {
    const record = this.data.lastRecord;
    if (!record || !record.result) return;

    // 存入缓存供 result 页读取
    wx.setStorageSync('temp_diagnosis_result', record.result);
    wx.navigateTo({
      url: '/pages/diagnosis/result/result'
    });
  },

  onShareAppMessage() {
    return {
      title: '作物诊断小助手',
      path: '/pages/index/index'
    };
  }
});