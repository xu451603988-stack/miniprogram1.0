// miniprogram/utils/newDiagnosticEngine.js
/**
 * 柑橘健康诊断 · 双引擎融合版 V2.2 (修复版)
 * 包含：微观权重配置、物候修正、TCM宏观常量完整定义
 */

const leafConfig = require('./newAlgorithm/leafConfig.js');
const fruitConfig = require('./newAlgorithm/fruitConfig.js');
const rootConfig = require('./newAlgorithm/rootConfig.js');

// ---------------------- 1. 辅助工具函数 ----------------------

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
  if (maxScore >= 6) return "moderate";
  if (maxScore >= 3) return "mild";
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

// ---------------------- 2. 微观算法核心逻辑 ----------------------

// 获取物候期Key
function getPhenologyKey(month) {
  const m = parseInt(month || 0);
  if (m === 12 || m === 1) return "overwinter";
  if (m === 2) return "budding";
  if (m === 3) return "budding_flowering";
  if (m === 4) return "flowering_fruit_drop";
  if (m === 5) return "fruit_drop_summer_rain";
  if (m === 6) return "summer_rain";
  if (m === 7) return "flower_induction";
  if (m === 8 || m === 9) return "autumn_flush";
  if (m === 10 || m === 11) return "fruit_expansion";
  return "overwinter";
}

// 代码转中文名称映射
function mapCodeToName(code) {
  const map = {
    // === 根系特有 ===
    "nematodes": "根结线虫",
    "root_rot_fungal": "根腐病 (真菌性)",
    "root_hypoxia": "根系缺氧 (沤根)",
    "fertilizer_burn": "烧根 (肥害)",
    "soil_compaction": "土壤板结",
    "salt_stress": "土壤盐渍化",
    "herbicide_damage": "除草剂药害",
    "weak_vigor": "根系活力弱",
    "drought_stress": "干旱胁迫",
    
    // === 通用 ===
    "N": "缺氮", "P": "缺磷", "K": "缺钾", "Fe": "缺铁", "Zn": "缺锌", "Mg": "缺镁", "B": "缺硼", "Mn": "缺锰", "S": "缺硫",
    "fungal": "真菌性病害", "bacterial": "细菌性病害", "viral": "病毒病", "fruit_fly": "果蝇", 
    "red_spider": "红蜘蛛", "leaf_miner": "潜叶蛾", "thrips": "蓟马", "aphid": "蚜虫", "scale_insect": "介壳虫", "psyllid": "木虱",
    "sunburn": "日灼伤", "cracking": "裂果", "anthracnose": "炭疽病", "greasy_spot": "脂点黄斑病", "canker": "溃疡病", "melanose": "砂皮病", "brown_rot": "疫菌褐腐病", "sooty_mold": "煤污病", "hlb": "黄龙病(疑似)"
  };
  return map[code] || code;
}

// 计算微观得分
function calculateMicroCauses(answers, config, phenologyKey) {
  if (!config || !config.features) return [];
  const scores = {}; 
  
  Object.keys(answers).forEach(questionId => {
    let userVal = answers[questionId];
    if (!userVal) return;
    const selectedOptions = Array.isArray(userVal) ? userVal : [userVal];

    selectedOptions.forEach(option => {
      let featureKey = option; 
      const featureWeight = config.features[featureKey];
      if (featureWeight) {
        ['nutrition', 'pathogen', 'physio'].forEach(type => {
          if (featureWeight[type]) {
            Object.keys(featureWeight[type]).forEach(k => {
              scores[k] = (scores[k] || 0) + featureWeight[type][k];
            });
          }
        });
      }
    });
  });

  if (phenologyKey && config.phenologyCorrections && config.phenologyCorrections[phenologyKey]) {
    const correction = config.phenologyCorrections[phenologyKey];
    Object.keys(scores).forEach(causeKey => {
      if (correction[causeKey] != null) scores[causeKey] *= correction[causeKey];
    });
  }

  const sorted = Object.keys(scores)
    .map(key => ({ code: key, score: scores[key] }))
    .filter(item => item.score > 2)
    .sort((a, b) => b.score - a.score);

  return sorted.slice(0, 3);
}

// ---------------------- 3. TCM 宏观常量定义 (此前缺失的部分) ----------------------

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

// ---------------------- 4. TCM 规则表定义 ----------------------

function makeRule(field, option, syndromes, subsystems) {
  return {
    field,
    option,
    syndromes: syndromes || {},
    subsystems: subsystems || {}
  };
}

const LEAF_TCM_RULES = [
  makeRule("symptoms", "interveinal_chlorosis", { vigor_deficiency: 1, water_nutrient_imbalance: 1 }, { crop: 2, soil: 1 }),
  makeRule("symptoms", "vein_chlorosis", { water_nutrient_imbalance: 1 }, { soil: 1, crop: 1 }),
  makeRule("symptoms", "inverted_v_yellow", { vigor_deficiency: 2 }, { crop: 2, soil: 1 }), 
  makeRule("symptoms", "uniform_yellow", { vigor_deficiency: 2, water_nutrient_imbalance: 1 }, { crop: 2, soil: 1 }), 
  makeRule("symptoms", "local_spots_lesions", { disease_pressure: 2, microbe_imbalance: 1 }, { microbe: 2, environment: 1 }),
  makeRule("symptoms", "red_spider_symptoms", { disease_pressure: 3 }, { environment: 2, crop: 1 }), 
  makeRule("symptoms", "leaf_miner_trails", { disease_pressure: 3 }, { environment: 1, crop: 2 }), 
  makeRule("symptoms", "sooty_mold", { disease_pressure: 2 }, { environment: 1 }), 
  makeRule("symptoms", "tip_burn", { water_nutrient_imbalance: 2 }, { soil: 1, management: 1 }),
  makeRule("leaf_age", "leaf_age_mix", { vigor_deficiency: 3 }, { crop: 3 }), 
  makeRule("recent_events", "ev_rain", { root_aeration_stagnation: 1, microbe_imbalance: 1 }, { soil: 1, microbe: 1 }),
  makeRule("recent_events", "ev_heavy_n", { water_nutrient_imbalance: 1, management_fluctuation: 1 }, { soil: 1, management: 1 })
];

