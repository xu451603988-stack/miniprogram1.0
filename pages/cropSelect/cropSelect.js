// pages/cropSelect/cropSelect.js
Page({
  data: {
    crops: [
      { type: 'tomato', name: '番茄', icon: '🍅' },
      { type: 'rice', name: '水稻', icon: '🌾' },
      { type: 'orange', name: '柑橘', icon: '🍊' },
      { type: 'apple', name: '苹果', icon: '🍏' }
    ]
  },

  // 处理作物选择
  selectCrop(e) {
    const cropType = e.currentTarget.dataset.type;
    // 根据选择的作物类型跳转到相应的诊断页面
    if (cropType === 'orange') {
      wx.navigateTo({
        url: `/pages/orangeForm/orangeForm?cropType=${cropType}`
      });
    } else {
      wx.navigateTo({
        url: `/pages/form/form?cropType=${cropType}`
      });
    }
  },

  onLoad() {
    console.log('作物选择页加载成功');
  }
});