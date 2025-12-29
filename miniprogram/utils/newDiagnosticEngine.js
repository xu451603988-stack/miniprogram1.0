// miniprogram/utils/newDiagnosticEngine.js
/**
 * 作物健康诊断 · 全息感知引擎 V5.0
 * * 核心升级：
 * 1. 历史追溯 (Memory): 继承 V4.0，基于历史修正惯性。
 * 2. 环境感知 (Sense): 【新增】融合实时天气（雨/温）动态加权。
 * 3. 逻辑互斥 (Veto): 【新增】基于互斥条件降低误判率。
 * 4. 未来预警 (Prognosis): 继承 V4.0。
 */

const leafConfig = require('./newAlgorithm/leafConfig.js');
const fruitConfig = require('./newAlgorithm/fruitConfig.js');
const rootConfig = require('./newAlgorithm/rootConfig.js');

// ====================== 1. 基础工具 ======================

function deepClone(obj) { return JSON.parse(JSON.stringify(obj || {})); }

/**
 * 计算置信度 (Sigmoid 变体)
 * 分数越高，置信度越高，但在高分段平缓
 */
function calculateConfidence(score) {
  if (score <= 0) return 0;
  // 调整参数：让低分更难达到高置信度，减少误报
  const k = 0.2, x0 = 8; 
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
    "deficiency_Fe_Zn": "缺铁/缺锌", "deficiency_Mg": "缺镁", "drought": "干旱胁迫"
  };
  return map[code] || code;
}

// ====================== 2. 核心权重计算 ======================

function calculateMicroCauses(answers, config, phenologyKey) {
  if (!config || !config.features) return [];
  const scores = {}; 
  const evidenceChain = {}; 
  const vetoFlags = []; // 互斥标记

  Object.keys(answers).forEach(qid => {
    let vals = answers[qid];
    if (!vals) return;
    if (!Array.isArray(vals)) vals = [vals];

    vals.forEach(opt => {
      const feat = config.features[opt];
      if (feat) {
        // 1. 累加正向分数
        ['nutrition', 'pathogen', 'physio'].forEach(type => {
          if (feat[type]) {
            Object.keys(feat[type]).forEach(code => {
              const w = feat[type][code];
              // 只有正分才计入证据链
              if (w > 0) {
                scores[code] = (scores[code] || 0) + w;
                if (!evidenceChain[code]) evidenceChain[code] = [];
                evidenceChain[code].push(opt); 
              } else if (w < 0) {
                // 如果配置里有负分（排除项），直接减分
                scores[code] = (scores[code] || 0) + w;
              }
            });
          }
        });

        // 2. 【新增】互斥逻辑检查
        // 假设配置文件里定义了 veto: ["root_rot_fungal"] 代表这个选项排除了根腐
        if (feat.veto && Array.isArray(feat.veto)) {
          feat.veto.forEach(vCode => vetoFlags.push(vCode));
        }
      }
    });
  });

  // 3. 物候修正 (Season Bias)
  if (phenologyKey && config.phenologyCorrections && config.phenologyCorrections[phenologyKey]) {
    const cor = config.phenologyCorrections[phenologyKey];
    Object.keys(scores).forEach(c => { if (cor[c] != null) scores[c] *= cor[c]; });
  }

  return Object.keys(scores).map(code => {
    let score = scores[code];

    // 4. 【新增】执行互斥打击
    // 如果收集到了排除这个病的标记，强制扣分
    if (vetoFlags.includes(code)) {
      score = score - 50; // 强力惩罚
    }

    const isIronclad = (config.features && Object.values(config.features).some(f => 
      ['nutrition','pathogen','physio'].some(t => f[t] && f[t][code] >= 15)
    ));
    
    return {
      code,
      name: mapCodeToName(code),
      score, // 此时 score 可能是负数
      confidence: isIronclad && score > 10 ? 99 : calculateConfidence(score),
      evidences: evidenceChain[code] || []
    };
  });
}

// ====================== 3. 环境与协同逻辑 (V5.0) ======================

/**
 * 【新增】环境感知加权
 * 将实时天气数据融入诊断
 */
