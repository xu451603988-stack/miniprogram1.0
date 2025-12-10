// miniprogram/utils/newDiagnosticEngine.js
/**
 * 柑橘健康诊断 · 中医式植保算法引擎
 *
 * 使用说明：
 *   const Engine = require("../../utils/newDiagnosticEngine.js");
 *   const result = Engine.runCombined({ positions, answers, month, crop });
 *
 * 输出结构：
 *   { leaf, fruit, root, summary }
 *   - 每个模块：{ module, severity, primarySyndrome, syndromes, subsystem, suggestions, mainCause }
 *   - summary：{ type, hasIssue, mainModule, mainSyndromes, systemScores }
 */

// ---------------------- 通用工具函数 ----------------------

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj || {}));
}

function rankScores(map) {
  const list = Object.keys(map || {}).map(key => ({
    code: key,
    score: map[key]
  }));
  list.sort((a, b) => b.score - a.score);
  return list;
}

function determineSeverity(maxScore) {
  if (maxScore >= 12) return "severe";
  if (maxScore >= 6)  return "moderate";
  if (maxScore >= 3)  return "mild";
  return "none";
}

function mergeSubsystemScores(list) {
  const merged = { soil: 0, crop: 0, microbe: 0, environment: 0, management: 0 };
  (list || []).forEach(item => {
    if (!item) return;
    Object.keys(merged).forEach(k => {
      if (item[k] != null) merged[k] += item[k];
    });
  });
  return merged;
}

function normalizeSubsystemScores(scores) {
  const norm = deepClone(scores || {});
  let max = 0;
  Object.keys(norm).forEach(k => {
    if (norm[k] > max) max = norm[k];
  });
  if (max <= 0) {
    Object.keys(norm).forEach(k => (norm[k] = 0));
  } else {
    Object.keys(norm).forEach(k => {
      norm[k] = Math.round((norm[k] / max) * 100);
    });
  }
  return norm;
}

// ---------------------- 证候与子系统定义 ----------------------

const SYNDROME_META = {
  water_nutrient_imbalance: {
    name: "水肥失衡（水湿/干旱/盐害）",
    principles: ["调水", "稳肥", "减小波动"]
  },
  root_aeration_stagnation: {
    name: "根区运行不畅（缺氧/板结）",
    principles: ["疏水排湿", "增加通气", "活化根系"]
  },
  vigor_deficiency: {
    name: "作物体质偏虚（树势弱）",
    principles: ["扶正培本", "补养根叶", "减轻负载"]
  },
  microbe_imbalance: {
    name: "微生态失衡（有害菌压力大）",
    principles: ["抑邪扶正", "改善根际环境"]
  },
  disease_pressure: {
    name: "病虫压力偏高（易感体系）",
    principles: ["精准控害", "打早打小", "降低基数"]
  },
  management_fluctuation: {
    name: "管理节奏波动大",
    principles: ["平稳管理", "避免一次性强刺激"]
  }
};

const EMPTY_SUBSYSTEM = {
  soil: 0,
  crop: 0,
  microbe: 0,
  environment: 0,
  management: 0
};

// ---------------------- 规则表工具 ----------------------

function makeRule(field, option, syndromes, subsystems) {
  return {
    field,
    option,
    syndromes: syndromes || {},
    subsystems: subsystems || {}
  };
}

// ---------------------- 叶片模块规则表 ----------------------
// 对应：data/questionnaire/leaf_questions.js
// id: leaf_age / symptoms / distribution / severity / onset / recent_events

