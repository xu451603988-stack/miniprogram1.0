// utils/appleDiagnosticEngine.js
// 苹果诊断 · 中医式植保算法
// 结构与柑橘保持一致，但规则根据苹果园特点单独设计：
// 叶片更重病虫与湿度，果实更重钙/水分失衡与日灼，根系类似温带果树的渍害与烂根。

// ------------------ 通用小工具 ------------------
function normalizeMulti(v) {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function clampScore(x) {
  if (x < 0) return 0;
  if (x > 100) return 100;
  return x;
}

function mapSeverityFromQuestion(q) {
  // 问卷 severity: light / medium / heavy / uncertain
  switch (q) {
    case "light":
      return "mild";
    case "medium":
      return "moderate";
    case "heavy":
      return "severe";
    default:
      return "none";
  }
}

// ------------------ 叶片模块：苹果逻辑 ------------------
function getLeafSeverity(leafAns) {
  if (!leafAns) return "none";
  const symptoms = normalizeMulti(leafAns.symptoms);
  const hasRealSymptom = symptoms.some(
    (s) => s !== "none_of_above" && s !== "uncertain"
  );
  if (!hasRealSymptom) return "none";
  return mapSeverityFromQuestion(leafAns.severity);
}

function inferLeafCauseApple(leafAns, rootAns, severity) {
  if (!leafAns || severity === "none") return null;

  const symptoms = normalizeMulti(leafAns.symptoms);
  const events = normalizeMulti(leafAns.recent_events || leafAns.recentEvents);
  const soilCond = rootAns ? rootAns.soil_condition : null;
  const rootSymptoms = normalizeMulti(rootAns ? rootAns.root_symptoms : []);

  const onset = leafAns.onset; // overnight / days / weeks / uncertain

  const hasScabLike =
    symptoms.includes("local_spots_lesions") ||
    symptoms.includes("water_soaked_spots") ||
    symptoms.includes("mottling_variegation");

  const hasNutrientChl =
    symptoms.includes("interveinal_chlorosis") ||
    symptoms.includes("vein_chlorosis") ||
    symptoms.includes("chlorotic_whole_leaf");

  const hasBurn =
    symptoms.includes("necrotic_margin") ||
    symptoms.includes("tip_burn");

  const hasCurl = symptoms.includes("leaf_curl");

  const hasHoneydewOrSooty =
    symptoms.includes("honeydew_sooty") ||
    symptoms.includes("insects_visible");

  const rain = events.includes("ev_rain");
  const hot = events.includes("ev_hot");
  const heavyN = events.includes("ev_heavy_n");
  const freqIrr = events.includes("ev_freq_irrig");
  const recentSpray = events.includes("ev_recent_spray");

  const rootWetOrRot =
    soilCond === "wet" ||
    rootSymptoms.includes("root_rot_black") ||
    rootSymptoms.includes("root_peel_off");

  // 1）典型虫害：蚜虫、叶螨 → 叶卷 + 蜜露/煤污
  if (hasHoneydewOrSooty && (hasCurl || onset === "days")) {
    return "disease_pressure";
  }

  // 2）苹果黑星病 / 斑点型真菌病：雨后 + 年轻叶片斑驳或水渍斑 → 微生态失衡
  if (hasScabLike && rain) {
    return "microbe_imbalance";
  }

  // 3）根区长期潮湿 / 烂根：叶片整体发黄 + 根区证据 → 根区运行不畅
  if (rootWetOrRot && hasNutrientChl) {
    return "root_aeration_stagnation";
  }

  // 4）水肥节奏失衡：短期内重施氮肥 / 忽干忽湿 + 烧边 / 突然黄化
  if (
    (heavyN || freqIrr || recentSpray) &&
    (hasBurn || onset === "overnight")
  ) {
    return "water_nutrient_imbalance";
  }

  // 5）树势偏虚：慢性黄化、小叶短枝，但近期无明显极端事件
  if (hasNutrientChl && onset === "weeks" && !heavyN && !freqIrr && !rain) {
    return "vigor_deficiency";
  }

  // 6）高温日灼 + 管理波动：叶缘焦枯，伴随近期剧烈修剪/光照变化（用 ev_hot 近似）
  if (hasBurn && hot) {
    return "management_fluctuation";
  }

  // 默认：找不到明确单一主因 → 管理节奏波动
  return "management_fluctuation";
}

// ------------------ 果实模块：苹果逻辑 ------------------
function getFruitSeverity(fruitAns) {
  if (!fruitAns) return "none";
  const symptoms = normalizeMulti(fruitAns.fruit_symptoms);
  const hasRealSymptom = symptoms.some(
    (s) => s !== "none_of_above" && s !== "uncertain"
  );
  if (!hasRealSymptom) return "none";
  return mapSeverityFromQuestion(fruitAns.severity);
}

function inferFruitCauseApple(fruitAns, rootAns, severity) {
  if (!fruitAns || severity === "none") return null;

  const symptoms = normalizeMulti(fruitAns.fruit_symptoms);
  const events = normalizeMulti(
    fruitAns.recent_events || fruitAns.recentEvents
  );

  const fruitPos = fruitAns.fruit_position; // outer / inner / lower / upper / uncertain
  const fruitSize = fruitAns.fruit_size; // normal / small / large / uncertain

  const soilCond = rootAns ? rootAns.soil_condition : null;
  const rootSymptoms = normalizeMulti(rootAns ? rootAns.root_symptoms : []);

  const onset = fruitAns.onset;

  const hasScabOrRot =
    symptoms.includes("surface_spots_pits") ||
    symptoms.includes("oily_spots");

  const hasSunburn = symptoms.includes("sunburn_burn");
  const hasCrack = symptoms.includes("cracking_split");
  const hasPrematureDrop = symptoms.includes("premature_drop");
  const hasWorm = symptoms.includes("oviposition_punctures");
  const hasSmallOrLopsided =
    symptoms.includes("small_lopsided") || fruitSize === "small";

  const rain = events.includes("ev_rain");
  const hot = events.includes("ev_hot");
  const heavyN = events.includes("ev_heavy_n");
  const recentSpray = events.includes("ev_recent_spray");
  const pollinationIssue = events.includes("ev_pollination_issue");

  const rootWet =
    soilCond === "wet" ||
    rootSymptoms.includes("root_rot_black") ||
    rootSymptoms.includes("root_peel_off");

  // 1）虫害：蠹蛾、卷蛾等 → 蛀孔/产卵孔优先视为病虫压力
  if (hasWorm) {
    return "disease_pressure";
  }

  // 2）真菌性果斑 / 腐烂：雨多 + 斑点或油渍斑 → 微生态失衡
  if (hasScabOrRot && rain) {
    return "microbe_imbalance";
  }

  // 3）典型渍害 / 烂根牵连的生理果病：根区渍水 + 提前落果或普遍小果
  if (rootWet && (hasPrematureDrop || hasSmallOrLopsided)) {
    return "root_aeration_stagnation";
  }

  // 4）水分 + 钙失衡导致的裂果 / 苦痘样症状：
  if (
    hasCrack &&
    (rain || heavyN || rootWet) &&
    (fruitPos === "outer" || fruitPos === "upper" || onset === "days")
  ) {
    return "water_nutrient_imbalance";
  }

  // 5）长期负载过重 / 养分供不应求：普遍小果 + 颜色不匀 + 慢性发展
  if (
    hasSmallOrLopsided &&
    onset === "weeks" &&
    !rain &&
    !heavyN &&
    !pollinationIssue
  ) {
    return "vigor_deficiency";
  }

  // 6）日灼果 / 光照突变：外层果 + 日灼斑 + 高温 → 管理节奏波动 + 环境压力
  if (
    hasSunburn &&
    hot &&
    (fruitPos === "outer" || fruitPos === "upper")
  ) {
    return "management_fluctuation";
  }

  // 7）授粉不良、花期天气问题：畸形果 + pollinationIssue
  if (hasSmallOrLopsided && pollinationIssue) {
    return "vigor_deficiency";
  }

  // 8）药害：近期喷药 + 急性症状
  if (recentSpray && onset === "overnight") {
    return "management_fluctuation";
  }

  return "management_fluctuation";
}

// ------------------ 根系模块：苹果逻辑（与柑橘类似，但权重给土壤更高） ------------------
function getRootSeverity(rootAns) {
  if (!rootAns) return "none";
  const syms = normalizeMulti(rootAns.root_symptoms);
  const real = syms.filter(
    (s) => s !== "no_symptom" && s !== "uncertain"
  );
  if (real.length === 0) return "none";
  if (real.length === 1) return "mild";
  if (real.length === 2) return "moderate";
  return "severe";
}

function inferRootCauseApple(rootAns, severity) {
  if (!rootAns || severity === "none") return null;

  const soilCond = rootAns.soil_condition;
  const syms = normalizeMulti(rootAns.root_symptoms);
  const smell = rootAns.soil_smell;
  const events = normalizeMulti(
    rootAns.recent_events || rootAns.recentEvents
  );

  const overIrr = events.includes("ev_over_irrigation");
  const heavyRain = events.includes("ev_rain");
  const newOrganic = events.includes("ev_organic");

  const hasRot =
    syms.includes("root_rot_black") || syms.includes("root_peel_off");
  const fewFineRoots = syms.includes("few_fine_roots");

  const wetOrAnaerobic =
    soilCond === "wet" ||
    smell === "sulfide" ||
    smell === "mold" ||
    overIrr ||
    heavyRain;

  // 苹果根系较浅，尤其忌长期渍水
  if (wetOrAnaerobic || hasRot) {
    return "root_aeration_stagnation";
  }

  // 生肥 / 未腐熟有机肥 → 微生态失衡
  if (newOrganic) {
    return "microbe_imbalance";
  }

  // 细根显著减少 → 树势偏虚
  if (fewFineRoots) {
    return "vigor_deficiency";
  }

  // 其余的归为水肥节奏问题
  return "water_nutrient_imbalance";
}

// ------------------ 五大系统评分（苹果版权重） ------------------
function bump(scores, key, delta) {
  scores[key] = clampScore(scores[key] + delta);
}

function applyModuleToSystemsApple(moduleRes, scores) {
  if (!moduleRes) return;
  const severity = moduleRes.severity || "none";
  const cause = moduleRes.mainCause;
  if (!cause || severity === "none") return;

  let base = 0;
  switch (severity) {
    case "mild":
      base = 7;
      break;
    case "moderate":
      base = 13;
      break;
    case "severe":
      base = 19;
      break;
    default:
      base = 0;
  }
  if (!base) return;

  switch (cause) {
    case "water_nutrient_imbalance":
      bump(scores, "soil", base + 3);
      bump(scores, "crop", Math.round(base * 0.6));
      bump(scores, "management", Math.round(base * 0.6));
      break;
    case "root_aeration_stagnation":
      bump(scores, "soil", base + 5);
      bump(scores, "environment", Math.round(base * 0.7));
      break;
    case "vigor_deficiency":
      bump(scores, "crop", base + 5);
      bump(scores, "management", Math.round(base * 0.4));
      break;
    case "microbe_imbalance":
      bump(scores, "microbe", base + 5);
      bump(scores, "soil", Math.round(base * 0.5));
      bump(scores, "environment", Math.round(base * 0.4));
      break;
    case "disease_pressure":
      bump(scores, "microbe", base + 3);
      bump(scores, "environment", Math.round(base * 0.7));
      break;
    case "management_fluctuation":
      bump(scores, "management", base + 5);
      bump(scores, "crop", Math.round(base * 0.4));
      bump(scores, "environment", Math.round(base * 0.4));
      break;
    default:
      break;
  }
}

function applyRecentEventsToSystemsApple(answerBlocks, scores) {
  if (!answerBlocks || !answerBlocks.length) return;

  answerBlocks.forEach((ans) => {
    if (!ans) return;
    const events = normalizeMulti(ans.recent_events || ans.recentEvents);
    if (!events.length) return;

    if (events.includes("ev_rain")) {
      bump(scores, "environment", 10); // 苹果病害对叶面湿度更敏感
      bump(scores, "soil", 7);
    }
    if (events.includes("ev_hot")) {
      bump(scores, "environment", 9);
    }
    if (events.includes("ev_heavy_n")) {
      bump(scores, "management", 9);
      bump(scores, "soil", 5);
      bump(scores, "crop", 5);
    }
    if (events.includes("ev_freq_irrig") || events.includes("ev_over_irrigation")) {
      bump(scores, "management", 7);
      bump(scores, "soil", 12);
    }
    if (events.includes("ev_recent_spray")) {
      bump(scores, "management", 7);
      bump(scores, "microbe", 5);
    }
    if (events.includes("ev_pollination_issue")) {
      bump(scores, "crop", 7);
      bump(scores, "environment", 4);
    }
    if (events.includes("ev_organic")) {
      bump(scores, "soil", 7);
      bump(scores, "microbe", 7);
    }
  });
}

function computeSystemScoresApple(
  leafRes,
  fruitRes,
  rootRes,
  leafAns,
  fruitAns,
  rootAns
) {
  // 起点 50：中性状态
  const scores = {
    soil: 50,
    crop: 50,
    microbe: 50,
    environment: 50,
    management: 50
  };

  applyModuleToSystemsApple(leafRes, scores);
  applyModuleToSystemsApple(fruitRes, scores);
  applyModuleToSystemsApple(rootRes, scores);

  applyRecentEventsToSystemsApple([leafAns, fruitAns, rootAns], scores);

  Object.keys(scores).forEach((k) => {
    scores[k] = clampScore(scores[k]);
  });

  return scores;
}

// ------------------ 总结模块（主模块 + 有无异常） ------------------
const severityWeight = {
  none: 0,
  mild: 1,
  moderate: 2,
  severe: 3
};

function buildSummaryApple(
  leafRes,
  fruitRes,
  rootRes,
  leafAns,
  fruitAns,
  rootAns
) {
  const modules = [];

  if (leafRes) modules.push({ code: "leaf", severity: leafRes.severity || "none" });
  if (fruitRes) modules.push({ code: "fruit", severity: fruitRes.severity || "none" });
  if (rootRes) modules.push({ code: "root", severity: rootRes.severity || "none" });

  let mainModule = null;
  let maxWeight = 0;

  modules.forEach((m) => {
    const w = severityWeight[m.severity] || 0;
    if (w > maxWeight) {
      maxWeight = w;
      mainModule = m.code;
    }
  });

  const hasIssue = maxWeight > 0;

  const systemScores = computeSystemScoresApple(
    leafRes,
    fruitRes,
    rootRes,
    leafAns,
    fruitAns,
    rootAns
  );

  return {
    hasIssue,
    mainModule,
    systemScores
  };
}

// ------------------ 主入口：runAppleDiagnosis ------------------
function runAppleDiagnosis(payload) {
  // payload: { leaf: {...}, fruit: {...}, root: {...} }
  const leafAns = payload.leaf || payload.leafAnswers || {};
  const fruitAns = payload.fruit || payload.fruitAnswers || {};
  const rootAns = payload.root || payload.rootAnswers || {};

  // 叶片
  const leafSeverity = getLeafSeverity(leafAns);
  const leafCause =
    leafSeverity === "none"
      ? null
      : inferLeafCauseApple(leafAns, rootAns, leafSeverity);
  const leafRes = {
    code: "leaf",
    severity: leafSeverity,
    mainCause: leafCause
  };

  // 果实
  const fruitSeverity = getFruitSeverity(fruitAns);
  const fruitCause =
    fruitSeverity === "none"
      ? null
      : inferFruitCauseApple(fruitAns, rootAns, fruitSeverity);
  const fruitRes = {
    code: "fruit",
    severity: fruitSeverity,
    mainCause: fruitCause
  };

  // 根系
  let rootRes = {
    code: "root",
    severity: "none",
    mainCause: null,
    skipped: false
  };

  if (!rootAns || Object.keys(rootAns).length === 0) {
    rootRes.skipped = true;
  } else {
    const rootSeverity = getRootSeverity(rootAns);
    const rootCause =
      rootSeverity === "none"
        ? null
        : inferRootCauseApple(rootAns, rootSeverity);
    rootRes = {
      code: "root",
      severity: rootSeverity,
      mainCause: rootCause,
      skipped: false
    };
  }

  const summary = buildSummaryApple(
    leafRes,
    fruitRes,
    rootRes,
    leafAns,
    fruitAns,
    rootAns
  );

  const result = {
    leaf: leafRes,
    fruit: fruitRes,
    root: rootRes,
    summary
  };

  return {
    type: "combined",
    crop: "apple",
    payload,
    result
  };
}

module.exports = {
  runAppleDiagnosis
};
