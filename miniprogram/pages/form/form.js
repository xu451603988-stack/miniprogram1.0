// pages/form/form.js
Page({
  data: {
    cropType: '', // 作物类型
    cropName: '', // 作物名称
    leafSpot: '', // 叶片症状
    fruitStatus: '', // 果实症状
    plantType: '', // 植株类型
    plantSmell: '' // 植株气味
  },

  onLoad(options) {
    const cropType = options.cropType;
    const cropNameMap = {
      tomato: '番茄',
      cucumber: '黄瓜',
      rice: '水稻',
      wheat: '小麦',
      apple: '苹果',
      grape: '葡萄'
    };
    this.setData({
      cropType: cropType,
      cropName: cropNameMap[cropType] || '其他作物'
    });
  },

  saveAnswer(e) {
    const type = e.currentTarget.dataset.type;
    const value = e.detail.value;
    this.setData({ [type]: value });
  },

  getDiagnosis() {
    const { cropType, leafSpot, fruitStatus, plantType, plantSmell } = this.data;
    if (!leafSpot || !plantType) {
      wx.showToast({ title: '请完成必填选项', icon: 'none' });
      return;
    }
    const url = `/pages/result/result?` +
      `cropType=${cropType}&leafSpot=${leafSpot}&fruitStatus=${fruitStatus}&` +
      `plantType=${plantType}&plantSmell=${plantSmell}`;
    wx.navigateTo({ url });
  }
});