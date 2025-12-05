// pages/diagnosis/positionSelect/positionSelect.js
Page({
  data: {
    crop: '柑橘',
    positions: [
      { id: 'leaf', name: '叶片诊断', icon: '🍃', algorithm: 'leafAlgorithm' },
      { id: 'fruit', name: '果实诊断', icon: '🍊', algorithm: 'fruitAlgorithm' }
    ]
  },

  onLoad(options) {
    if (options.crop) {
      this.setData({ crop: options.crop });
    }
  },

  onSelectPosition(e) {
    const { id, algorithm } = e.currentTarget.dataset;
    const month = new Date().getMonth() + 1;
    
    console.log('[位置选择]', { position: id, algorithm, month }); // 调试用
    
    const url = `/pages/diagnosis/question/question?position=${id}&algorithm=${algorithm}&month=${month}`;
    
    console.log('[跳转URL]', url); // 调试用
    
    wx.navigateTo({
      url: url,
      success: () => {
        console.log('[跳转成功]');
      },
      fail: (err) => {
        console.error('[跳转失败]', err);
        wx.showModal({
          title: '跳转失败',
          content: `路径: ${url}\n错误: ${JSON.stringify(err)}`,
          showCancel: false
        });
      }
    });
  }
});