const LEAF_TCM_RULES = [
  // 叶片主要症状（symptoms）
  makeRule("symptoms", "interveinal_chlorosis",
    { vigor_deficiency: 1, water_nutrient_imbalance: 1 },
    { crop: 2, soil: 1 }),
  makeRule("symptoms", "vein_chlorosis",
    { water_nutrient_imbalance: 1 },
    { soil: 1, crop: 1 }),
  makeRule("symptoms", "mottling_variegation",
    { disease_pressure: 2, vigor_deficiency: 1 },
    { crop: 2 }),
  makeRule("symptoms", "local_spots_lesions",
    { disease_pressure: 2, microbe_imbalance: 1 },
    { microbe: 2, environment: 1 }),
  makeRule("symptoms", "water_soaked_spots",
    { water_nutrient_imbalance: 1, microbe_imbalance: 1 },
    { soil: 1, microbe: 2 }),
  makeRule("symptoms", "necrotic_margin",
    { water_nutrient_imbalance: 2, management_fluctuation: 1 },
    { soil: 2, crop: 1, management: 1 }),
  makeRule("symptoms", "tip_burn",
    { water_nutrient_imbalance: 2, management_fluctuation: 1 },
    { soil: 1, crop: 1, management: 1 }),
  makeRule("symptoms", "leaf_curl",
    { root_aeration_stagnation: 1, water_nutrient_imbalance: 1, disease_pressure: 1 },
    { crop: 2, environment: 1 }),
  makeRule("symptoms", "chlorotic_whole_leaf",
    { vigor_deficiency: 3 },
    { crop: 3, soil: 1 }),
  makeRule("symptoms", "honeydew_sooty",
    { disease_pressure: 2 },
    { environment: 1, crop: 1 }),
  makeRule("symptoms", "insects_visible",
    { disease_pressure: 3 },
    { environment: 1, crop: 1, management: 1 }),

  // 分布模式（distribution）
  makeRule("distribution", "sectoral",
    { disease_pressure: 1 },
    { crop: 1 }),
  makeRule("distribution", "uniform",
    { vigor_deficiency: 1, water_nutrient_imbalance: 1 },
    { soil: 1, crop: 1 }),
  makeRule("distribution", "scattered",
    { disease_pressure: 1 },
    { environment: 1 }),

  // 整体受害程度（severity）
  makeRule("severity", "light",
    { }, { }),
  makeRule("severity", "medium",
    { vigor_deficiency: 1, disease_pressure: 1 },
    { crop: 1 }),
  makeRule("severity", "heavy",
    { vigor_deficiency: 2, disease_pressure: 2, water_nutrient_imbalance: 1 },
    { crop: 2, soil: 1 }),

  // 发病速度（onset）
  makeRule("onset", "overnight",
    { water_nutrient_imbalance: 2, management_fluctuation: 1 },
    { management: 1, environment: 1 }),
  makeRule("onset", "days",
    { disease_pressure: 1 },
    { environment: 1 }),
  makeRule("onset", "weeks",
    { vigor_deficiency: 1, microbe_imbalance: 1 },
    { crop: 1, microbe: 1 }),

  // 近期事件（recent_events，多选）
  makeRule("recent_events", "ev_rain",
    { root_aeration_stagnation: 1, microbe_imbalance: 1 },
    { soil: 1, microbe: 1 }),
  makeRule("recent_events", "ev_hot",
    { water_nutrient_imbalance: 1 },
    { environment: 2 }),
  makeRule("recent_events", "ev_heavy_n",
    { water_nutrient_imbalance: 1, vigor_deficiency: 1, management_fluctuation: 1 },
    { soil: 1, crop: 1, management: 1 }),
  makeRule("recent_events", "ev_recent_spray",
    { management_fluctuation: 2 },
    { management: 2 }),
  makeRule("recent_events", "ev_freq_irrig",
    { root_aeration_stagnation: 2, water_nutrient_imbalance: 1 },
    { soil: 2, management: 1 })
];

// ---------------------- 果实模块规则表 ----------------------
// 对应：fruit_questions.js
// id: fruit_position / fruit_symptoms / fruit_size / severity / onset / recent_events

