// miniprogram/utils/citrus_algo.js
// 柑橘全系统诊断算法 V9.0
// 核心升级：
// 1. 引入 DISEASE_LIB (病害知识库)，提供“教科书级”的专家辨证和详细处方。
// 2. 方案细化：将建议拆分为“急救”、“防治”、“调理”三个维度。
// 3. 彻底解决“亚健康”误报问题，铁证直出。

// ================= 1. 标签映射表 (TAG_MAP) =================
// 作用：将用户可能选到的各种五花八门的标签，统一翻译成标准特征码
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
  'interveinal_chlorosis': 'CHLOROSIS_NET', // 网状黄化
  'vein_chlorosis': 'CHLOROSIS_VEIN', // 脉黄
  'uniform_yellow': 'CHLOROSIS_ALL', // 全黄
  'tip_burn': 'LEAF_BURN', 'necrotic_edge': 'LEAF_BURN', // 叶焦
  'leaf_curl': 'CURL', 'curl': 'CURL',
  'curl_down': 'CURL_BACK', 'curl_back': 'CURL_BACK', // 反卷
  'curl_up': 'CURL_FACE', 'curl_face': 'CURL_FACE', // 正卷

  // --- 果实特征 ---
  'thrips_ring': 'THRIPS', 'silver_ring': 'THRIPS', // 蓟马
  'sunburn_patch': 'SUNBURN', // 日灼
  'melanose_spots': 'MELANOSE', 'sand_skin': 'MELANOSE', // 砂皮
  'maggot_rot': 'FRUIT_FLY' // 实蝇
};

// ================= 2. 专业病害知识库 (DISEASE_LIB) =================
// 作用：存储每个病害的“专家辨证话术”和“详细处方”
const DISEASE_LIB = {
  // --- A. 根系病害 ---
  'NEMATODE': {
    name: '根结线虫病',
    severity: 'severe',
    logic: '🔍【专家辨证】根部发现明显的肿大结节（根结），这是线虫侵入根系细胞、破坏输导组织的铁证。线虫会导致根系无法吸收水肥，从而引起地上部黄化、树势衰退。',
    solutions: [
      { type: '急救用药', content: '使用10%噻唑膦颗粒剂、或1.8%阿维菌素乳油兑水进行灌根，杀灭土壤线虫。' },
      { type: '根系修复', content: '杀线7天后，淋施含腐植酸、海藻酸的生根剂，诱发新根生长。' },
      { type: '农业防治', content: '增施腐熟有机肥，提高土壤有机质，改善根际微生态。' }
    ]
  },
  'ROOT_ROT': {
    name: '根腐病/沤根',
    severity: 'severe',
    logic: '🔍【专家辨证】根系皮层腐烂、发黑且伴有酸臭味，说明根际环境严重缺氧或受病菌侵染（如疫霉菌）。根死则叶黄，需立即抢救。',
    solutions: [
      { type: '急救排水', content: '立即开挖排水沟，降低地下水位，扒开根颈部土壤进行晾根。' },
      { type: '杀菌灌根', content: '使用30%甲霜·恶霉灵、或25%精甲霜灵进行灌根消毒。' },
      { type: '调理恢复', content: '待新根长出后，薄施高钙水溶肥壮根。' }
    ]
  },
  'ROOT_BURN': {
    name: '肥害/药害',
    severity: 'moderate',
    logic: '🔍【专家辨证】根系呈现脱水状干枯，叶缘焦枯（火烧状），结合近期施肥/用药史，判定为浓度过高引起的生理性渗透胁迫。',
    solutions: [
      { type: '紧急缓解', content: '立即停止施肥！用大量清水淋灌根部，冲淡土壤中的肥料浓度。' },
      { type: '叶面解毒', content: '喷施碧护（赤·吲乙·芸苔）或纯芸苔素内酯，提升树体抗逆性。' }
    ]
  },

  // --- B. 叶果病虫 ---
  'CANKER': {
    name: '溃疡病',
    severity: 'moderate',
    logic: '🔍【专家辨证】病斑呈火山口状开裂，周围有黄晕，且甚至穿透叶片，这是细菌性溃疡病的典型特征。该病易随风雨传播，需严防扩散。',
    solutions: [
      { type: '化学防治', content: '选用氢氧化铜、春雷霉素、或王铜等铜制剂进行喷雾防治。' },
      { type: '修剪清园', content: '剪除病枝病叶并带出果园烧毁，减少传染源。' },
      { type: '避雨防风', content: '台风雨前后是防治关键期，务必抢晴喷药。' }
    ]
  },
  'RED_SPIDER': {
    name: '红蜘蛛',
    severity: 'moderate',
    logic: '🔍【专家辨证】叶面出现密集灰白失绿点，叶片失去光泽。这是红蜘蛛（叶螨）刺吸叶片汁液所致，严重时会引起落叶。',
    solutions: [
      { type: '杀螨剂', content: '轮换使用联苯肼酯、乙螨唑、螺螨酯等药剂，重点喷施叶背。' },
      { type: '注意事项', content: '红蜘蛛抗药性强，切忌长期单一使用同一种药剂。' }
    ]
  },
  'MINER': {
    name: '潜叶蛾',
    severity: 'mild',
    logic: '🔍【专家辨证】新梢叶片上出现银白色弯曲虫道（鬼画符），这是潜叶蛾幼虫潜食叶肉留下的痕迹，易诱发溃疡病。',
    solutions: [
      { type: '保梢用药', content: '在新梢抽出“一粒米”长时，喷施氯虫苯甲酰胺、高效氯氟氰菊酯。' },
      { type: '抹芽控梢', content: '统一抹除零星抽发的夏梢，切断害虫食物链。' }
    ]
  },
  'DEF_MG': {
    name: '缺镁症',
    severity: 'mild',
    logic: '🔍【专家辨证】老叶基部出现倒V字形黄斑，这是典型的缺镁症状。镁是叶绿素的核心元素，缺镁会影响光合作用。',
    solutions: [
      { type: '补充营养', content: '叶面喷施硝酸镁或螯合镁；根部撒施钙镁磷肥。' },
      { type: '土壤改良', content: '酸性土壤容易缺镁，建议撒施生石灰调节土壤pH值。' }
    ]
  },
  
  // --- C. 综合/推断 ---
  'WEAK_ROOT_SYNDROME': {
    name: '根系衰退综合症',
    severity: 'moderate',
    logic: '🔍【专家辨证】树势衰弱伴随叶片反卷/黄化，虽未见明显根结或腐烂，但根系吸收功能已显著下降（隐形根病）。“根深才能叶茂”，问题在根。',
    solutions: [
      { type: '养根调理', content: '淋施含矿源黄腐酸钾、海藻提取物的水溶肥，改良根际环境。' },
      { type: '叶面补充', content: '根系吸收差时，通过叶面喷施氨基酸+微量元素，维持树体营养。' }
    ]
  }
};

