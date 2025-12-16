// miniprogram/utils/citrus_algo.js
// 柑橘全系统诊断引擎 V9.3 (时空增强版)
// 核心升级：集成 V4.0 引擎的“历史追溯”与“未来预警”能力

// 1. 引入统一数据中心
const DISEASE_DB = require('../data/disease_database.js');

// 2. 标签映射表 (保持 V9.2 标准)
const TAG_MAP = {
  'TREE_WEAK': 'TREE_WEAK', 'TREE_VIGOROUS': 'TREE_VIGOROUS', 'TREE_YOUNG': 'TREE_YOUNG',
  'root_knots': 'ROOT_KNOT', 'has_knot': 'ROOT_KNOT',
  'root_rot_smell': 'ROOT_ROT', 'sour_smell': 'ROOT_ROT',
  'root_burn_dry': 'ROOT_BURN', 'dry_root': 'ROOT_BURN',
  'root_red_stagnant': 'WEAK_ROOT', 'few_white_roots': 'WEAK_ROOT',
  'root_healthy': 'ROOT_HEALTHY', 'no_knot': 'ROOT_HEALTHY',
  'mottling_yellow': 'HLB_LEAF', 'interveinal_chlorosis': 'CHLOROSIS_NET',
  'vein_chlorosis': 'CHLOROSIS_VEIN', 'inverted_v_yellow': 'DEF_MG',
  'uniform_yellow': 'CHLOROSIS_ALL',
  'red_spider_symptoms': 'RED_SPIDER', 'gray_white_spots': 'RED_SPIDER',
  'leaf_miner_trails': 'MINER', 'sooty_mold': 'SOOTY',
  'canker_spots': 'CANKER', 'anthracnose_spots': 'ANTHRACNOSE',
  'small_stiff': 'DEF_ZN', 'tip_burn': 'LEAF_BURN',
  'curl_down': 'CURL_BACK', 'curl_up': 'CURL_FACE',
  'red_nose': 'HLB_FRUIT', 'thrips_ring': 'THRIPS',
  'sunburn_patch': 'SUNBURN', 'melanose_spots': 'MELANOSE',
  'maggot_rot': 'FRUIT_FLY', 'canker_fruit': 'CANKER',
  'cracking': 'CRACKING', 'thick_skin': 'DEF_B',
  'drop_severe': 'DROP_BAD', 'drop_smooth': 'DROP_PHYSIO'
};

// ================= 3. 辅助函数 =================

function extractAndNormalizeSymptoms(answers) {
  let features = new Set();
  ['leaf', 'fruit', 'root'].forEach(part => {
    if (answers[part]) {
      Object.values(answers[part]).forEach(val => {
        if (Array.isArray(val)) {
          val.forEach(v => features.add(TAG_MAP[v] || v));
        } else if (val) {
          features.add(TAG_MAP[val] || val);
        }
      });
    }
  });
  return features;
}

// ================= 4. 时空逻辑模块 (移植自 newDiagnosticEngine) =================

/**
 * 历史追溯：分析本次诊断与上次记录的关联
 */
function analyzeHistory(currentCode, lastRecord) {
  if (!lastRecord || !lastRecord.diagnosis) return null;

  // 计算时间差 (天)
  const now = new Date().getTime();
  const lastTime = lastRecord.timestamp || now;
  const daysDiff = Math.floor((now - lastTime) / (1000 * 60 * 60 * 24));

  // 只追溯 60 天内的记录
  if (daysDiff > 60) return null;

  const lastCode = lastRecord.diagnosis;
  const lastName = (DISEASE_DB[lastCode] && DISEASE_DB[lastCode].name) ? DISEASE_DB[lastCode].name.split(' ')[0] : lastCode;

  // 1. 同病相怜 (复发)
  if (lastCode === currentCode && currentCode !== 'healthy') {
    return `检测到 ${daysDiff} 天前曾确诊【${lastName}】，判定为病情持续或复发，建议加大防治力度。`;
  }

  // 2. 关联演变 (并发症/后遗症)
  // 场景：上次红蜘蛛 -> 这次缺铁/锌 (红蜘蛛把叶片吃坏了，导致类似缺素症状)
  if (lastCode === 'red_spider' && (currentCode === 'deficiency_Fe_Zn' || currentCode === 'sub_health')) {
    return `基于 ${daysDiff} 天前的【红蜘蛛】病史，当前叶片黄化极可能是虫害留下的后遗症，而非单纯缺素。`;
  }

  // 场景：上次根腐 -> 这次全叶黄化 (根坏了，叶才黄)
  if (lastCode === 'root_rot_fungal' && currentCode === 'CHLOROSIS_ALL') {
    return `当前的黄化是【根腐病】导致的典型地上部表现，请继续专注于养根。`;
  }

  return null;
}