const FRUIT_TCM_RULES = [
  // 果位（fruit_position）
  makeRule("fruit_position", "outer",
    { disease_pressure: 1, water_nutrient_imbalance: 1 },
    { environment: 2 }),
  makeRule("fruit_position", "inner",
    { vigor_deficiency: 1 },
    { crop: 1 }),
  makeRule("fruit_position", "lower",
    { water_nutrient_imbalance: 2, microbe_imbalance: 1 },
    { soil: 1, environment: 1 }),
  makeRule("fruit_position", "upper",
    { water_nutrient_imbalance: 1 },
    { environment: 2 }),

  // 果面症状（fruit_symptoms）
  makeRule("fruit_symptoms", "surface_spots_pits",
    { disease_pressure: 2, microbe_imbalance: 1 },
    { microbe: 2, environment: 1 }),
  makeRule("fruit_symptoms", "oily_spots",
    { microbe_imbalance: 2 },
    { microbe: 2 }),
  makeRule("fruit_symptoms", "sunburn_burn",
    { water_nutrient_imbalance: 2 },
    { environment: 2 }),
  makeRule("fruit_symptoms", "cracking_split",
    { water_nutrient_imbalance: 3, management_fluctuation: 1 },
    { soil: 1, crop: 1, management: 1 }),
  makeRule("fruit_symptoms", "color_inversion_green_when_ripen",
    { vigor_deficiency: 2 },
    { crop: 2 }),
  makeRule("fruit_symptoms", "premature_drop",
    { vigor_deficiency: 1, water_nutrient_imbalance: 1, management_fluctuation: 1 },
    { crop: 1, soil: 1, management: 1 }),
  makeRule("fruit_symptoms", "oviposition_punctures",
    { disease_pressure: 3 },
    { environment: 1, management: 1 }),
  makeRule("fruit_symptoms", "small_lopsided",
    { vigor_deficiency: 2 },
    { crop: 2 }),

  // 果大小（fruit_size）
  makeRule("fruit_size", "small",
    { vigor_deficiency: 2 },
    { crop: 2 }),
  makeRule("fruit_size", "large",
    { water_nutrient_imbalance: 1, management_fluctuation: 1 },
    { crop: 1, management: 1 }),

  // 受害程度（severity）
  makeRule("severity", "light",
    { }, { }),
  makeRule("severity", "medium",
    { disease_pressure: 1, vigor_deficiency: 1 },
    { crop: 1 }),
  makeRule("severity", "heavy",
    { disease_pressure: 2, vigor_deficiency: 2, water_nutrient_imbalance: 1 },
    { crop: 2, soil: 1 }),

  // 发展速度（onset）
  makeRule("onset", "overnight",
    { water_nutrient_imbalance: 1, management_fluctuation: 1 },
    { management: 1 }),
  makeRule("onset", "days",
    { disease_pressure: 1 },
    { environment: 1 }),
  makeRule("onset", "weeks",
    { vigor_deficiency: 1 },
    { crop: 1 }),

  // 近期事件（recent_events）
  makeRule("recent_events", "ev_rain",
    { microbe_imbalance: 1, disease_pressure: 1 },
    { microbe: 1, environment: 1 }),
  makeRule("recent_events", "ev_hot",
    { water_nutrient_imbalance: 2 },
    { environment: 2 }),
  makeRule("recent_events", "ev_heavy_n",
    { water_nutrient_imbalance: 1, management_fluctuation: 1 },
    { soil: 1, management: 1 }),
  makeRule("recent_events", "ev_recent_spray",
    { management_fluctuation: 2 },
    { management: 2 }),
  makeRule("recent_events", "ev_pollination_issue",
    { vigor_deficiency: 1, management_fluctuation: 1 },
    { crop: 1, management: 1 })
];

// ---------------------- 根系模块规则表 ----------------------
// 对应：root_questions.js
// id: soil_condition / root_symptoms / soil_smell / recent_events