// ================= 3. 辅助函数 =================

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
  runCombined: function(options) {
    const { answers } = options;
    const feats = extractAndNormalizeSymptoms(answers);
    
    console.log("🔍 [CitrusAlgo V9.0] 特征码:", Array.from(feats));

    // 1. 结果容器
    let identifiedDiseases = []; // 存病害KEY
    let healthScore = 100;
    
    // --- 树势判定 ---
    let isWeak = feats.has('TREE_WEAK');
    if (isWeak) healthScore -= 15;

    // --- 2. 铁证匹配 (匹配后直接推入 identifiedDiseases) ---
    
    if (feats.has('ROOT_KNOT')) { identifiedDiseases.push('NEMATODE'); healthScore -= 40; }
    if (feats.has('ROOT_ROT'))  { identifiedDiseases.push('ROOT_ROT'); healthScore -= 35; }
    if (feats.has('ROOT_BURN') || feats.has('LEAF_BURN')) { identifiedDiseases.push('ROOT_BURN'); healthScore -= 20; }
    
    if (feats.has('CANKER')) { identifiedDiseases.push('CANKER'); healthScore -= 25; }
    if (feats.has('RED_SPIDER')) { identifiedDiseases.push('RED_SPIDER'); healthScore -= 15; }
    if (feats.has('MINER')) { identifiedDiseases.push('MINER'); healthScore -= 10; }
    if (feats.has('DEF_MG')) { identifiedDiseases.push('DEF_MG'); healthScore -= 10; }

    // --- 3. 疑证推断 (当没有铁证时触发) ---
    
    // 反卷 + 无虫 + 无严重根病 = 根系衰退
    if (feats.has('CURL_BACK') && !feats.has('RED_SPIDER') && !feats.has('MINER')) {
      if (!identifiedDiseases.includes('NEMATODE') && !identifiedDiseases.includes('ROOT_ROT')) {
        identifiedDiseases.push('WEAK_ROOT_SYNDROME');
        healthScore -= 20;
      }
    }

    // ================= 5. 生成报告 =================

    let reportTitle = "健康";
    let reportLogic = "各项指标正常，未发现明显病虫害特征。";
    let reportSolutions = [
      { type: '日常管理', content: '建议定期巡园，保持水肥平衡，注意预防病虫害。' }
    ];
    let reportSeverity = "none";
    let finalDiagnosisCode = "healthy";

    // 如果发现了病害
    if (identifiedDiseases.length > 0) {
      // 简单排序规则：根病优先级 > 叶病优先级
      // 这里直接取第一个作为主病害展示
      let mainKey = identifiedDiseases[0];
      let diseaseData = DISEASE_LIB[mainKey];

      reportTitle = diseaseData.name;
      reportLogic = diseaseData.logic;
      reportSolutions = diseaseData.solutions;
      reportSeverity = diseaseData.severity;
      finalDiagnosisCode = mainKey;

      // 如果有多个病害，提示复合风险
      if (identifiedDiseases.length > 1) {
        reportTitle += " (复合风险)";
        reportLogic += "\n⚠️【注意】同时检测到多种异常，请结合田间实际情况综合防治。";
      }
    } 
    // 没发现病害，但有扣分 (亚健康)
    else if (healthScore < 90) {
      reportTitle = "亚健康状态";
      reportSeverity = "mild";
      reportLogic = "🔍【专家辨证】未匹配到典型烈性病害，但树体表现出非典型的不适（如轻微卷叶或黄化）。";
      reportSolutions = [
        { type: '调理建议', content: '建议淋施海藻酸或氨基酸水溶肥，提升树体抗逆性。' }
      ];
      finalDiagnosisCode = "sub_health";
    }

    // 最终标题修饰
    if (reportSeverity === 'severe') reportTitle = "高风险 - " + reportTitle;
    if (reportSeverity === 'moderate') reportTitle = "需调理 - " + reportTitle;

    return {
      type: 'decision_tree_v5',
      diagnosis: finalDiagnosisCode,
      confidence: 95, // 既然是铁证，这就很高
      report: {
        title: reportTitle,
        severity: reportSeverity,
        severityLabel: reportSeverity === 'severe' ? '严重' : (reportSeverity === 'moderate' ? '中度' : (reportSeverity === 'none' ? '健康' : '轻微')),
        time: new Date().toLocaleDateString(),
        tags: identifiedDiseases.map(k => DISEASE_LIB[k].name), // 标签回填
        logic: reportLogic,
        solutions: reportSolutions
      },
      summary: { mainModule: "root", hasIssue: healthScore < 90 }
    };
  }
};

module.exports = CitrusAlgo;