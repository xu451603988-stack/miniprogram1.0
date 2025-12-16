// miniprogram/utils/citrus_algo.js
// 柑橘全系统诊断算法 V9.1 (数据中心化版)
// 核心升级：病害数据已分离至 data/disease_database.js，实现统一维护

// 1. 引入统一的数据中心
// 请确保 miniprogram/data/disease_database.js 文件已存在
const DISEASE_DB = require('../data/disease_database.js');

// 2. 标签映射表 (TAG_MAP)
// 作用：将用户可能选到的各种标签，统一翻译成标准特征码
const TAG_MAP = {
  // --- 树势背景 ---
  'TREE_WEAK': 'TREE_WEAK', 'weak_tree': 'TREE_WEAK',
  'TREE_VIGOROUS': 'TREE_VIGOROUS',
  'TREE_YOUNG': 'TREE_YOUNG',

  // --- 根系特征 ---
  'root_knots': 'ROOT_KNOT', 'has_knot': 'ROOT_KNOT', 'knots': 'ROOT_KNOT', // 根结
  'root_rot_smell': 'ROOT_ROT', 'bad_root': 'ROOT_ROT', 'sour_smell': 'ROOT_ROT', 'root_black': 'ROOT_ROT', // 根腐
  'root_burn_dry': 'ROOT_BURN', 'dry_root': 'ROOT_BURN', // 烧根
  'few_white_roots': 'WEAK_ROOT', // 根弱

  // --- 叶片特征 ---
  'leaf_miner_trails': 'MINER', 'trails': 'MINER', 'leaf_miner': 'MINER', // 潜叶蛾
  'red_spider_symptoms': 'RED_SPIDER', 'gray_white_spots': 'RED_SPIDER', 'red_dots': 'RED_SPIDER', // 红蜘蛛
  'sooty_mold': 'SOOTY', 'black_powder': 'SOOTY', // 煤污
  'canker_spots': 'CANKER', 'crater_spots': 'CANKER', 'canker_like': 'CANKER', 'leaf_has_spots': 'CANKER', // 溃疡
  'inverted_v_yellow': 'DEF_MG', // 缺镁
  'interveinal_chlorosis': 'CHLOROSIS_NET', // 网状黄化 (缺铁/锌)
  'vein_chlorosis': 'CHLOROSIS_VEIN', // 脉黄 (缺硼/毒)
  'uniform_yellow': 'CHLOROSIS_ALL', // 全黄 (缺氮/根腐)
  'tip_burn': 'LEAF_BURN', 'necrotic_edge': 'LEAF_BURN', // 叶焦 (肥害/缺钾)
  'leaf_curl': 'CURL', 'curl': 'CURL',
  'curl_down': 'CURL_BACK', 'curl_back': 'CURL_BACK', // 反卷
  'curl_up': 'CURL_FACE', 'curl_face': 'CURL_FACE', // 正卷

  // --- 果实特征 ---
  'thrips_ring': 'THRIPS', 'silver_ring': 'THRIPS', // 蓟马
  'sunburn_patch': 'SUNBURN', // 日灼
  'melanose_spots': 'MELANOSE', 'sand_skin': 'MELANOSE', // 砂皮
  'maggot_rot': 'FRUIT_FLY', // 实蝇
  'cracking': 'CRACKING', // 裂果
  'red_nose': 'HLB_FRUIT' // 红鼻子果 (黄龙病特征)
};

// ================= 3. 辅助函数 =================

/**
 * 提取并标准化特征
 * 将用户在 leaf/fruit/root 三个模块的答案合并，并转译为标准特征码
 */
function extractAndNormalizeSymptoms(answers) {
  let features = new Set();
  ['leaf', 'fruit', 'root'].forEach(part => {
    if (answers[part]) {
      Object.values(answers[part]).forEach(val => {
        if (Array.isArray(val)) {
          val.forEach(v => {
            if (TAG_MAP[v]) features.add(TAG_MAP[v]);
            else features.add(v);
          });
        } else if (val) {
          if (TAG_MAP[val]) features.add(TAG_MAP[val]);
          else features.add(val);
        }
      });
    }
  });
  return features;
}

// ================= 4. 核心算法对象 =================

