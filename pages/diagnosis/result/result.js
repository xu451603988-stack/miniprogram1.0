// miniprogram/pages/diagnosis/result/result.js

Page({
  data: {
    result: {},
    module: "",
    month: "",
    answers: {},
    diagnosisName: "",
    diagnosisSummary: "",
    suggestions: []
  },

  onLoad(options) {
    console.log("【ResultPage】收到参数:", options);

    if (!options.result) {
      wx.showToast({ title: "无诊断数据", icon: "none" });
      return;
    }

    let result = {};
    try {
      result = JSON.parse(decodeURIComponent(options.result));
    } catch (e) {
      console.error("解析失败:", e);
    }

    console.log("【ResultPage】解析后的数据:", result);

    const moduleType = result.module || "leaf";

    // 自动生成诊断名称（占位，后续可接入 AI 或规则）
    const diagnosisName = this.generateDiagnosisName(moduleType, result.answers);

    // 自动生成诊断摘要
    const summary = this.generateSummary(moduleType, result.answers);

    // 自动生成建议（简易版，可接具体算法生成）
    const suggestions = this.generateSuggestion(moduleType, result.answers);

    this.setData({
      result,
      module: moduleType,
      month: result.month,
      answers: result.answers,
      diagnosisName,
      diagnosisSummary: summary,
      suggestions
    });
  },

  // 根据模块展示不同标题
  generateDiagnosisName(moduleType, answers) {
    switch (moduleType) {
      case "leaf":
        return "叶片健康诊断结果";
      case "fruit":
        return "果实健康诊断结果";
      case "root":
        return "根系健康诊断结果";
      default:
        return "诊断结果";
    }
  },

  // 生成诊断摘要（简单模板，后期可接入智能算法）
  generateSummary(moduleType, answers) {
    if (moduleType === "leaf") {
      if (answers.symptoms?.includes("honeydew"))
        return "叶片出现黏液或煤污，可能受到刺吸式害虫影响。";

      if (answers.symptoms?.includes("whole_yellow"))
        return "叶片整体黄化，可能存在营养缺失或根系问题。";

      return "叶片存在一定异常，需要结合管理措施进一步判断。";
    }

    if (moduleType === "fruit") {
      if (answers.fruit_symptoms?.includes("sunburn"))
        return "果面出现晒伤斑，可能是强光直射导致。";

      if (answers.fruit_symptoms?.includes("surface_spots"))
        return "果面出现病斑，可能与病菌侵染或虫害有关。";

      return "果实存在一定异常，建议加强田间管理。";
    }

    if (moduleType === "root") {
      if (answers.root_condition?.includes("brown_rot"))
        return "根系褐变腐烂，可能存在严重根腐问题。";

      if (answers.soil_moisture === "flood")
        return "土壤积水，易导致缺氧、根腐。";

      return "根系存在一定异常，需要进一步改善土壤环境。";
    }

    return "暂无诊断摘要";
  },

  // 生成简单建议
  generateSuggestion(moduleType, answers) {
    const list = [];

    if (moduleType === "leaf") {
      list.push("检查是否有虫害或病斑，并及时处理。");
      if (answers.recent_events?.includes("hot"))
        list.push("近期高温，注意防止日灼。");
      if (answers.recent_events?.includes("heavy_n"))
        list.push("避免过量施氮肥，防止浓肥伤根。");
    }

    if (moduleType === "fruit") {
      list.push("检查果面是否有虫孔、裂果等问题。");
      if (answers.recent_events?.includes("rain"))
        list.push("连续降雨后要注意防病。");
    }

    if (moduleType === "root") {
      list.push("若根系褐变或腐烂，需及时改善排水和通气。");
      if (answers.soil_moisture === "flood")
        list.push("立即排水，避免根部缺氧。");
      if (answers.soil_condition?.includes("compaction"))
        list.push("土壤板结需深翻或施有机质改善。");
    }

    return list;
  },

  goHome() {
    wx.reLaunch({
      url: "/pages/welcome/welcome"
    });
  },

  redo() {
    wx.navigateBack({ delta: 1 });
  }
});
