// pages/diagnosis/cropSelect/cropSelect.js
Page({
  data: {
    title: '选择作物',
    crops: [
      { id: 'citrus', name: '柑橘', icon: '🍊', desc: '橙、柚、桔、柠檬等' },
      { id: 'apple', name: '苹果', icon: '🍎', desc: '富士、嘎啦、金帅等' },
      { id: 'grape', name: '葡萄', icon: '🍇', desc: '巨峰、夏黑、阳光玫瑰等' },
      { id: 'peach', name: '桃', icon: '🍑', desc: '水蜜桃、黄桃、油桃等' }
    ]
  },

  onSelectCrop(e) {
    const crop = e.currentTarget.dataset.id;
    console.log('[选择作物]', crop);
    
    wx.navigateTo({
      url: `/pages/diagnosis/positionSelect/positionSelect?crop=${crop}`,
      success: () => {
        console.log('[跳转成功] 位置选择页');
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