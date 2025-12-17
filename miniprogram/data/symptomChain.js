/**
 * 症状链规则表（Symptom Chain）
 * 作用：
 * 1. 多症状组合 → 专家判断
 * 2. 参与三重权重融合（症状权重 × 环境权重 × 症状链加成）
 * 3. 可持续校准（confidence）
 */

module.exports = [

  /* =========================
   * 一、营养缺乏类（高频）
   * ========================= */

  {
    chainId: "CIT_N_01",
    crop: "citrus",
    chainName: "典型缺氮症状链",
    symptomKeys: [
      "old_leaf_yellow",
      "tree_weak",
      "shoot_growth_slow"
    ],
    stage: ["shooting", "fruiting"],
    target: "nitrogen_def",
    baseBonus: 1.20,
    confidence: 1.00,
    priority: 90,
    enabled: true,
    note: "老叶先黄，整体树势弱"
  },

  {
    chainId: "CIT_MG_01",
    crop: "citrus",
    chainName: "典型缺镁症状链",
    symptomKeys: [
      "old_leaf_yellow",
      "vein_green_leaf_yellow",
      "leaf_mottled"
    ],
    stage: ["fruiting", "expansion"],
    target: "magnesium_def",
    baseBonus: 1.30,
    confidence: 1.00,
    priority: 95,
    enabled: true,
    note: "脉绿明显，老叶斑驳"
  },

  {
    chainId: "CIT_FE_01",
    crop: "citrus",
    chainName: "典型缺铁症状链",
    symptomKeys: [
      "new_leaf_yellow",
      "vein_green_leaf_yellow",
      "shoot_thin_short"
    ],
    stage: ["shooting"],
    target: "iron_def",
    baseBonus: 1.30,
    confidence: 1.00,
    priority: 95,
    enabled: true,
    note: "新叶失绿但叶脉仍绿"
  },

  {
    chainId: "CIT_CA_01",
    crop: "citrus",
    chainName: "缺钙症状链",
    symptomKeys: [
      "leaf_edge_dry",
      "fruit_cracking",
      "fruit_skin_thick"
    ],
    stage: ["expansion"],
    target: "calcium_def",
    baseBonus: 1.25,
    confidence: 1.00,
    priority: 85,
    enabled: true,
    note: "果实问题明显，叶缘焦枯"
  },

  {
    chainId: "CIT_B_01",
    crop: "citrus",
    chainName: "缺硼症状链",
    symptomKeys: [
      "fruit_small",
      "fruit_skin_thick",
      "shoot_thin_short"
    ],
    stage: ["flowering", "fruiting"],
    target: "boron_def",
    baseBonus: 1.25,
    confidence: 1.00,
    priority: 80,
    enabled: true,
    note: "果实发育不良，新梢细弱"
  },

  /* =========================
   * 二、根系 / 土壤障碍类
   * ========================= */

  {
    chainId: "CIT_ROOT_01",
    crop: "citrus",
    chainName: "根系吸收障碍症状链",
    symptomKeys: [
      "fertilizer_no_effect",
      "yellow_after_rain",
      "tree_weak"
    ],
    stage: ["all"],
    target: "root_absorption_problem",
    baseBonus: 1.35,
    confidence: 1.00,
    priority: 100,
    enabled: true,
    note: "肥效差，雨后黄化加重"
  },

  /* =========================
   * 三、生理失调类（非单一元素）
   * ========================= */

  {
    chainId: "CIT_PHYS_01",
    crop: "citrus",
    chainName: "营养失衡型黄化",
    symptomKeys: [
      "old_leaf_yellow",
      "new_leaf_yellow",
      "leaf_drop"
    ],
    stage: ["all"],
    target: "nutrition_imbalance",
    baseBonus: 1.15,
    confidence: 1.00,
    priority: 70,
    enabled: true,
    note: "新老叶同时异常"
  },

  /* =========================
   * 四、风险排除链（防误判）
   * ========================= */

  {
    chainId: "CIT_EXC_01",
    crop: "citrus",
    chainName: "非营养主因排除链",
    symptomKeys: [
      "leaf_curled",
      "fruit_color_uneven"
    ],
    stage: ["all"],
    target: "possible_disease_or_stress",
    baseBonus: 0.85,
    confidence: 1.00,
    priority: 110,
    enabled: true,
    note: "可能存在病害或环境胁迫"
  }

];
