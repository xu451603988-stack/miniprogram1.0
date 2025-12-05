// miniprogram/pages/diagnosis/result/result.js
const diagnosticEngine = require("../../../utils/newDiagnosticEngine.js");

Page({
  data: {
    rawData: null,        // 原始问卷数据
    analysis: null,       // 诊断分析结果
    loading: true,        // 显示 “正在生成诊断报告”
    moduleName: "",       // 页面标题：叶片/果实/根系
  },

  onLoad(options) {
    console.log("【ResultPage】收到参数:", options);

    if (!options.result) {
      wx.showToast({ title: "诊断数据缺失", icon: "error" });
      return;
    }

    const rawData = JSON.parse(decodeURIComponent(options.result));
    console.log("【ResultPage】解析后的数据:", rawData);

    this.setData({
      rawData,
      moduleName: this.mapModuleName(rawData.module)
    });

    this.runAnalysis(rawData);
  },

  // 映射模块中文名
  mapModuleName(type) {
    if (type === "leaf") return "叶片诊断结果";
    if (type === "fruit") return "果实诊断结果";
    if (type === "root") return "根系诊断结果";
    return "诊断结果";
  },

  // 运行诊断算法
  runAnalysis(raw) {
    wx.showLoading({ title: "AI诊断中...", mask: true });

    const analysis = diagnosticEngine.run(raw);
    console.log("【ResultPage】诊断完成:", analysis);

    this.setData({
      analysis,
      loading: false
    });

    wx.hideLoading();
  },

  // 重新诊断
  redo() {
    wx.redirectTo({
      url: "/pages/diagnosis/cropSelect/cropSelect"
    });
  }
});
