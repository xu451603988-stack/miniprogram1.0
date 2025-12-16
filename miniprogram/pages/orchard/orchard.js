// pages/orchard/orchard.js
const app = getApp();

Page({
  data: {
    hasLocation: false,
    loading: true,
    orchard: {
      name: '',
      address: '',
      latitude: 0,
      longitude: 0,
      variety: '沙糖桔',
      age: ''
    },
    varieties: ['沙糖桔', '沃柑', '脐橙', '柚子', '柠檬', '其他'],
    varietyIndex: 0,
    
    // 本月农事数据
    currentTask: null,
    currentMonth: new Date().getMonth() + 1
  },

  onLoad() {
    this.loadData();
  },

  // 加载云端数据
  async loadData() {
    wx.showLoading({ title: '加载中' });
    try {
      // 1. 获取果园信息
      const orchardRes = await wx.cloud.callFunction({
        name: 'orchardFunctions',
        data: { type: 'getMyOrchard' }
      });
      
      if (orchardRes.result.data) {
        const saved = orchardRes.result.data;
        // 恢复品种选择器的索引
        const vIndex = this.data.varieties.indexOf(saved.variety);
        this.setData({
          orchard: saved,
          hasLocation: !!saved.latitude,
          varietyIndex: vIndex > -1 ? vIndex : 0
        });
      }

      // 2. 获取当月农事
      const taskRes = await wx.cloud.callFunction({
        name: 'orchardFunctions',
        data: { type: 'getMonthlyTask', month: this.data.currentMonth }
      });
      
      if (taskRes.result.data) {
        this.setData({ currentTask: taskRes.result.data });
      }

    } catch (e) {
      console.error(e);
      wx.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      wx.hideLoading();
      this.setData({ loading: false });
    }
  },

  // 选择位置
  chooseLocation() {
    const that = this;
    wx.chooseLocation({
      success(res) {
        that.setData({
          'orchard.name': res.name,
          'orchard.address': res.address,
          'orchard.latitude': res.latitude,
          'orchard.longitude': res.longitude,
          hasLocation: true
        });
      },
      fail(err) {
        // 如果用户取消不用报错
        if (err.errMsg.indexOf('cancel') === -1) {
          wx.showToast({ title: '需授权位置权限', icon: 'none' });
        }
      }
    });
  },

  bindVarietyChange(e) {
    const index = e.detail.value;
    this.setData({
      varietyIndex: index,
      'orchard.variety': this.data.varieties[index]
    });
  },

  bindAgeInput(e) {
    this.setData({ 'orchard.age': e.detail.value });
  },

  // 保存并开启托管
  async saveOrchard() {
    if (!this.data.hasLocation) {
      wx.showToast({ title: '请先选择果园位置', icon: 'none' });
      return;
    }
    
    wx.showLoading({ title: '正在开启托管...' });
    
    try {
      // 调用云函数保存
      await wx.cloud.callFunction({
        name: 'orchardFunctions',
        data: {
          type: 'save',
          data: this.data.orchard
        }
      });

      wx.hideLoading();
      
      // 成功提示
      wx.showModal({
        title: '托管已开启',
        content: `系统已为您匹配 ${this.data.currentMonth}月 农事方案，请下滑查看。`,
        showCancel: false,
        confirmText: '查看方案',
        success: () => {
          // 滚动到底部查看建议
          wx.pageScrollTo({ scrollTop: 1000, duration: 300 });
        }
      });

    } catch (e) {
      console.error(e);
      wx.hideLoading();
      wx.showToast({ title: '保存失败，请重试', icon: 'none' });
    }
  }
});