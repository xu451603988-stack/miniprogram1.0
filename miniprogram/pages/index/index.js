// miniprogram/pages/index/index.js
Page({
  data: {
    lastRecord: null // 用于存储最近一条记录
  },

  onShow() {
    this.loadLastRecord();
  },

  // 加载最近一条诊断记录
  loadLastRecord() {
    try {
      const history = wx.getStorageSync('diagnosisRecords') || [];
      if (history.length > 0) {
        // 取第一条（最新的）
        this.setData({ lastRecord: history[0] });
      } else {
        this.setData({ lastRecord: null });
      }
    } catch (e) {
      console.error('加载历史记录失败', e);
    }
  },

  // 跳转到作物选择页
  goToForm() {
    wx.navigateTo({
      url: '/pages/diagnosis/cropSelect/cropSelect'
    });
  },

  // 点击卡片查看详情（直接复用结果页逻辑）
  viewRecord() {
    const record = this.data.lastRecord;
    if (!record) return;

    // 将历史记录的数据结构转换为结果页需要的格式
    // 注意：这里我们利用之前存的完整 result 数据
    if (record.result) {
      wx.setStorageSync('temp_diagnosis_result', record.result);
      wx.navigateTo({
        url: '/pages/diagnosis/result/result'
      });
    }
  },

  onShareAppMessage() {
    return {
      title: '作物诊断小助手，科学辨病更轻松',
      path: '/pages/index/index'
    };
  }
});