/**
 * 未来预警：基于当前病害和月份，预测风险
 */
function predictFuture(code, month) {
  const m = parseInt(month || new Date().getMonth() + 1);
  const predictions = [];

  // 规则 1: 传染性病害在雨季的预警
  if (['canker', 'anthracnose', 'root_rot_fungal', 'melanose'].includes(code)) {
    if (m >= 4 && m <= 8) { // 4-8月是雨季
      predictions.push("下月处于高温雨季，病菌极易随雨水爆发式扩散，务必在雨前喷施保护性杀菌剂。");
    }
  }

  // 规则 2: 虫害迭代
  if (code === 'red_spider') {
    predictions.push("红蜘蛛繁殖极快，杀螨后建议 7 天后复查一次，防止卵块孵化造成二次爆发。");
  }

  // 规则 3: 根系影响果实 (转色期预警)
  if ((code === 'root_rot_fungal' || code === 'nematodes') && m >= 9 && m <= 11) {
    predictions.push("根系受损将严重影响秋梢老熟和果实转色，警惕后期出现大量‘太阳果’或采前落果。");
  }

  return predictions.length > 0 ? predictions.join("\n") : null;
}

// ================= 5. 核心算法对象 =================

const CitrusAlgo = {
  runCombined: function(options) {
    // 接收 lastRecord 用于历史追溯
    const { answers, month, lastRecord } = options; 
    const feats = extractAndNormalizeSymptoms(answers);
    
    console.log("🔍 [CitrusAlgo V9.3] 特征码:", Array.from(feats));

    // 1. 结果容器
    let identifiedDiseases = []; 
    let healthScore = 100;
    
    // --- 树势判定 ---
    if (feats.has('TREE_WEAK')) healthScore -= 15;

    // --- 2. 铁证匹配逻辑 (保持 V9.2) ---
    // 根系
    if (feats.has('ROOT_KNOT')) { identifiedDiseases.push('nematodes'); healthScore -= 40; }
    if (feats.has('ROOT_ROT'))  { identifiedDiseases.push('root_rot_fungal'); healthScore -= 35; }
    if (feats.has('ROOT_BURN') || feats.has('LEAF_BURN')) { identifiedDiseases.push('root_burn'); healthScore -= 20; }
    
    // 叶果病虫
    if (feats.has('CANKER')) { identifiedDiseases.push('canker'); healthScore -= 25; }
    if (feats.has('ANTHRACNOSE')) { identifiedDiseases.push('anthracnose'); healthScore -= 20; }
    if (feats.has('RED_SPIDER')) { identifiedDiseases.push('red_spider'); healthScore -= 15; }
    if (feats.has('MINER')) { identifiedDiseases.push('leaf_miner'); healthScore -= 10; }
    if (feats.has('DEF_MG')) { identifiedDiseases.push('deficiency_Mg'); healthScore -= 10; }
    if (feats.has('DEF_ZN')) { identifiedDiseases.push('deficiency_Fe_Zn'); healthScore -= 10; }
    if (feats.has('DEF_B'))  { identifiedDiseases.push('deficiency_B'); healthScore -= 10; }
    
    // 果实特有
    if (feats.has('FRUIT_FLY')) { identifiedDiseases.push('fruit_fly'); healthScore -= 30; }
    if (feats.has('THRIPS')) { identifiedDiseases.push('thrips'); healthScore -= 10; }
    if (feats.has('MELANOSE')) { identifiedDiseases.push('melanose'); healthScore -= 15; }
    if (feats.has('SUNBURN')) { identifiedDiseases.push('sunburn'); healthScore -= 10; }
    if (feats.has('CRACKING')) { identifiedDiseases.push('cracking'); healthScore -= 15; }

    // --- 3. 组合推断逻辑 ---

    // A. 黄龙病判定
    if (feats.has('HLB_FRUIT')) {
      identifiedDiseases.unshift('hlb'); 
      healthScore -= 60;
    } else if (feats.has('HLB_LEAF') && !feats.has('ROOT_ROT') && !feats.has('CHLOROSIS_ALL')) {
      identifiedDiseases.push('hlb');
      healthScore -= 40;
    }

    // B. 缺铁/缺锌判定
    if (feats.has('CHLOROSIS_NET') && !identifiedDiseases.includes('root_rot_fungal')) {
       if (!identifiedDiseases.includes('deficiency_Fe_Zn')) {
         identifiedDiseases.push('deficiency_Fe_Zn');
       }
       healthScore -= 10;
    }

    // C. 根系衰退综合症
    const hasWeakRootSign = feats.has('WEAK_ROOT') || (feats.has('CURL_BACK') && !feats.has('RED_SPIDER') && !feats.has('MINER'));
    if (hasWeakRootSign) {
      if (!identifiedDiseases.includes('nematodes') && !identifiedDiseases.includes('root_rot_fungal')) {
        identifiedDiseases.push('weak_root');
        healthScore -= 20;
      }
    }

    // ================= 5. 生成智能报告 =================

    let finalCode = "healthy";
    
    if (identifiedDiseases.length > 0) {
      finalCode = identifiedDiseases[0];
    } else if (healthScore < 90) {
      finalCode = "sub_health";
    }

    // 获取基础信息
    const diseaseData = DISEASE_DB[finalCode] || DISEASE_DB['unknown'] || { 
      name: finalCode, severity: 'mild', logic: "未收录的病害特征", solutions: [] 
    };

    // 动态构建逻辑文案
    let reportTitle = diseaseData.name;
    let finalLogic = diseaseData.logic; // 基础辨证

    // 1. 复合风险提示
    if (identifiedDiseases.length > 1) {
      reportTitle += " (复合风险)";
      const otherDiseases = identifiedDiseases.slice(1).map(d => DISEASE_DB[d]?.name.split(' ')[0]).join('、');
      finalLogic += `\n\n⚠️【复合侵染】系统同时检测到：${otherDiseases}。请结合田间实际情况，优先处理严重等级高的病害。`;
    }

    // 2. 历史追溯 (NEW!)
    const historyLog = analyzeHistory(finalCode, lastRecord);
    if (historyLog) {
      finalLogic += `\n\n📜【病史追踪】${historyLog}`;
    }

    // 3. 未来预警 (NEW!)
    const futureLog = predictFuture(finalCode, month);
    if (futureLog) {
      finalLogic += `\n\n🔮【风险预警】${futureLog}`;
    }

    return {
      type: 'decision_tree_v5',
      diagnosis: finalCode,
      confidence: 95, 
      report: {
        title: reportTitle,
        severity: diseaseData.severity,
        severityLabel: mapSeverityLabel(diseaseData.severity),
        time: new Date().toLocaleDateString(),
        // 标签包含所有检测到的问题
        tags: identifiedDiseases.map(k => (DISEASE_DB[k] ? DISEASE_DB[k].name.split(' ')[0] : k)), 
        logic: finalLogic, // 这里包含了基础逻辑+历史+预警
        solutions: diseaseData.solutions
      },
      summary: { 
        mainModule: "root", 
        hasIssue: healthScore < 90 
      }
    };
  }
};

function mapSeverityLabel(sev) {
  if (sev === 'severe') return '高风险';
  if (sev === 'moderate') return '中风险';
  if (sev === 'mild') return '低风险';
  return '健康';
}

module.exports = CitrusAlgo;