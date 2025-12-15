// miniprogram/pages/diagnosis/positionSelect/positionSelect.js

Page({
  data: {
    crop: 'citrus',
    month: new Date().getMonth() + 1,
    positions: [
      { id: 'leaf',  name: '叶片', desc: '叶片发黄、斑点、卷曲等问题', selected: false, icon: '🍃' },
      { id: 'fruit', name: '果实', desc: '果面斑点、裂果、日灼等问题', selected: false, icon: '🍊' }
    ]
  },

  onLoad(options) {
    if (options.crop) {
      this.setData({ crop: options.crop });
    }
    if (options.month) {
      const m = parseInt(options.month);
      if (!isNaN(m)) this.setData({ month: m });
    }
  },

  // 切换多选
  onTogglePosition(e) {
    const id = e.currentTarget.dataset.id;
    const list = this.data.positions.map(item => {
      if (item.id === id) {
        return Object.assign({}, item, { selected: !item.selected });
      }
      return item;
    });
    this.setData({ positions: list });
  },

  // 开始诊断
  onStartDiagnosis() {
    const selected = this.data.positions
      .filter(p => p.selected)
      .map(p => p.id);   // ['leaf'] / ['fruit'] / ['leaf','fruit']

    if (selected.length === 0) {
      wx.showToast({ title: '请至少选择一个位置', icon: 'none' });
      return;
    }

    const positionsStr = encodeURIComponent(JSON.stringify(selected));
    const url = `/pages/diagnosis/question/question?mode=combined&positions=${positionsStr}&crop=${this.data.crop}&month=${this.data.month}`;

    console.log('[PositionSelect] 进入组合问卷:', url);

    wx.navigateTo({
      url,
      success: () => console.log('[PositionSelect] 跳转成功'),
      fail: (err) => {
        console.error('[PositionSelect] 跳转失败', err);
        wx.showModal({
          title: '跳转失败',
          content: JSON.stringify(err),
          showCancel: false
        });
      }
    });
  }
});
