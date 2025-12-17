/**
 * 症状标准化映射表（Symptom Map）
 * 作用：
 * 1. 问卷展示 → 症状标准化
 * 2. 症状 → 症状链 / 权重算法的统一入口
 * 3. 可配置、可扩展、可下线
 */

module.exports = [
  /* =====================
   * 一、叶片类症状
   * ===================== */

  {
    id: "SM_CIT_001",
    crop: "citrus",
    questionText: "老叶发黄",
    symptomKey: "old_leaf_yellow",
    category: "leaf",
    weightHint: "high",
    description: "老叶整体或局部发黄",
    enabled: true
  },
  {
    id: "SM_CIT_002",
    crop: "citrus",
    questionText: "新叶发黄",
    symptomKey: "new_leaf_yellow",
    category: "leaf",
    weightHint: "high",
    description: "新梢叶片发黄或浅绿",
    enabled: true
  },
  {
    id: "SM_CIT_003",
    crop: "citrus",
    questionText: "叶脉是绿的，叶肉发黄",
    symptomKey: "vein_green_leaf_yellow",
    category: "leaf",
    weightHint: "very_high",
    description: "典型失绿症状",
    enabled: true
  },
  {
    id: "SM_CIT_004",
    crop: "citrus",
    questionText: "叶片有黄绿相间的斑驳",
    symptomKey: "leaf_mottled",
    category: "leaf",
    weightHint: "high",
    description: "斑驳状黄化",
    enabled: true
  },
  {
    id: "SM_CIT_005",
    crop: "citrus",
    questionText: "叶片卷曲或畸形",
    symptomKey: "leaf_curled",
    category: "leaf",
    weightHint: "medium",
    description: "叶片向内或向外卷曲",
    enabled: true
  },
  {
    id: "SM_CIT_006",
    crop: "citrus",
    questionText: "叶尖或叶缘干枯",
    symptomKey: "leaf_edge_dry",
    category: "leaf",
    weightHint: "medium",
    description: "叶缘焦枯或坏死",
    enabled: true
  },

  /* =====================
   * 二、枝梢生长类
   * ===================== */

  {
    id: "SM_CIT_010",
    crop: "citrus",
    questionText: "新梢生长缓慢",
    symptomKey: "shoot_growth_slow",
    category: "shoot",
    weightHint: "medium",
    description: "新梢短小、生长乏力",
    enabled: true
  },
  {
    id: "SM_CIT_011",
    crop: "citrus",
    questionText: "新梢细弱，节间短",
    symptomKey: "shoot_thin_short",
    category: "shoot",
    weightHint: "high",
    description: "节间明显缩短",
    enabled: true
  },

  /* =====================
   * 三、果实类症状
   * ===================== */

  {
    id: "SM_CIT_020",
    crop: "citrus",
    questionText: "果实偏小",
    symptomKey: "fruit_small",
    category: "fruit",
    weightHint: "medium",
    description: "果径明显偏小",
    enabled: true
  },
  {
    id: "SM_CIT_021",
    crop: "citrus",
    questionText: "果皮粗糙、增厚",
    symptomKey: "fruit_skin_thick",
    category: "fruit",
    weightHint: "high",
    description: "果皮粗厚、手感差",
    enabled: true
  },
  {
    id: "SM_CIT_022",
    crop: "citrus",
    questionText: "果实着色不均匀",
    symptomKey: "fruit_color_uneven",
    category: "fruit",
    weightHint: "medium",
    description: "转色慢、颜色不一致",
    enabled: true
  },
  {
    id: "SM_CIT_023",
    crop: "citrus",
    questionText: "果实易裂果",
    symptomKey: "fruit_cracking",
    category: "fruit",
    weightHint: "high",
    description: "雨后或膨大期裂果",
    enabled: true
  },

  /* =====================
   * 四、整体树势类
   * ===================== */

  {
    id: "SM_CIT_030",
    crop: "citrus",
    questionText: "整树长势弱",
    symptomKey: "tree_weak",
    category: "tree",
    weightHint: "medium",
    description: "整体生长势差",
    enabled: true
  },
  {
    id: "SM_CIT_031",
    crop: "citrus",
    questionText: "落叶严重",
    symptomKey: "leaf_drop",
    category: "tree",
    weightHint: "high",
    description: "非正常大量落叶",
    enabled: true
  },

  /* =====================
   * 五、根系与土壤相关（感知型）
   * ===================== */

  {
    id: "SM_CIT_040",
    crop: "citrus",
    questionText: "雨后黄叶加重",
    symptomKey: "yellow_after_rain",
    category: "soil",
    weightHint: "high",
    description: "与土壤通气性相关",
    enabled: true
  },
  {
    id: "SM_CIT_041",
    crop: "citrus",
    questionText: "长期施肥但效果不明显",
    symptomKey: "fertilizer_no_effect",
    category: "soil",
    weightHint: "high",
    description: "疑似根系吸收障碍",
    enabled: true
  }

];
