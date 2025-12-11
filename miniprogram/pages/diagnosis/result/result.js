// miniprogram/pages/diagnosis/result/result.js
// 升级版：适配双引擎算法，支持展示微观病害与精准建议

const app = getApp();

Page({
  data: {
    isCombined: false,
    summary: "",
    summaryStatusLabel: "",
    summaryStatusClass: "none", 
    leaf: null,
    fruit: null,
    root: null,
    rootSkipped: false,
    resultData: null
  },

  onLoad(options) {
    console.log("【ResultPage】收到参数:", options);

    let raw = {};
    try {
      const str = options && options.result ? decodeURIComponent(options.result) : "{}";
      raw = JSON.parse(str || "{}");
    } catch (e) {
      console.error("【ResultPage】解析参数失败:", e);
      raw = {};
    }

    if (raw && raw.type === "combined" && raw.result) {
      this.initCombinedResult(raw);
    } else {
      this.initSingleResult(raw);
    }

    this.setData({ resultData: raw });
  },

  /* ========= 核心升级：优先使用引擎返回的精准文案 ========= */
  initCombinedResult(raw) {
    const result = raw.result || {};
    const leafRaw = result.leaf || {};
    const fruitRaw = result.fruit || {};
    const rootRaw = result.root || {};
    const summaryRaw = result.summary || { hasIssue: false, mainModule: null };

    // --- 1. 处理叶片模块 ---
    // 如果引擎返回了 suggestions 数组，直接拼接使用，不再调用 mapCauseToReason 瞎编
    const leaf = this.buildModuleDisplayData("leaf", leafRaw, "🌿", "叶片诊断");

    // --- 2. 处理果实模块 ---
    const fruit = this.buildModuleDisplayData("fruit", fruitRaw, "🍊", "果实诊断");

    // --- 3. 处理根系模块 ---
    const root = this.buildModuleDisplayData("root", rootRaw, "🌱", "根系诊断");
    root.enabled = !rootRaw.skipped;

    // --- 4. 生成顶部总结 ---
    const summaryText = this.buildSmartSummary(summaryRaw, leaf, fruit, root);
    const summaryInfo = this.getSummaryStatus(summaryRaw, leaf, fruit, root);

    this.setData({
      isCombined: true,
      summary: summaryText,
      summaryStatusLabel: summaryInfo.label,
      summaryStatusClass: summaryInfo.className,
      leaf,
      fruit,
      root,
      rootSkipped: !!rootRaw.skipped
    });
  },

  /**
   * 通用模块数据构建器（新版）
   * 优先展示引擎计算出的 "详细排查提示" 和 "调理原则"
   */
  buildModuleDisplayData(moduleKey, moduleData, icon, title) {
    const severityInfo = this.mapSeverity(moduleData.severity);
    
    let reasonText = "";
    let adviceText = "";

    // 检查引擎是否返回了新版建议数组
    if (moduleData.suggestions && moduleData.suggestions.length > 0) {
      // 这里的 suggestions[0] 通常是 "🔍 详细排查提示..."
      // suggestions[1] 是 "诊断主证..."
      // suggestions[2] 是 "调理原则..."
      
      // 我们把前两项合并显示在“分析”里
      reasonText = moduleData.suggestions.slice(0, 2).join("\n\n");
      
      // 把最后一项（调理原则）或者剩余的显示在“建议”里
      if (moduleData.suggestions.length > 2) {
        adviceText = moduleData.suggestions.slice(2).join("\n");
      } else {
        adviceText = "建议结合田间实际情况，参考上述提示进行针对性管理。";
      }
    } else {
      // 回退到旧版逻辑（兼容）
      const causeKey = moduleData.mainCause || null;
      reasonText = this.mapCauseToReason(moduleKey, causeKey, severityInfo.level);
      adviceText = this.mapCauseToAdvice(moduleKey, causeKey, severityInfo.level);
    }

    return {
      enabled: true,
      code: moduleData.code || "",
      reason: reasonText,
      advice: adviceText,
      severityLabel: severityInfo.label,
      severityClass: severityInfo.className,
      icon,
      title
    };
  },

  /**
   * 智能总结生成器（新版）
   * 会读取 microRisks (微观风险)
   */
  buildSmartSummary(summaryRaw, leaf, fruit, root) {
    // 1. 如果有微观风险（如：真菌、缺镁），优先展示
    if (summaryRaw.microRisks && summaryRaw.microRisks.length > 0) {
      const riskNames = summaryRaw.microRisks.map(r => r.name).join("、");
      return `【重点关注】本次诊断发现疑似 ${riskNames} 的特征。请重点检查对应部位，并参考下方的详细排查提示。`;
    }

    // 2. 如果没有微观风险，走常规逻辑
    const mainModule = summaryRaw.mainModule;
    if (!mainModule) {
      return "本次巡诊未发现明显异常，整体状况稳定，请继续保持。";
    }

    let moduleName = "作物";
    if (mainModule === "leaf") moduleName = "叶片";
    if (mainModule === "fruit") moduleName = "果实";
    if (mainModule === "root") moduleName = "根系";

    return `${moduleName}存在异常表现，系统评分显示风险偏高，请优先参考该模块建议。`;
  },

  getSummaryStatus(summaryRaw, leaf, fruit, root) {
    // 简单获取主状态
    const mainModule = summaryRaw.mainModule;
    let target = null;
    if (mainModule === "leaf") target = leaf;
    else if (mainModule === "fruit") target = fruit;
    else if (mainModule === "root") target = root;

    if (target) {
      return { label: target.severityLabel, className: target.severityClass };
    }
    return { label: "正常 / 未见异常", className: "none" };
  },

  /* ========= 辅助方法保持不变 ========= */
  mapSeverity(severity) {
    switch (severity) {
      case "mild": return { level: 1, label: "轻度异常", className: "mild" };
      case "moderate": return { level: 2, label: "中度异常", className: "moderate" };
      case "severe": return { level: 3, label: "重度异常", className: "severe" };
      default: return { level: 0, label: "正常", className: "none" };
    }
  },

  // (旧) 原因文案 - 仅做兜底
  mapCauseToReason(module, causeKey, level) {
    if (!causeKey) return "未检测到明显单一主证，建议综合观察。";
    const map = {
      water_nutrient_imbalance: "以“水肥节奏失衡”为主，表现为黄化或焦边。",
      root_aeration_stagnation: "以“根区运行不畅”为主，土壤可能偏湿或板结。",
      vigor_deficiency: "以“树势偏虚”为主，营养供应不足。",
      microbe_imbalance: "以“微生态失衡”为主，病原菌压力较大。",
      disease_pressure: "以“病虫压力偏高”为主，可见明显病斑或虫害。",
      management_fluctuation: "近期管理节奏波动较大，树体处于应激状态。"
    };
    return map[causeKey] || "存在综合性异常，请结合现场判断。";
  },

  // (旧) 建议文案 - 仅做兜底
  mapCauseToAdvice(module, causeKey, level) {
    const map = {
      water_nutrient_imbalance: "建议调水稳肥，避免忽干忽湿，改为小水勤浇。",
      root_aeration_stagnation: "建议疏水增氧，开沟排水，适度使用生根剂。",
      vigor_deficiency: "建议减负养树，补充有机肥和中微量元素。",
      microbe_imbalance: "建议补充生物菌肥，改善根际环境，针对性用药。",
      disease_pressure: "建议精准控害，及时清理病枝病果，降低基数。",
      management_fluctuation: "建议平稳管理节奏，避免一次性重肥重药。"
    };
    return map[causeKey] || "建议咨询植保专家进行现场查看。";
  },

  // 单模块逻辑（旧）
  initSingleResult(parsed) {
    this.setData({
      isCombined: false,
      summary: "本次为单模块测试。",
      summaryStatusLabel: "",
      summaryStatusClass: "none"
    });
  },

  /* ========= 页面交互 ========= */
  goHome() {
    wx.reLaunch({ url: "/pages/index/index" });
  },
  retest() {
    wx.navigateBack({ delta: 2 });
  },
  goHistory() {
    wx.navigateTo({ url: "/pages/diagnosis/history/history" });
  },
  contactDoctor() {
    wx.showActionSheet({
      itemList: ["复制植保顾问微信", "查看植保服务说明"],
      success: (res) => {
        if (res.tapIndex === 0) {
          wx.setClipboardData({ data: "PlantDoctor001" });
        } else if (res.tapIndex === 1) {
          wx.navigateTo({ url: "/pages/diagnosis/expert/expert" });
        }
      }
    });
  },

  saveRecord() {
    const data = this.data.resultData || {};
    const result = data.result || {};
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2,'0')}-${now.getDate().toString().padStart(2,'0')} ${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;

    const record = {
      id: Date.now(),
      time: timeStr,
      summary: this.data.summary, // 保存新版总结
      crop: data.crop || "citrus",
      result
    };

    let list = wx.getStorageSync("diagnosisRecords") || [];
    if (!Array.isArray(list)) list = [];
    list.unshift(record);
    if (list.length > 50) list = list.slice(0, 50);
    
    wx.setStorageSync("diagnosisRecords", list);
    wx.showToast({ title: "已保存", icon: "success" });
  }
});