const ROOT_TCM_RULES = [
  // 土壤状态（soil_condition）
  makeRule("soil_condition", "wet",
    { water_nutrient_imbalance: 2, root_aeration_stagnation: 3, microbe_imbalance: 1 },
    { soil: 3, microbe: 1 }),
  makeRule("soil_condition", "dry",
    { water_nutrient_imbalance: 2 },
    { soil: 2, environment: 1 }),

  // 根系症状（root_symptoms）
  makeRule("root_symptoms", "root_rot_black",
    { root_aeration_stagnation: 2, microbe_imbalance: 2 },
    { soil: 2, microbe: 2 }),
  makeRule("root_symptoms", "few_fine_roots",
    { vigor_deficiency: 2 },
    { crop: 2, soil: 1 }),
  makeRule("root_symptoms", "root_peel_off",
    { root_aeration_stagnation: 1, microbe_imbalance: 2 },
    { soil: 1, microbe: 2 }),
  makeRule("root_symptoms", "red_root",
    { water_nutrient_imbalance: 1 },
    { soil: 1 }),
  // no_symptom 不加分，保持为潜在隐患

  // 土壤气味（soil_smell）
  makeRule("soil_smell", "sulfide",
    { root_aeration_stagnation: 3, microbe_imbalance: 2 },
    { soil: 2, microbe: 2 }),
  makeRule("soil_smell", "mold",
    { microbe_imbalance: 2, water_nutrient_imbalance: 1 },
    { soil: 1, microbe: 2 }),

  // 近期管理事件（recent_events）
  makeRule("recent_events", "ev_over_irrigation",
    { water_nutrient_imbalance: 2, root_aeration_stagnation: 2, management_fluctuation: 2 },
    { soil: 2, management: 2 }),
  makeRule("recent_events", "ev_rain",
    { water_nutrient_imbalance: 1, root_aeration_stagnation: 1 },
    { soil: 1, environment: 1 }),
  makeRule("recent_events", "ev_deep_tillage",
    { vigor_deficiency: 1, management_fluctuation: 1 },
    { crop: 1, management: 1 }),
  makeRule("recent_events", "ev_organic",
    { microbe_imbalance: 1, management_fluctuation: 1 },
    { soil: 1, microbe: 1, management: 1 })
];

// ---------------------- 规则执行 ----------------------

function accumulateTCM(rules, answers) {
  const syndromeScores = {};
  const subsystemScores = deepClone(EMPTY_SUBSYSTEM);
  let hitCount = 0;

  (rules || []).forEach(rule => {
    const val = answers[rule.field];
    if (val == null) return;

    let matched = false;
    if (Array.isArray(val)) {
      matched = val.includes(rule.option);
    } else {
      matched = val === rule.option;
    }
    if (!matched) return;

    hitCount += 1;

    Object.keys(rule.syndromes || {}).forEach(code => {
      syndromeScores[code] = (syndromeScores[code] || 0) + rule.syndromes[code];
    });

    Object.keys(rule.subsystems || {}).forEach(code => {
      subsystemScores[code] = (subsystemScores[code] || 0) + rule.subsystems[code];
    });
  });

  return { syndromeScores, subsystemScores, hitCount };
}

function buildModuleResult(module, answers, context) {
  let rules = [];
  if (module === "leaf") rules = LEAF_TCM_RULES;
  else if (module === "fruit") rules = FRUIT_TCM_RULES;
  else if (module === "root") rules = ROOT_TCM_RULES;

  const { syndromeScores, subsystemScores, hitCount } = accumulateTCM(rules, answers || {});
  const ranked = rankScores(syndromeScores);
  const primary = ranked.length ? ranked[0] : null;
  const severity = determineSeverity(primary ? primary.score : 0);
  const normalizedSubsystem = normalizeSubsystemScores(subsystemScores);

  const suggestions = [];
  if (primary && SYNDROME_META[primary.code]) {
    suggestions.push(
      "诊断主证：" + SYNDROME_META[primary.code].name,
      "调理原则：" + SYNDROME_META[primary.code].principles.join("、")
    );
  } else {
    suggestions.push("当前未形成集中主证，可结合现场情况综合判断。");
  }

  return {
    module,
    severity,
    hitCount,
    primarySyndrome: primary,
    syndromes: ranked,
    subsystemRaw: subsystemScores,
    subsystem: normalizedSubsystem,
    suggestions,
    // 为了兼容旧结果页，把主证 code 挂到 mainCause 上
    mainCause: primary ? primary.code : null
  };
}