const FRUIT_TCM_RULES = [
  makeRule("fruit_position", "position_outer", { disease_pressure: 1 }, { environment: 2 }),
  makeRule("fruit_symptoms", "canker_spots", { disease_pressure: 3, microbe_imbalance: 1 }, { microbe: 2, management: 1 }), 
  makeRule("fruit_symptoms", "melanose_spots", { disease_pressure: 2, microbe_imbalance: 2 }, { microbe: 2, environment: 1 }), 
  makeRule("fruit_symptoms", "thrips_ring", { disease_pressure: 3 }, { crop: 1, environment: 1 }), 
  makeRule("fruit_symptoms", "sunburn_patch", { water_nutrient_imbalance: 1 }, { environment: 3 }), 
  makeRule("fruit_symptoms", "cracking", { water_nutrient_imbalance: 3 }, { soil: 2, management: 1 }),
  makeRule("fruit_symptoms", "maggot_rot", { disease_pressure: 4 }, { environment: 1, management: 2 }), 
  makeRule("drop_status", "drop_severe", { vigor_deficiency: 2, water_nutrient_imbalance: 1 }, { crop: 2, soil: 1 }) 
];

const ROOT_TCM_RULES = [
  makeRule("soil_texture", "soil_clay_hard", { root_aeration_stagnation: 3 }, { soil: 3 }), 
  makeRule("soil_texture", "soil_salty", { water_nutrient_imbalance: 3 }, { soil: 2 }), 
  makeRule("soil_moisture", "waterlogged", { root_aeration_stagnation: 3, microbe_imbalance: 2 }, { soil: 3, microbe: 1 }), 
  makeRule("soil_moisture", "dry_crack", { water_nutrient_imbalance: 2 }, { soil: 2 }), 
  makeRule("root_symptoms", "root_rot_smell", { root_aeration_stagnation: 3, microbe_imbalance: 3 }, { soil: 2, microbe: 2 }), 
  makeRule("root_symptoms", "root_knots", { disease_pressure: 3, vigor_deficiency: 1 }, { soil: 2, microbe: 2, crop: 1 }), 
  makeRule("root_symptoms", "root_burn_dry", { water_nutrient_imbalance: 3, management_fluctuation: 2 }, { soil: 2, management: 2 }), 
  makeRule("recent_events", "ev_heavy_fertilizer", { water_nutrient_imbalance: 2, management_fluctuation: 1 }, { soil: 1, management: 1 })
];

// ---------------------- 5. 执行逻辑 ----------------------

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
    mainCause: primary ? primary.code : null
  };
}

// ---------------------- 6. 导出引擎接口 ----------------------

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

    const phenologyKey = getPhenologyKey(month);

    const leafTCM = positions.includes("leaf")
      ? buildModuleResult("leaf", allAnswers.leaf || {}, { month, crop })
      : null;
    const fruitTCM = positions.includes("fruit")
      ? buildModuleResult("fruit", allAnswers.fruit || {}, { month, crop })
      : null;
    const rootTCM = buildModuleResult("root", allAnswers.root || {}, { month, crop });

    let leafMicro = [], fruitMicro = [], rootMicro = [];

    if (leafTCM) {
      leafMicro = calculateMicroCauses(allAnswers.leaf, leafConfig, phenologyKey);
      if (leafMicro.length > 0) {
        leafTCM.suggestions.unshift(`🔍 详细排查提示：疑似 **${mapCodeToName(leafMicro[0].code)}** (置信度 ${leafMicro[0].score.toFixed(1)})`);
      }
    }

    if (fruitTCM) {
      fruitMicro = calculateMicroCauses(allAnswers.fruit, fruitConfig, phenologyKey);
      if (fruitMicro.length > 0) {
        fruitTCM.suggestions.unshift(`🔍 详细排查提示：果面特征指向 **${mapCodeToName(fruitMicro[0].code)}**`);
      }
    }

    if (rootTCM) {
      rootMicro = calculateMicroCauses(allAnswers.root, rootConfig, phenologyKey);
      if (rootMicro.length > 0) {
        rootTCM.suggestions.unshift(`🔍 详细排查提示：根部迹象高度疑似 **${mapCodeToName(rootMicro[0].code)}**`);
      }
    }

    const candidates = [leafTCM, fruitTCM, rootTCM].filter(Boolean);
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
      leafTCM && leafTCM.subsystemRaw,
      fruitTCM && fruitTCM.subsystemRaw,
      rootTCM && rootTCM.subsystemRaw
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
      type: "tcm_enhanced",
      hasIssue,
      mainModule,
      mainSyndromes: mergedRanked,
      systemScores,
      microRisks: [...leafMicro, ...fruitMicro, ...rootMicro].map(item => ({
        name: mapCodeToName(item.code),
        score: item.score
      }))
    };

    return { leaf: leafTCM, fruit: fruitTCM, root: rootTCM, summary };
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

      if (s.microRisks && s.microRisks.length > 0) {
        const riskNames = s.microRisks.slice(0, 2).map(r => r.name).join("、");
        lines.push(`⚠️ 重点关注：${riskNames}`);
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