function applyEnvironmentBias(mergedMap, envData) {
  if (!envData) return [];
  const log = [];

  // envData 结构示例: { temp: 28, humidity: 80, rain: true }
  
  // 规则 1: 高温高湿/连续降雨 -> 爆发真菌病害
  if (envData.rain || (envData.humidity > 85 && envData.temp > 25)) {
    ["anthracnose", "canker", "root_rot_fungal"].forEach(code => {
      if (mergedMap[code]) {
        mergedMap[code].score *= 1.3; // 提分 30%
        mergedMap[code].confidence = Math.min(99, mergedMap[code].confidence + 10);
      }
    });
    if (envData.rain) log.push("近期降雨频繁，真菌类病害风险系数大幅上升。");
  }

  // 规则 2: 干旱/高温 -> 虫害活跃、日灼
  if (!envData.rain && envData.temp > 32) {
    ["red_spider", "fruit_fly", "sunburn"].forEach(code => {
      if (mergedMap[code]) {
        mergedMap[code].score *= 1.2;
        mergedMap[code].confidence += 5;
      }
    });
    log.push("高温干燥天气有利于虫害繁殖及日灼发生。");
  }

  return log;
}

function applySynergyRules(mergedMap, rootRisks) {
  const topRoot = rootRisks.sort((a,b) => b.score - a.score)[0];
  const isRootBad = topRoot && topRoot.confidence > 50;
  
  if (isRootBad && ["root_rot_fungal", "nematodes", "root_hypoxia"].includes(topRoot.code)) {
    ["N", "Fe", "Zn", "Mg", "B", "Mn", "deficiency_Fe_Zn", "deficiency_Mg"].forEach(nutri => {
      if (mergedMap[nutri]) {
        mergedMap[nutri].confidence *= 0.5; // V5.0: 加大惩罚力度，从 0.6 改为 0.5
        mergedMap[topRoot.code].confidence = Math.min(99, mergedMap[topRoot.code].confidence + 15);
        mergedMap[topRoot.code].synergyLog = `根部[${topRoot.name}]导致养分吸收受阻，引发地上部缺素假象，请优先治根。`;
      }
    });
  }
}

// ====================== 4. 时空记忆 (V4.0/5.0) ======================

function applyHistoryBias(mergedMap, lastRecord) {
  if (!lastRecord || !lastRecord.diagnosis) return null;
  const now = new Date().getTime();
  const lastTime = lastRecord.timestamp || now;
  const daysDiff = Math.floor((now - lastTime) / (1000 * 60 * 60 * 24));

  if (daysDiff > 45) return null; // V5.0: 放宽到 45 天

  const lastCode = lastRecord.diagnosis;
  const log = [];

  if (mergedMap[lastCode]) {
    const boost = Math.max(0, 20 - (daysDiff / 2)); 
    mergedMap[lastCode].confidence = Math.min(99, mergedMap[lastCode].confidence + boost);
    mergedMap[lastCode].score += 5;
    log.push(`${daysDiff} 天前曾确诊【${mapCodeToName(lastCode)}】，判定为病情持续或复发。`);
  }

  if (lastCode === 'red_spider' && mergedMap['deficiency_Fe_Zn']) {
    mergedMap['deficiency_Fe_Zn'].confidence *= 0.7;
    if (mergedMap['red_spider']) {
        mergedMap['red_spider'].confidence += 15;
        log.push(`基于历史红蜘蛛病史，当前叶片症状极可能为虫害后遗症（白化）。`);
    }
  }

  return log.length > 0 ? log.join(";") : null;
}

function predictFuture(topRisk, month) {
  if (!topRisk) return null;
  const m = parseInt(month || 1);
  const code = topRisk.code;
  const predictions = [];

  if (["canker", "anthracnose", "root_rot_fungal"].includes(code)) {
    if (m >= 4 && m <= 9) { // V5.0: 延长雨季预警范围
      predictions.push("当前处于高湿季节，病菌极易随风雨扩散，建议全园喷施保护性杀菌剂。");
    }
  }

  if (code === "red_spider") {
    predictions.push("红蜘蛛具有极强抗药性，建议 5-7 天后更换药剂机理再次消杀。");
  }

  if (code === "root_rot_fungal" || code === "nematodes") {
    predictions.push("根系受损是不可逆的，后期极易出现果实偏小、落果，需尽快淋施生根剂保树。");
  }

  return predictions.length > 0 ? predictions : null;
}

