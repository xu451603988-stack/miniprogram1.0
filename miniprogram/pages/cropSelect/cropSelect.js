// miniprogram/pages/cropSelect/cropSelect.js
const app = getApp();

Page({
  data: {
    // 定义作物列表：只有柑橘是 active: true
    crops: [
      { id: 'citrus', name: '柑橘', icon: '🍊', active: true, desc: '全系统诊断' },
      { id: 'apple', name: '苹果', icon: '🍎', active: false, desc: '敬请期待' },
      { id: 'grape', name: '葡萄', icon: '🍇', active: false, desc: '敬请期待' },
      { id: 'rice', name: '水稻', icon: '🌾', active: false, desc: '敬请期待' }
    ]
  },

  onLoad() {
    console.log('作物选择页加载成功');
  },

  // 处理点击事件
  selectCrop(e) {
    // 获取点击项的数据
    const { id, name, active } = e.currentTarget.dataset;
    
    console.log(`[CropSelect] 用户点击: ${name} (${id})`);

    // 1. 如果是“开发中”的作物，弹窗提示
    if (!active) {
      wx.showToast({
        title: `${name}诊断功能正在开发中`,
        icon: 'none',
        duration: 1500
      });
      return;
    }

    // 2. 如果是柑橘，保存状态并跳转
    if (id === 'citrus') {
      // 记录全局作物
      if (app.globalData) {
        app.globalData.currentCrop = id;
      }

      // 跳转到部位选择页
      // 注意：路径必须与 app.json 中注册的一致
      const targetUrl = '/pages/positionSelect/positionSelect?crop=citrus';
      
      wx.navigateTo({
        url: targetUrl,
        success: () => console.log('跳转成功'),
        fail: (err) => {
          console.error('跳转失败，尝试备用路径', err);
          // 备用路径（防止您之前的目录结构没改过来）
          wx.navigateTo({ url: '/pages/diagnosis/positionSelect/positionSelect?crop=citrus' });
        }
      });
    }
  }
});