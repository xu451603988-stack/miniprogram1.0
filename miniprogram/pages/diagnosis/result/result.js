// miniprogram/pages/diagnosis/result/result.js
const app = getApp();

Page({
  data: {
    // --- 核心控制字段 ---
    resultType: "decision_tree_v5", // 强制启用新版 UI 逻辑
    
    // --- UI 渲染对象 (对应 result.wxml 的 report 结构) ---
    report: null, 

    // --- 原始数据保留 ---
    resultData: null,
    isCombined: false,
    finalCode: "",
    
    // 旧版兼容字段 (如果还需要兼容旧逻辑可保留)
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

    // 判断是否组合模式
    const isCombined = parsed.type === "combined";

    this.setData({
      resultData: parsed,
      isCombined
    }, () => {
      // 根据模式处理数据
      if (isCombined) {
        this.processCombined(parsed);
      } else {
        this.processSingle(parsed);
      }
    });
  },

  /* ---------------------------------------
   * 核心方法：构建 UI 渲染所需的 report 对象
   * 将原始的 summary/suggestions 转换为 wxml 需要的格式
   * --------------------------------------- */
  buildReport(baseInfo, analysisResult) {
    const { crop, month, finalCode } = baseInfo;
    const { summary, suggestions } = analysisResult;

    // 1. 计算风险等级 (示例逻辑：根据建议数量或特定关键词判断)
    // 实际项目中，你应该根据 finalCode 或后端返回的 severity 字段来判断
    let severity = "mild";       // 默认低风险
    let severityLabel = "健康";

    if (suggestions.length >= 3) {
      severity = "severe";
      severityLabel = "高风险";
    } else if (suggestions.length > 0) {
      severity = "moderate";
      severityLabel = "中风险";
    }

    // 2. 格式化方案列表 (WXML 需要 type 和 content)
    const formattedSolutions = (suggestions || []).map((item, index) => {
      // 简单的逻辑：第一条作为主要手段，其余为辅助
      return {
        type: index === 0 ? "针对性调理" : "系统固本", 
        content: item
      };
    });

    // 3. 组装最终对象
    const report = {
      title: `${crop || '作物'} · 健康诊断报告`,
      time: new Date().toLocaleDateString(), // 显示当前日期
      severity: severity,         // 'severe' | 'moderate' | 'mild' (控制颜色)
      severityLabel: severityLabel,
      tags: [crop, month || "生长季", "智能诊断"],
      logic: summary || "根据当前症状分析，作物生长状况基本正常，建议持续监测。",
      solutions: formattedSolutions
    };

    // 4. 更新视图
    this.setData({
      report: report,
      // 同步旧字段以备不时之需
      summary: summary,
      suggestions: suggestions,
      finalCode: finalCode
    });
  },

  /* ---------------------------------------
   * 单模块处理
   * --------------------------------------- */
  processSingle(parsed) {
    const engine = app.globalData && app.globalData.diagnosticEngine;
    let res = {};

    try {
      if (engine && typeof engine.renderResult === "function") {
        res = engine.renderResult(parsed.finalCode);
      } else {
        // 模拟数据 (如果引擎未加载)
        res = {
          summary: "未能调用分析引擎，显示默认结果。",
          suggestions: ["建议检查网络连接", "尝试重新诊断"]
        };
      }
    } catch (e) {
      console.error(e);
      res = {
        summary: "诊断数据渲染异常。",
        suggestions: []
      };
    }

    // 调用构建器更新 UI
    this.buildReport(
      { crop: parsed.crop, month: parsed.month, finalCode: parsed.finalCode },
      res
    );
  },

  /* ---------------------------------------
   * 组合模式处理
   * --------------------------------------- */
  processCombined(parsed) {
    const r = parsed.result || {};
    const payload = parsed.payload || {};

    // 提取核心信息
    const summary = r.summary || "暂无综合总结";
    const suggestions = r.suggestions || [];

    // 调用构建器更新 UI
    this.buildReport(
      { crop: payload.crop, month: payload.month, finalCode: "COMBINED" },
      { summary, suggestions }
    );

    // 保留原始数据结构
    this.setData({
      leaf: r.leaf || null,
      fruit: r.fruit || null,
      root: r.root || null,
      rootSkipped: payload.rootQuick === "healthy"
    });
  },

  /* ---------------------------------------
   * 页面交互
   * --------------------------------------- */
  goHome() {
    wx.reLaunch({
      url: "/pages/index/index"
    });
  },

  retest() {
    wx.navigateBack({
      delta: 2 // 返回到选择/上传页
    });
  },

  contactDoctor() {
    wx.showToast({
      title: '即将开放专家连线',
      icon: 'none'
    });
  }
});