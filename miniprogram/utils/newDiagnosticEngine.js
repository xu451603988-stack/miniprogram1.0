// miniprogram/utils/newDiagnosticEngine.js
/**
 * 作物健康诊断 · 时空记忆引擎 V4.0
 * 核心升级：
 * 1. 历史追溯 (Memory): 基于历史记录修正当前概率（惯性原则）
 * 2. 未来预警 (Prognosis): 基于当前诊断 + 下月物候预测次生灾害
 */

const leafConfig = require('./newAlgorithm/leafConfig.js');
const fruitConfig = require('./newAlgorithm/fruitConfig.js');
const rootConfig = require('./newAlgorithm/rootConfig.js');

// ---------------------- 1. 基础工具 ----------------------

function deepClone(obj) { return JSON.parse(JSON.stringify(obj || {})); }

function calculateConfidence(score) {
  if (score <= 0) return 0;
  const k = 0.25, x0 = 5;
  const probability = 100 / (1 + Math.exp(-k * (score - x0)));
  return Math.min(Math.round(probability), 99);
}

function getPhenologyKey(month) {
  const m = parseInt(month || 0);
  if (m === 12 || m === 1) return "overwinter";
  if (m >= 2 && m <= 3) return "budding";
  if (m >= 4 && m <= 5) return "flowering_fruit_drop";
  if (m >= 6 && m <= 8) return "summer_rain";
  if (m >= 9 && m <= 11) return "fruit_expansion";
  return "overwinter";
}

function mapCodeToName(code) {
  const map = {
    "nematodes": "根结线虫", "root_rot_fungal": "真菌性根腐", "root_hypoxia": "根系缺氧",
    "fertilizer_burn": "肥害烧根", "soil_compaction": "土壤板结", "N": "缺氮", "Mg": "缺镁", 
    "Fe": "缺铁", "Zn": "缺锌", "fruit_fly": "果实蝇", "red_spider": "红蜘蛛", 
    "canker": "溃疡病", "anthracnose": "炭疽病", "hlb": "黄龙病", "sunburn": "日灼病",
    "deficiency_Fe_Zn": "缺铁/缺锌", "deficiency_Mg": "缺镁"
  };
  return map[code] || code;
}

// ---------------------- 2. 微观计算 ----------------------

function calculateMicroCauses(answers, config, phenologyKey) {
  if (!config || !config.features) return [];
  const scores = {}; 
  const evidenceChain = {}; 

  Object.keys(answers).forEach(qid => {
    let vals = answers[qid];
    if (!vals) return;
    if (!Array.isArray(vals)) vals = [vals];

    vals.forEach(opt => {
      const feat = config.features[opt];
      if (feat) {
        ['nutrition', 'pathogen', 'physio'].forEach(type => {
          if (feat[type]) {
            Object.keys(feat[type]).forEach(code => {
              const w = feat[type][code];
              scores[code] = (scores[code] || 0) + w;
              if (w > 0) {
                if (!evidenceChain[code]) evidenceChain[code] = [];
                evidenceChain[code].push(opt); 
              }
            });
          }
        });
      }
    });
  });

  if (phenologyKey && config.phenologyCorrections && config.phenologyCorrections[phenologyKey]) {
    const cor = config.phenologyCorrections[phenologyKey];
    Object.keys(scores).forEach(c => { if (cor[c] != null) scores[c] *= cor[c]; });
  }

  return Object.keys(scores).map(code => {
    const score = scores[code];
    const isIronclad = (config.features && Object.values(config.features).some(f => 
      ['nutrition','pathogen','physio'].some(t => f[t] && f[t][code] >= 15)
    ));
    
    return {
      code,
      name: mapCodeToName(code),
      score,
      confidence: isIronclad && score > 10 ? 99 : calculateConfidence(score),
      evidences: evidenceChain[code] || []
    };
  });
}

// ---------------------- 3. 协同推理 (V3.5) ----------------------

function applySynergyRules(mergedMap, rootRisks) {
  const topRoot = rootRisks.sort((a,b) => b.score - a.score)[0];
  const isRootBad = topRoot && topRoot.confidence > 50;
  
  // 规则: 根腐致缺素
  if (isRootBad && ["root_rot_fungal", "nematodes", "root_hypoxia"].includes(topRoot.code)) {
    ["N", "Fe", "Zn", "Mg", "B", "Mn", "deficiency_Fe_Zn", "deficiency_Mg"].forEach(nutri => {
      if (mergedMap[nutri]) {
        mergedMap[nutri].confidence *= 0.6; // 降低缺素置信度
        mergedMap[topRoot.code].confidence = Math.min(99, mergedMap[topRoot.code].confidence + 15); // 提高根病置信度
        mergedMap[topRoot.code].synergyLog = `根部[${topRoot.name}]导致养分吸收受阻，引发地上部缺素假象。`;
      }
    });
  }
}

// ---------------------- 4. 【核心升级】时空记忆逻辑 (V4.0) ----------------------

/**
 * 历史追溯：根据上一条诊断记录修正当前概率
 */