const CitrusAlgo = {
  /**
   * 综合诊断主入口
   * @param {Object} options - 包含 answers, month, crop 等
   */
  runCombined: function(options) {
    const { answers } = options;
    const feats = extractAndNormalizeSymptoms(answers);
    
    console.log("🔍 [CitrusAlgo V9.1] 捕获特征码:", Array.from(feats));

    // 1. 结果容器
    let identifiedDiseases = []; // 存放确诊的病害 Key (对应 disease_database.js 的 key)
    let healthScore = 100;
    
    // --- 树势判定 ---
    let isWeak = feats.has('TREE_WEAK');
    if (isWeak) healthScore -= 15;

    // --- 2. 铁证匹配逻辑 (Ironclad Logic) ---
    // 只要出现以下特征，直接推入对应的病害Key
    
    // 根系部分
    if (feats.has('ROOT_KNOT')) { 
      identifiedDiseases.push('nematodes'); 
      healthScore -= 40; 
    }
    if (feats.has('ROOT_ROT')) { 
      identifiedDiseases.push('root_rot_fungal'); 
      healthScore -= 35; 
    }
    if (feats.has('ROOT_BURN') || feats.has('LEAF_BURN')) { 
      identifiedDiseases.push('root_burn'); 
      healthScore -= 20; 
    }
    
    // 叶果病虫部分
    if (feats.has('CANKER')) { 
      identifiedDiseases.push('canker'); 
      healthScore -= 25; 
    }
    if (feats.has('RED_SPIDER')) { 
      identifiedDiseases.push('red_spider'); 
      healthScore -= 15; 
    }
    if (feats.has('MINER')) { 
      identifiedDiseases.push('leaf_miner'); 
      healthScore -= 10; 
    }
    if (feats.has('DEF_MG')) { 
      identifiedDiseases.push('deficiency_Mg'); 
      healthScore -= 10; 
    }
    if (feats.has('FRUIT_FLY')) { 
      identifiedDiseases.push('fruit_fly'); 
      healthScore -= 30; 
    }
    if (feats.has('THRIPS')) { 
      identifiedDiseases.push('thrips'); 
      healthScore -= 10; 
    }
    if (feats.has('MELANOSE')) { 
      identifiedDiseases.push('melanose'); 
      healthScore -= 15; 
    }
    if (feats.has('SUNBURN')) { 
      identifiedDiseases.push('sunburn'); 
      healthScore -= 10; 
    }
    if (feats.has('CRACKING')) { 
      identifiedDiseases.push('cracking'); 
      healthScore -= 15; 
    }
    
    // 黄龙病高危判定 (果实红鼻子 + 叶片异常)
    if (feats.has('HLB_FRUIT') && (feats.has('CHLOROSIS_NET') || feats.has('CHLOROSIS_VEIN'))) {
      identifiedDiseases.push('hlb');
      healthScore -= 50;
    }

    // --- 3. 疑证推断 (Inference Logic) ---
    // 当没有铁证时，根据组合特征进行推断
    
    // 根系衰退综合症：反卷 + 无虫 + 无严重根病
    if (feats.has('CURL_BACK') && !feats.has('RED_SPIDER') && !feats.has('MINER')) {
      if (!identifiedDiseases.includes('nematodes') && !identifiedDiseases.includes('root_rot_fungal')) {
        identifiedDiseases.push('weak_root');
        healthScore -= 20;
      }
    }
    
    // 缺铁/缺锌：网状黄化 + 排除根腐
    if (feats.has('CHLOROSIS_NET') && !identifiedDiseases.includes('root_rot_fungal') && !identifiedDiseases.includes('hlb')) {
       identifiedDiseases.push('deficiency_Fe_Zn');
       healthScore -= 10;
    }

    // ================= 5. 生成报告 =================

    let finalCode = "healthy"; // 默认健康
    
    if (identifiedDiseases.length > 0) {
      finalCode = identifiedDiseases[0]; // 命中病害，取优先级最高的第一个
    } else if (healthScore < 90) {
      finalCode = "sub_health"; // 没命中具体病害，但分数低，算亚健康
    }

    // 从数据库获取详细信息
    // 如果找不到 key，兜底到 'unknown'
    const diseaseData = DISEASE_DB[finalCode] || DISEASE_DB['unknown'];

    // 构造动态标题
    let reportTitle = diseaseData.name;
    
    if (identifiedDiseases.length > 1) {
      reportTitle += " (复合风险)";
      // 可以在 logic 中追加提示
      diseaseData.logic += "\n⚠️【注意】同时检测到多种异常特征，建议结合田间实际情况综合防治。";
    }

    // 返回标准结构
    return {
      type: 'decision_tree_v5',
      diagnosis: finalCode, // 核心结论代码
      confidence: 95, // 确信度
      report: {
        title: reportTitle,
        severity: diseaseData.severity,
        severityLabel: mapSeverityLabel(diseaseData.severity),
        time: new Date().toLocaleDateString(),
        tags: identifiedDiseases.map(k => (DISEASE_DB[k] ? DISEASE_DB[k].name.split(' ')[0] : k)), // 回填所有检测到的病害名
        logic: diseaseData.logic,
        solutions: diseaseData.solutions
      },
      summary: { 
        mainModule: "root", 
        hasIssue: healthScore < 90 
      }
    };
  }
};

// 辅助：简单的等级中文映射
function mapSeverityLabel(sev) {
  if (sev === 'severe') return '高风险';
  if (sev === 'moderate') return '中风险';
  if (sev === 'mild') return '低风险';
  return '健康';
}

module.exports = CitrusAlgo;