// ---------------------- 导出引擎接口 ----------------------

const DiagnosticEngine = {
  run(options) {
    const module = options && options.module;
    const answers = (options && options.answers) || {};
    if (!module) {
      throw new Error("newDiagnosticEngine.run: module 不能为空");
    }
    return buildModuleResult(module, answers, options || {});
  },

  runCombined(options) {
    const positions = (options && options.positions) || [];
    const allAnswers = (options && options.answers) || {};
    const month = options && options.month;
    const crop = options && options.crop;

    const leaf = positions.includes("leaf")
      ? buildModuleResult("leaf", allAnswers.leaf || {}, { month, crop })
      : null;
    const fruit = positions.includes("fruit")
      ? buildModuleResult("fruit", allAnswers.fruit || {}, { month, crop })
      : null;
    const root = buildModuleResult("root", allAnswers.root || {}, { month, crop });

    const candidates = [leaf, fruit, root].filter(Boolean);
    let mainModule = null;
    if (candidates.length) {
      candidates.sort((a, b) => {
        const aw = a.primarySyndrome ? a.primarySyndrome.score : 0;
        const bw = b.primarySyndrome ? b.primarySyndrome.score : 0;
        return bw - aw;
      });
      mainModule = candidates[0].module;
    }

    const systemScoresRaw = mergeSubsystemScores([
      leaf && leaf.subsystemRaw,
      fruit && fruit.subsystemRaw,
      root && root.subsystemRaw
    ]);
    const systemScores = normalizeSubsystemScores(systemScoresRaw);

    const hasIssue = candidates.some(c => c.severity !== "none");

    const mergedSyndromeScores = {};
    candidates.forEach(c => {
      (c.syndromes || []).forEach(s => {
        mergedSyndromeScores[s.code] = (mergedSyndromeScores[s.code] || 0) + s.score;
      });
    });
    const mergedRanked = rankScores(mergedSyndromeScores).slice(0, 2);

    const summary = {
      type: "tcm",
      hasIssue,
      mainModule,
      mainSyndromes: mergedRanked,
      systemScores
    };

    return { leaf, fruit, root, summary };
  },

  renderResult(result) {
    if (typeof result === "string") return result;

    if (result && result.summary && result.summary.type === "tcm") {
      const s = result.summary;
      const lines = [];

      if (!s.hasIssue) {
        lines.push("当前未发现明显系统性问题，可按常规管理观察。");
      } else if (s.mainSyndromes && s.mainSyndromes.length) {
        const first = s.mainSyndromes[0];
        if (SYNDROME_META[first.code]) {
          lines.push("综合判断：以【" + SYNDROME_META[first.code].name + "】为主。");
          lines.push("建议优先围绕“" + SYNDROME_META[first.code].principles.join("、") + "”进行管理调整。");
        }
      }

      lines.push(
        "系统风险概览（0-100）：",
        "土壤 " + s.systemScores.soil +
          " / 作物本体 " + s.systemScores.crop +
          " / 微生态 " + s.systemScores.microbe +
          " / 环境 " + s.systemScores.environment +
          " / 管理 " + s.systemScores.management
      );

      return lines.join("\n");
    }

    if (result && result.primarySyndrome && SYNDROME_META[result.primarySyndrome.code]) {
      return "诊断主证：" + SYNDROME_META[result.primarySyndrome.code].name;
    }

    return "暂无明显异常。";
  }
};

module.exports = DiagnosticEngine;
