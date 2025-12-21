// miniprogram/pages/index/index.js
const app = getApp();

Page({
  data: {
    lastRecord: null,
    isNavigating: false // 页面跳转锁，防止快速连点
  },

  onShow() {
    // 每次回到首页，重置跳转状态，并重新加载最新记录
    this.setData({ isNavigating: false });
    this.loadLastRecord();
  },

  /**
   * 加载最近一条记录
   */
  loadLastRecord() {
    try {
      // 这里的 key 必须和 result.js 里保存的 key 一致 ('diagnosisRecords')
      const history = wx.getStorageSync('diagnosisRecords') || [];
      
      if (Array.isArray(history) && history.length > 0) {
        // 取出最新的一条
        this.setData({ lastRecord: history[0] });
      } else {
        this.setData({ lastRecord: null });
      }
    } catch (e) {
      console.error('首页加载记录失败', e);
      this.setData({ lastRecord: null });
    }
  },

  /**
   * 点击“开始诊断”按钮
   */
  goToForm() {
    if (this.data.isNavigating) return;
    this.setData({ isNavigating: true });

    console.log("准备进入作物选择页...");
    wx.navigateTo({
      url: '/pages/diagnosis/cropSelect/cropSelect',
      fail: (err) => {
        this.setData({ isNavigating: false });
        console.error("跳转作物选择页失败，请确认 app.json 是否包含此路径:", err);
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 查看最近一次的诊断报告
   */
  viewRecord() {
    if (this.data.isNavigating) return;
    
    const record = this.data.lastRecord;
    // 如果没有记录或记录里没有 result 对象，则不操作
    if (!record || !record.result) {
      wx.showToast({
        title: '暂无诊断结论',
        icon: 'none'
      });
      return;
    }

    this.setData({ isNavigating: true });
    
    // 存入临时缓存供 result 页读取展示
    wx.setStorageSync('temp_diagnosis_result', record.result);
    
    wx.navigateTo({
      url: '/pages/diagnosis/result/result',
      fail: (err) => {
        this.setData({ isNavigating: false });
        console.error("跳转结果页失败:", err);
      }
    });
  },

  /**
   * 分享配置
   */
  onShareAppMessage() {
    return {
      title: '柑橘病虫害诊断助手',
      path: '/pages/index/index'
    };
  }
});