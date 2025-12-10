// miniprogram/pages/diagnosis/history/history.js

const severityWeight = {
  none: 0,
  mild: 1,
  moderate: 2,
  severe: 3
};

function getSeverityInfo(severity) {
  switch (severity) {
    case "mild":
      return { label: "轻度异常", className: "mild" };
    case "moderate":
      return { label: "中度异常", className: "moderate" };
    case "severe":
      return { label: "重度异常", className: "severe" };
    default:
      return { label: "正常 / 未见异常", className: "none" };
  }
}

function moduleNameFromCode(code) {
  if (code === "leaf") return "叶片";
  if (code === "fruit") return "果实";
  if (code === "root") return "根系";
  return "";
}

function decorateRecord(raw) {
  if (!raw) return null;
  const record = JSON.parse(JSON.stringify(raw));

  let cropLabel = "作物";
  if (record.crop === "citrus") {
    cropLabel = "柑橘";
  } else if (record.crop === "other") {
    cropLabel = "其他作物";
  } else if (record.cropName) {
    cropLabel = record.cropName;
  }

  const result = record.result || {};
  const summary = result.summary || {};
  const leaf = result.leaf || {};
  const fruit = result.fruit || {};
  const root = result.root || {};

  const modules = [];
  if (leaf && leaf.severity) modules.push({ code: "leaf", severity: leaf.severity });
  if (fruit && fruit.severity) modules.push({ code: "fruit", severity: fruit.severity });
  if (root && root.severity) modules.push({ code: "root", severity: root.severity });

  let mainModuleName = "";
  let mainSeverityLabel = "";
  let mainSeverityClass = "none";

  if (modules.length) {
    modules.sort((a, b) => {
      return severityWeight[b.severity || "none"] - severityWeight[a.severity || "none"];
    });
    const main = modules[0];
    const sevInfo = getSeverityInfo(main.severity);
    mainModuleName = moduleNameFromCode(main.code);
    mainSeverityLabel = sevInfo.label;
    mainSeverityClass = sevInfo.className;
  } else if (summary && typeof summary.hasIssue === "boolean") {
    mainModuleName = moduleNameFromCode(summary.mainModule);
    const sevInfo = summary.hasIssue ? getSeverityInfo("mild") : getSeverityInfo("none");
    mainSeverityLabel = sevInfo.label;
    mainSeverityClass = sevInfo.className;
  }

  let systemBrief = "";
  const scores = summary.systemScores || {};
  const parts = [];
  if (typeof scores.soil === "number") parts.push("土壤 " + scores.soil);
  if (typeof scores.crop === "number") parts.push("作物本体 " + scores.crop);
  if (typeof scores.microbe === "number") parts.push("微生态 " + scores.microbe);
  if (typeof scores.environment === "number") parts.push("环境 " + scores.environment);
  if (typeof scores.management === "number") parts.push("管理 " + scores.management);
  if (parts.length) {
    systemBrief = parts.join(" · ");
  }

  record.displayCrop = cropLabel;
  record.mainModuleName = mainModuleName;
  record.mainSeverityLabel = mainSeverityLabel;
  record.mainSeverityClass = mainSeverityClass;
  record.systemBrief = systemBrief;
  record.summary = record.summary || "";

  return record;
}

Page({
  data: {
    records: []
  },

  onShow() {
    this.loadRecords();
  },

  loadRecords() {
    let list = [];
    try {
      list = wx.getStorageSync("diagnosisRecords") || [];
    } catch (e) {
      list = [];
    }
    if (!Array.isArray(list)) list = [];
    const decorated = list.map(decorateRecord).filter(Boolean);
    this.setData({ records: decorated });
  },

  clearAll() {
    const that = this;
    wx.showModal({
      title: "清空记录",
      content: "确定要清空所有本地诊断记录吗？此操作不可恢复。",
      success(res) {
        if (res.confirm) {
          wx.removeStorageSync("diagnosisRecords");
          that.setData({ records: [] });
        }
      }
    });
  }
});
