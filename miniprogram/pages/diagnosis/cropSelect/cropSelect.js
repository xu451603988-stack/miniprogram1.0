// miniprogram/pages/diagnosis/cropSelect/cropSelect.js
const app = getApp();

Page({
  data: {
    crops: [
      {
        key: "citrus",
        name: "柑橘",
        desc: "橙、柚、桔、柠檬等",
        enabled: true
      },
      {
        key: "apple",
        name: "苹果",
        desc: "富士、嘎啦、金帅等",
        enabled: false
      },
      {
        key: "grape",
        name: "葡萄",
        desc: "巨峰、夏黑、阳光玫瑰等",
        enabled: false
      },
      {
        key: "peach",
        name: "桃",
        desc: "水蜜桃、黄桃、油桃等",
        enabled: false
      }
    ]
  },

  onLoad() {
    console.log("[CropSelect] 作物选择页加载完成");
  },

  // 点击作物卡片
  onSelectCrop(e) {
    const key = e.currentTarget.dataset.key;
    const crop = this.data.crops.find(c => c.key === key);
    if (!crop) return;

    // 非柑橘先禁用：只给提示，不导航
    if (!crop.enabled || key !== "citrus") {
      wx.showToast({
        title: "当前仅开放柑橘诊断，其他作物开发中",
        icon: "none",
        duration: 2000
      });
      return;
    }

    console.log("[CropSelect] 选择作物:", key);

    // 记录当前作物到全局，后面问卷会用到
    app.globalData = app.globalData || {};
    app.globalData.currentCrop = key;

    // 跳转到部位选择页
    wx.navigateTo({
      url: `/pages/diagnosis/positionSelect/positionSelect?crop=${key}`,
      success() {
        console.log("[CropSelect] 跳转成功: 位置选择页");
      }
    });
  }
});