function applyHistoryBias(mergedMap, lastRecord) {
  if (!lastRecord || !lastRecord.diagnosis) return null;

  // 计算时间差 (天)
  const now = new Date().getTime();
  const lastTime = lastRecord.timestamp || now;
  const daysDiff = Math.floor((now - lastTime) / (1000 * 60 * 60 * 24));

  // 只追溯 30 天内的记录
  if (daysDiff > 30) return null;

  const lastCode = lastRecord.diagnosis;
  const log = [];

  // 1. 同病相怜 (Recurrence): 如果这次也怀疑是同一个病，概率大增
  if (mergedMap[lastCode]) {
    // 衰减系数：时间越近，影响越大
    const boost = Math.max(0, 20 - daysDiff); 
    mergedMap[lastCode].confidence = Math.min(99, mergedMap[lastCode].confidence + boost);
    mergedMap[lastCode].score += 5;
    log.push(`检测到 ${daysDiff} 天前曾确诊【${mapCodeToName(lastCode)}】，判定为病情持续或复发。`);
  }

  // 2. 关联演变 (Progression): 比如 上次是红蜘蛛 -> 这次叶片发白
  if (lastCode === 'red_spider' && mergedMap['deficiency_Fe_Zn']) {
    mergedMap['deficiency_Fe_Zn'].confidence *= 0.8; // 排除缺素
    // 如果列表里有红蜘蛛，提升它
    if (mergedMap['red_spider']) {
        mergedMap['red_spider'].confidence += 15;
        log.push(`基于历史红蜘蛛病史，当前叶片症状极可能为虫害后遗症。`);
    }
  }

  return log.length > 0 ? log.join(";") : null;
}

/**
 * 未来预警：生成 Prognosis
 */
function predictFuture(topRisk, month) {
  if (!topRisk) return null;
  const m = parseInt(month || 1);
  const code = topRisk.code;
  const predictions = [];

  // 规则 1: 传染性病害在雨季的预警
  if (["canker", "anthracnose", "root_rot_fungal"].includes(code)) {
    if (m >= 4 && m <= 8) {
      predictions.push("下月进入高温雨季，此病害极易随雨水爆发式扩散，务必在雨前喷施铜制剂封锁。");
    }
  }

  // 规则 2: 虫害迭代
  if (code === "red_spider") {
    predictions.push("红蜘蛛繁殖极快，建议 7 天后复查一次，防止卵块孵化造成二次爆发。");
  }

  // 规则 3: 根系影响果实
  if (code === "root_rot_fungal" || code === "nematodes") {
    if (m >= 9 && m <= 11) {
      predictions.push("根系受损将严重影响秋梢转绿和果实膨大，警惕后期出现大量‘太阳果’或落果。");
    }
  }

  return predictions.length > 0 ? predictions : null;
}

/**
 * 动态生成诊断逻辑文本 (升级版)
 */
function generateDynamicLogic(topRisk, rootRisks, historyLog, futureLog) {
  if (!topRisk) return "未检测到明显异常，建议加强日常管理。";

  const diseaseName = topRisk.name;
  
  let text = `经 V4.0 引擎综合分析，主病判定为【${diseaseName}】（置信度 ${topRisk.confidence}%）。`;
  
  // 1. 协同分析
  if (topRisk.synergyLog) {
    text += `\n\n🔍 根叶关联：${topRisk.synergyLog}`;
  } 
  
  // 2. 历史追溯 (V4.0 新增)
  if (historyLog) {
    text += `\n\n📜 病史追踪：${historyLog}`;
  }

  // 3. 未来预警 (V4.0 新增)
  if (futureLog && futureLog.length > 0) {
    text += `\n\n🔮 风险预警：${futureLog.join('')}`;
  }

  return text;
}

// ---------------------- 5. 引擎入口 ----------------------

const DiagnosticEngine = {
  runCombined(options) {
    const { positions, answers, month, lastRecord } = options; // 接收 lastRecord
    const phenologyKey = getPhenologyKey(month);

    // 1. 微观计算
    let leafRisks = [], fruitRisks = [], rootRisks = [];
    if (positions.includes("leaf")) leafRisks = calculateMicroCauses(answers.leaf, leafConfig, phenologyKey);
    if (positions.includes("fruit")) fruitRisks = calculateMicroCauses(answers.fruit, fruitConfig, phenologyKey);
    rootRisks = calculateMicroCauses(answers.root, rootConfig, phenologyKey);

    // 2. 合并初步结果
    const mergedMap = {};
    [...leafRisks, ...fruitRisks, ...rootRisks].forEach(item => {
      if (!mergedMap[item.code]) {
        mergedMap[item.code] = { ...item };
      } else {
        mergedMap[item.code].score += item.score;
        mergedMap[item.code].confidence = calculateConfidence(mergedMap[item.code].score);
        mergedMap[item.code].evidences = [...mergedMap[item.code].evidences, ...item.evidences];
      }
    });

    // 3. 执行协同规则 (V3.5)
    applySynergyRules(mergedMap, rootRisks);

    // 4. 【执行历史追溯】 (V4.0)
    const historyLog = applyHistoryBias(mergedMap, lastRecord);

    // 5. 最终排序
    const finalRanking = Object.values(mergedMap).sort((a, b) => b.confidence - a.confidence);
    const topRisk = finalRanking.length > 0 ? finalRanking[0] : null;

    // 6. 【生成未来预警】 (V4.0)
    const futureLog = predictFuture(topRisk, month);

    // 7. 生成动态报告
    const dynamicLogic = generateDynamicLogic(topRisk, rootRisks, historyLog, futureLog);

    const summary = {
      type: "decision_tree_v5",
      diagnosis: topRisk ? topRisk.code : "unknown",
      confidence: topRisk ? topRisk.confidence : 0,
      dynamicLogic: dynamicLogic, 
      rootStatus: (rootRisks[0] && rootRisks[0].confidence > 50) ? rootRisks[0].code : "normal",
      tags: topRisk ? [mapCodeToName(topRisk.code)] : [] // 简单回填
    };

    if (futureLog) summary.hasFutureWarning = true;

    console.log("📊 [V4.0 时空引擎] 结果:", summary);
    return summary;
  }
};

module.exports = DiagnosticEngine;