function generateDynamicLogic(topRisk, rootRisks, historyLog, futureLog, envLog) {
  if (!topRisk || topRisk.confidence < 20) return "未检测到明显病害特征，建议加强水肥管理，持续观察。";

  const diseaseName = topRisk.name;
  let text = `【V5.0 全息诊断】\n综合判定主病为【${diseaseName}】，置信度 ${topRisk.confidence}%。`;
  
  // 证据展示
  if (topRisk.evidences && topRisk.evidences.length > 0) {
    text += `\n\n📌 核心依据：用户描述了 ${topRisk.evidences.join('、')} 等特征。`;
  }

  if (envLog && envLog.length > 0) {
    text += `\n\n☁️ 环境分析：${envLog.join('')}`;
  }
  
  if (topRisk.synergyLog) {
    text += `\n\n🔍 根叶关联：${topRisk.synergyLog}`;
  } 
  
  if (historyLog) {
    text += `\n\n📜 病史追踪：${historyLog}`;
  }

  if (futureLog && futureLog.length > 0) {
    text += `\n\n🔮 专家预警：${futureLog.join('')}`;
  }

  return text;
}

// ====================== 5. 引擎入口 ======================

const DiagnosticEngine = {
  /**
   * @param {Object} options
   * options.weather: { temp: 25, rain: false, humidity: 60 } // 新增参数
   */
  runCombined(options) {
    const { positions, answers, month, lastRecord, weather } = options; 
    const phenologyKey = getPhenologyKey(month);

    // 1. 微观计算 (初步算分)
    let leafRisks = [], fruitRisks = [], rootRisks = [];
    if (positions.includes("leaf")) leafRisks = calculateMicroCauses(answers.leaf, leafConfig, phenologyKey);
    if (positions.includes("fruit")) fruitRisks = calculateMicroCauses(answers.fruit, fruitConfig, phenologyKey);
    rootRisks = calculateMicroCauses(answers.root, rootConfig, phenologyKey);

    // 2. 合并结果
    const mergedMap = {};
    [...leafRisks, ...fruitRisks, ...rootRisks].forEach(item => {
      // 过滤掉负分或极低分项
      if (item.score <= -10) return; 

      if (!mergedMap[item.code]) {
        mergedMap[item.code] = { ...item };
      } else {
        mergedMap[item.code].score += item.score;
        mergedMap[item.code].evidences = [...new Set([...mergedMap[item.code].evidences, ...item.evidences])];
      }
    });

    // 3. 【新增】环境感知加权
    const envLog = applyEnvironmentBias(mergedMap, weather);

    // 重新计算置信度（因为分数被环境改变了）
    Object.values(mergedMap).forEach(item => {
      item.confidence = calculateConfidence(item.score);
    });

    // 4. 协同规则
    applySynergyRules(mergedMap, rootRisks);

    // 5. 历史追溯
    const historyLog = applyHistoryBias(mergedMap, lastRecord);

    // 6. 最终排序
    const finalRanking = Object.values(mergedMap).sort((a, b) => b.confidence - a.confidence);
    const topRisk = finalRanking.length > 0 ? finalRanking[0] : null;

    // 7. 未来预警
    const futureLog = predictFuture(topRisk, month);

    // 8. 生成报告
    const dynamicLogic = generateDynamicLogic(topRisk, rootRisks, historyLog, futureLog, envLog);

    const summary = {
      type: "decision_tree_v5",
      diagnosis: topRisk ? topRisk.code : "unknown",
      confidence: topRisk ? topRisk.confidence : 0,
      dynamicLogic: dynamicLogic, 
      rootStatus: (rootRisks[0] && rootRisks[0].confidence > 50) ? rootRisks[0].code : "normal",
      tags: topRisk ? [mapCodeToName(topRisk.code)] : []
    };

    if (futureLog) summary.hasFutureWarning = true;

    console.log("📊 [V5.0 全息引擎] 结果:", summary);
    return summary;
  }
};

module.exports = DiagnosticEngine;