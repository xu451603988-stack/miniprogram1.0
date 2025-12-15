// miniprogram/pages/diagnosis/positionSelect/positionSelect.js

Page({
  data: {
    // 当前作物 & 月份，从上一个页面传进来
    crop: 'citrus',
    month: new Date().getMonth() + 1,

    /**
     * 可选诊断位置（叶片 / 果实）
     * 根系不在这里选，根系在后面统一必查
     */
    positions: [
      {
        id: 'leaf',
        name: '叶片',
        desc: '叶片发黄、斑点、卷曲等问题',
        icon: '🍃',
        selected: false
      },
      {
        id: 'fruit',
        name: '果实',
        desc: '果面斑点、裂果、日灼等问题',
        icon: '🍊',
        selected: false
      }
    ]
  },

  /**
   * 页面加载：接收上一个页面传来的 crop / month
   * 例如：/pages/diagnosis/positionSelect/positionSelect?crop=citrus&month=12
   */
  onLoad(options) {
    console.log('[PositionSelect] onLoad options:', options);

    const dataUpdate = {};

    if (options && options.crop) {
      dataUpdate.crop = options.crop;
    }

    if (options && options.month) {
      const m = parseInt(options.month);
      if (!isNaN(m) && m >= 1 && m <= 12) {
        dataUpdate.month = m;
      }
    }

    if (Object.keys(dataUpdate).length > 0) {
      this.setData(dataUpdate);
    }

    console.log('[PositionSelect] 当前作物:', this.data.crop, '当前月份:', this.data.month);
  },

  /**
   * 多选：切换某个位置是否选中
   */
  onTogglePosition(e) {
    const id = e.currentTarget.dataset.id;
    if (!id) return;

    const updated = this.data.positions.map(item => {
      if (item.id === id) {
        return Object.assign({}, item, { selected: !item.selected });
      }
      return item;
    });

    this.setData({ positions: updated });

    const selectedIds = updated.filter(p => p.selected).map(p => p.id);
    console.log('[PositionSelect] 当前已选择位置:', selectedIds);
  },

  // 兼容：如果 WXML 里哪怕还残留 onSelectPosition，也转到同一个逻辑
  onSelectPosition(e) {
    this.onTogglePosition(e);
  },

  /**
   * 开始诊断：
   * - 至少要选中一个位置（叶片 / 果实）
   * - 把 positions 以 JSON 字符串形式传给 question 页面
   * - 使用 mode=combined，启用多模块问卷 + runCombined
   */
  onStartDiagnosis() {
    const selected = this.data.positions
      .filter(p => p.selected)
      .map(p => p.id); // ['leaf'] / ['fruit'] / ['leaf','fruit']

    if (selected.length === 0) {
      wx.showToast({
        title: '请至少选择一个诊断位置',
        icon: 'none'
      });
      return;
    }

    // 仅允许 leaf / fruit，两者顺序在问卷中会按数组顺序依次提问
    const validPositions = selected.filter(p => p === 'leaf' || p === 'fruit');
    if (validPositions.length === 0) {
      wx.showToast({
        title: '诊断位置选择异常，请重新选择',
        icon: 'none'
      });
      return;
    }

    const positionsStr = encodeURIComponent(JSON.stringify(validPositions));

    const url = `/pages/diagnosis/question/question?mode=combined&positions=${positionsStr}&crop=${this.data.crop}&month=${this.data.month}`;

    console.log('[PositionSelect] 进入组合问卷:', url);

    wx.navigateTo({
      url,
      success: () => {
        console.log('[PositionSelect] 跳转问卷页成功');
      },
      fail: (err) => {
        console.error('[PositionSelect] 跳转问卷页失败:', err);
        wx.showModal({
          title: '跳转失败',
          content: '无法进入诊断问卷，请稍后重试或检查网络连接。',
          showCancel: false
        });
      }
    });
  }
});
