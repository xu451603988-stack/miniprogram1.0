// miniprogram/pages/cropSelect/cropSelect.js
Page({
  data: {
    // ✅ 与 cropSelect.wxml 的 wx:for="{{crops}}" 完全一致
    crops: [
      {
        id: 'citrus',
        name: '柑橘',
        desc: '柑橘黄化、斑点、裂果等问题',
        icon: '🍊',
        active: true
      },
      // 你想以后扩展其他作物，可以先放“开发中”
      {
        id: 'apple',
        name: '苹果',
        desc: '即将上线',
        icon: '🍎',
        active: false
      },
      {
        id: 'grape',
        name: '葡萄',
        desc: '即将上线',
        icon: '🍇',
        active: false
      }
    ]
  },

  onLoad() {},

  // ✅ 与 wxml 的 bindtap="selectCrop" 对应
  selectCrop(e) {
    const { id, name, active } = e.currentTarget.dataset;

    // 未开放作物点击提示
    if (!active) {
      wx.showToast({
        title: `${name || '该作物'}开发中`,
        icon: 'none'
      });
      return;
    }

    // ✅ 跳转到 positionSelect，并把 crop 带过去
    wx.navigateTo({
      url: `/pages/positionSelect/positionSelect?crop=${encodeURIComponent(id)}`
    });
  }
});
