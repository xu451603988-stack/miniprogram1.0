// miniprogram/pages/diagnosis/result/result.js
// 诊断结果页：展示多模块结果 + 保存记录 + 跳转历史/专家页

const app = getApp();

Page({
  data: {
    isCombined: false,

    summary: "",
    summaryStatusLabel: "",
    summaryStatusClass: "none", // none / mild / moderate / severe

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

    console.log("【ResultPage】解析后数据:", raw);

    if (raw && raw.type === "combined" && raw.result) {
      this.initCombinedResult(raw);
    } else {
      this.initSingleResult(raw);
    }

    this.setData({ resultData: raw });
  },

  /* ========= 多模块结果初始化 ========= */
  initCombinedResult(raw) {
    const result = raw.result || {};
    const leafRaw = result.leaf || {};
    const fruitRaw = result.fruit || {};
    const rootRaw = result.root || {};
    const summaryRaw = result.summary || { hasIssue: false, mainModule: null };

    // 叶片
    const leafSeverityInfo = this.mapSeverity(leafRaw.severity);
    const leafCauseKey = leafRaw.mainCause || null;
    const leafReason = this.mapCauseToReason("leaf", leafCauseKey, leafSeverityInfo.level);
    const leafAdvice = this.mapCauseToAdvice("leaf", leafCauseKey, leafSeverityInfo.level);
    const leaf = {
      enabled: true,
      code: leafRaw.code || "",
      reason: leafReason,
      advice: leafAdvice,
      severityLabel: leafSeverityInfo.label,
      severityClass: leafSeverityInfo.className,
      icon: "🌿",
      title: "叶片诊断"
    };

    // 果实
    const fruitSeverityInfo = this.mapSeverity(fruitRaw.severity);
    const fruitCauseKey = fruitRaw.mainCause || null;
    const fruitReason = this.mapCauseToReason("fruit", fruitCauseKey, fruitSeverityInfo.level);
    const fruitAdvice = this.mapCauseToAdvice("fruit", fruitCauseKey, fruitSeverityInfo.level);
    const fruit = {
      enabled: true,
      code: fruitRaw.code || "",
      reason: fruitReason,
      advice: fruitAdvice,
      severityLabel: fruitSeverityInfo.label,
      severityClass: fruitSeverityInfo.className,
      icon: "🍊",
      title: "果实诊断"
    };

    // 根系
    const rootSeverityInfo = this.mapSeverity(rootRaw.severity);
    const rootCauseKey = rootRaw.mainCause || null;
    const rootReason = this.mapCauseToReason("root", rootCauseKey, rootSeverityInfo.level);
    const rootAdvice = this.mapCauseToAdvice("root", rootCauseKey, rootSeverityInfo.level);
    const root = {
      enabled: !rootRaw.skipped,
      code: rootRaw.code || "",
      reason: rootReason,
      advice: rootAdvice,
      severityLabel: rootSeverityInfo.label,
      severityClass: rootSeverityInfo.className,
      icon: "🌱",
      title: "根系诊断"
    };

    const summaryInfo = this.buildSummary(summaryRaw, leaf, fruit, root);
    const summaryText = this.buildSummaryText(summaryInfo);

    this.setData({
      isCombined: true,
      summary: summaryText,
      summaryStatusLabel: summaryInfo.mainSeverityLabel,
      summaryStatusClass: summaryInfo.mainSeverityClass || "none",
      leaf,
      fruit,
      root,
      rootSkipped: !!rootRaw.skipped
    });
  },

  /* ========= 单模块（兼容旧版本） ========= */
  initSingleResult(raw) {
    this.setData({
      isCombined: false,
      summary: "本次为单模块诊断，仅作测试使用。",
      summaryStatusLabel: "",
      summaryStatusClass: "none"
    });
  },

  /* ========= 顶部 summary 工具 ========= */
  buildSummary(summaryRaw, leaf, fruit, root) {
    const mainModule = summaryRaw.mainModule || null;
    let mainModuleName = "柑橘";
    let mainSeverityLabel = "正常 / 未见异常";
    let mainSeverityClass = "none";

    if (mainModule === "leaf" && leaf) {
      mainModuleName = "叶片";
      mainSeverityLabel = leaf.severityLabel;
      mainSeverityClass = leaf.severityClass;
    } else if (mainModule === "fruit" && fruit) {
      mainModuleName = "果实";
      mainSeverityLabel = fruit.severityLabel;
      mainSeverityClass = fruit.severityClass;
    } else if (mainModule === "root" && root) {
      mainModuleName = "根系";
      mainSeverityLabel = root.severityLabel;
      mainSeverityClass = root.severityClass;
    }

    return {
      mainModuleName,
      mainSeverityLabel,
      mainSeverityClass
    };
  },

  buildSummaryText(info) {
    if (!info || !info.mainModuleName) {
      return "本次诊断结果暂不明确，请结合下方各模块提示和田间实际情况综合判断。";
    }

    if (info.mainSeverityClass === "none") {
      return "当前柑橘整体未见明显异常，可按常规水肥与植保策略管理，适当加强巡园与记录，做到“早发现、早干预”。";
    }

    if (info.mainModuleName === "根系") {
      return "根系是柑橘健康的“根本”，本次诊断提示根区存在"
        + info.mainSeverityLabel
        + "，建议优先关注土壤水肥、通气和烂根风险，并参考下方根系诊断建议进行调整。";
    }

    return `${info.mainModuleName}存在${info.mainSeverityLabel}，请优先参考该模块的诊断与管理建议进行调整。`;
  },

  /* ========= severity 映射 ========= */
  mapSeverity(severity) {
    switch (severity) {
      case "mild":
        return { level: 1, label: "轻度异常", className: "mild" };
      case "moderate":
        return { level: 2, label: "中度异常", className: "moderate" };
      case "severe":
        return { level: 3, label: "重度异常", className: "severe" };
      default:
        return { level: 0, label: "正常 / 未见异常", className: "none" };
    }
  },

  /* ========= 原因 → 文案：诊断分析 ========= */
  mapCauseToReason(module, causeKey, level) {
    if (!causeKey) {
      if (level === 0) {
        return "本模块未检测到集中异常，整体状态基本平稳，可结合田间情况持续观察。";
      }
      return "本模块存在一定异常，但主导证候不够集中，更可能是多种轻中度因素叠加，建议结合现场表现综合研判。";
    }

    const base = {
      water_nutrient_imbalance: "以“水肥节奏失衡”为主：忽干忽湿、大水大肥或盐分累积，使树体短期内难以适应，表现为黄化、焦边、裂果等水分与营养波动的综合反应。",
      root_aeration_stagnation: "以“根区运行不畅”为主：土壤偏湿或板结，通气不足，根系长期轻度缺氧，有害物质与病原更容易积聚，导致烂根、黄化与树势衰弱。",
      vigor_deficiency: "以“树势偏虚”为主：细根和新梢活力不足，营养供应与分配能力下降，难以支撑挂果与环境波动，容易出现黄化、小果、坐果不良等表现。",
      microbe_imbalance: "以“微生态失衡”为主：根际或叶面有害菌群和有害生物优势明显，叠加高湿等环境条件，植株处于“邪气偏盛、正气不足”的状态，病斑和腐烂问题突出。",
      disease_pressure: "以“病虫压力偏高”为主：田间病虫基数较大，巡园可见明显虫体、虫迹或病斑、煤污等，说明当前防控强度和节奏偏弱，保护措施不足。",
      management_fluctuation: "以“管理节奏波动大”为主：近期水肥、药剂或其他操作起伏较大，存在一次性强刺激（如猛灌猛肥、连续重药等），树体需要时间恢复平衡。"
    };

    const prefixMap = {
      leaf: "叶片表现提示：",
      fruit: "果实表现提示：",
      root: "根系与土壤表现提示："
    };

    const prefix = prefixMap[module] || "";
    const text = base[causeKey];

    if (!text) {
      return prefix + "本模块已检测到异常，但尚无法锁定单一主导证候，建议结合系统风险雷达与当地技术人员意见进一步排查。";
    }
    return prefix + text;
  },

  /* ========= 原因 → 文案：管理调理建议 ========= */
  mapCauseToAdvice(module, causeKey, level) {
    if (!causeKey) {
      if (level === 0) {
        return "建议保持目前相对平稳的水肥与管理节奏，小步微调即可，重点是持续巡园记录变化，做到“早发现、早调整”。";
      }
      return "建议优先从“水肥节奏、根系环境、病虫防控、管理波动”四条线排查明显失衡环节，再结合当地农技或植保技术人员意见做精细调整。";
    }

    const base = {
      water_nutrient_imbalance: "管理上以“调水稳肥”为主：避免长期干旱后突然猛灌或一次性大水大肥，改为小水勤浇、薄肥勤施；检查水源与肥料盐分，必要时通过清水灌溉和覆盖等方式减小土壤水分与盐分波动。",
      root_aeration_stagnation: "以“疏水增氧、培土养根”为主：完善排水沟与暗管，雨前雨后保持根区不长时间积水；适度深松、添加腐熟有机肥和生物菌肥，改善土壤团粒结构，让根系“能呼吸、有空间”。",
      vigor_deficiency: "以“扶正培本、减负养树”为主：阶段性控制挂果量和梢量，避免长时间超负荷结果；增加有机肥和中微量元素，搭配生物菌肥促发新根，连续1–2季把树势养回来，再恢复高产目标。",
      microbe_imbalance: "以“抑邪扶正、改良环境”为主：在高风险时期提前做保护性用药，发病后选用针对性药剂并注意轮换；同时通过排水、通风、增施有机肥和菌肥等方式，为有益微生物提供更适宜的生存环境。",
      disease_pressure: "以“打早打小、压低基数”为主：建立固定巡园制度，重点关注嫩梢期和雨季前后，发现初期病虫及时处理；合理使用诱捕板、生物制剂与化学农药，做到精准防控，避免无效猛打和重复用药。",
      management_fluctuation: "以“管理节奏平滑化”为主：减少一次性极端操作（如高浓度肥水直冲、连续重药、多项操作同时叠加），改成可以预期的周节律管理，把水肥、药剂、修剪尽量安排在稳定、可执行的节奏里。"
    };

    const moduleTail = {
      leaf: "，同时注意改善通风透光条件，保持叶面清洁，减少长时间郁闭和潮湿。",
      fruit: "，并结合疏果、套袋、遮阴网等手段，在保护树势的前提下兼顾果实外观与内在品质。",
      root: "，后续配合定期查根和记录树势变化，适当调整灌溉时机与施肥深度，让根系有恢复和更新空间。"
    };

    const text = base[causeKey];
    const tail = moduleTail[module] || "";

    if (!text) {
      return "围绕“调水、养根、控害、稳管理”四个方向综合优化当前管理方案，避免短时间内频繁大幅度操作，给树一定的恢复时间。" + tail;
    }
    return text + tail;
  },

  /* ========= 页面交互 ========= */
  goHome() {
    wx.reLaunch({
      url: "/pages/index/index"
    });
  },

  retest() {
    wx.navigateBack({
      delta: 2
    });
  },

  // 新版：查看历史记录
  viewHistory() {
    wx.navigateTo({
      url: "/pages/diagnosis/history/history"
    });
  },

  // 兼容旧 wxml 里的 bindtap="goHistory"
  goHistory() {
    this.viewHistory();
  },

  /* ========= 诊断记录保存 ========= */
  saveRecord() {
    const data = this.data.resultData || {};
    const result = data.result || {};
    const now = new Date();

    const record = {
      id: Date.now(),
      time: `${now.getFullYear()}-${(now.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${now
        .getDate()
        .toString()
        .padStart(2, "0")} ${now
        .getHours()
        .toString()
        .padStart(2, "0")}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}`,
      summary: this.data.summary,
      crop: data.crop || "citrus",
      result
    };

    let list = [];
    try {
      const stored = wx.getStorageSync("diagnosisRecords");
      if (stored && Array.isArray(stored)) {
        list = stored;
      }
    } catch (e) {
      console.error("读取历史记录失败:", e);
      list = [];
    }

    list.unshift(record);
    if (list.length > 50) {
      list = list.slice(0, 50);
    }

    wx.setStorageSync("diagnosisRecords", list);

    wx.showToast({
      title: "已保存诊断记录",
      icon: "success"
    });
  },

  /* ========= 可选：联系植保顾问 ========= */
  contactDoctor() {
    wx.showActionSheet({
      itemList: ["复制植保顾问微信", "查看植保服务说明"],
      success: (res) => {
        if (res.tapIndex === 0) {
          wx.setClipboardData({
            data: "PlantDoctor001",
            success() {
              wx.showToast({ title: "已复制微信号", icon: "none" });
            }
          });
        } else if (res.tapIndex === 1) {
          wx.navigateTo({
            url: "/pages/diagnosis/expert/expert"
          });
        }
      }
    });
  }
});
