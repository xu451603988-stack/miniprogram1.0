// miniprogram/pages/diagnosis/result/result.js
const app = getApp();

Page({
  data: {
    resultData: null,       // 完整结果数据（来自 question 页 encode）
    isCombined: false,      // 是否组合模式
    finalCode: "",
    summary: "",
    details: [],
    suggestions: [],

    leaf: null,
    fruit: null,
    root: null,

    rootSkipped: false
  },

  onLoad(options) {
    console.log("【ResultPage】options:", options);

    if (!options.result) {
      wx.showModal({
        title: "数据错误",
        content: "未接收到诊断结果。",
        showCancel: false
      });
      return;
    }

    let parsed = {};
    try {
      parsed = JSON.parse(decodeURIComponent(options.result));
    } catch (err) {
      console.error("结果解析失败:", err);
      wx.showModal({
        title: "解析失败",
        content: "无法读取诊断结果。",
        showCancel: false
      });
      return;
    }

    console.log("【ResultPage】parsed:", parsed);

    // 判断是否组合模式
    const isCombined = parsed.type === "combined";

    this.setData(
      {
        resultData: parsed,
        isCombined
      },
      () => {
        if (isCombined) this.processCombined(parsed);
        else this.processSingle(parsed);
      }
    );
  },

  /* ---------------------------------------
   * 单模块结果处理
   * parsed = {
   *   module: "leaf",
   *   crop,
   *   month,
   *   answers: {},
   *   finalCode: "xxx"
   * }
   * --------------------------------------- */
  processSingle(parsed) {
    const engine = app.globalData && app.globalData.diagnosticEngine;
    let res = {};

    try {
      if (engine && typeof engine.renderResult === "function") {
        res = engine.renderResult(parsed.finalCode);
      } else {
        res = {
          summary: "未获取到分析结果。",
          details: [],
          suggestions: []
        };
      }
    } catch (e) {
      res = {
        summary: "诊断渲染失败。",
        details: [],
        suggestions: []
      };
    }

    this.setData({
      finalCode: parsed.finalCode || "",
      summary: res.summary || "暂无总结",
      details: res.details || [],
      suggestions: res.suggestions || []
    });
  },

  /* ---------------------------------------
   * 组合模式结果结构：
   * parsed = {
   *   type: "combined",
   *   payload: {
   *     crop, month,
   *     positions: ["leaf","fruit"],
   *     answers: { leaf:{}, fruit:{}, root:{} },
   *     rootQuick: "healthy" | null
   *   },
   *   result: {
   *     leaf: {...},
   *     fruit: {...},
   *     root: {...},
   *     summary: "...",
   *     suggestions: [...]
   *   }
   * }
   * --------------------------------------- */
  processCombined(parsed) {
    const r = parsed.result || {};
    const payload = parsed.payload || {};

    this.setData({
      leaf: r.leaf || null,
      fruit: r.fruit || null,
      root: r.root || null,
      summary: r.summary || "暂无总结",
      suggestions: r.suggestions || [],
      rootSkipped: payload.rootQuick === "healthy"
    });
  },

  /* ---------------------------------------
   * 页面交互：回首页 / 重新测试
   * --------------------------------------- */
  goHome() {
    wx.reLaunch({
      url: "/pages/index/index"
    });
  },

  retest() {
    wx.navigateBack({
      delta: 2
    });
  }
});
