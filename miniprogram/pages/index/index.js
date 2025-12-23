const app = getApp();

Page({
  data: {
    orchard: null,   // 果园档案
    historyList: []  // 诊断历史
  },

  onShow() {
    this.refreshData();
  },

  refreshData() {
    // 1. 获取果园档案 (从全局变量)
    const orchard = app.globalData.orchard || {
      name: "我的示范果园",
      crop: "柑橘",
      treeAge: 3,
      stage: "旺长期"
    };

    // 2. 获取历史记录 (暂时从 Storage 取，以后从云数据库取)
    // 这里我们造一条假数据，方便你测试点击功能
    let history = wx.getStorageSync('diagnosis_history') || [];
    
    // 如果没记录，塞一条测试数据让你点
    if (history.length === 0) {
      history = [{
        id: 'test_001',
        date: '12月23日',
        result: '缺镁症',
        desc: '湿邪困脾·沤根证'
      }];
    }

    this.setData({
      orchard: orchard,
      historyList: history
    });
  },

  /**
   * 点击"开始诊断"
   */
  startDiagnosis() {
    wx.navigateTo({
      url: '/pages/cropSelect/cropSelect'
    });
  },

  /**
   * 点击历史记录项 -> 跳转详情
   * (这就是你之前点不动的原因：缺了这个函数)
   */
  goHistoryDetail(e) {
    const id = e.currentTarget.dataset.id;
    console.log("点击了历史记录:", id);
    
    // 这里暂时跳转到结果页，实际项目中应该跳转到 /history/detail?id=xxx
    // 为了演示效果，我们直接重开一个诊断问卷
    wx.showToast({
      title: '查看详情功能开发中',
      icon: 'none'
    });
  },

  /**
   * 点击"管理果园"
   */
  manageOrchard() {
    wx.showToast({ title: '果园管理开发中', icon: 'none' });
  }
});