module.exports = [
  /* ========= 一、营养缺乏类 ========= */

  {
    id: "CIT_MG_01",
    crop: "citrus",
    name: "典型缺镁症状链",
    symptoms: ["old_leaf_yellow", "vein_green", "leaf_mottled"],
    stage: ["fruiting", "expansion"],
    target: "magnesium_def",
    bonus: 1.25
  },
  {
    id: "CIT_N_01",
    crop: "citrus",
    name: "缺氮弱树链",
    symptoms: ["leaf_light_green", "new_shoot_short", "tree_weak"],
    stage: ["spring_shoot", "fruit_set"],
    target: "nitrogen_def",
    bonus: 1.2
  },
  {
    id: "CIT_K_01",
    crop: "citrus",
    name: "缺钾果实发育不良链",
    symptoms: ["leaf_edge_scorch", "fruit_small", "low_sugar"],
    stage: ["expansion"],
    target: "potassium_def",
    bonus: 1.25
  },
  {
    id: "CIT_CA_01",
    crop: "citrus",
    name: "钙吸收障碍链",
    symptoms: ["fruit_crack", "fruit_surface_rough", "dry_then_wet"],
    stage: ["expansion", "coloring"],
    target: "calcium_disorder",
    bonus: 1.3
  },
  {
    id: "CIT_B_01",
    crop: "citrus",
    name: "缺硼花果异常链",
    symptoms: ["flower_drop", "deformed_fruit", "hollow_core"],
    stage: ["flowering", "fruit_set"],
    target: "boron_def",
    bonus: 1.3
  },

  /* ========= 二、根系 & 土壤问题 ========= */

  {
    id: "CIT_ROOT_01",
    crop: "citrus",
    name: "根系活力下降链",
    symptoms: ["rain_after_worse", "tree_weak", "fruit_drop"],
    stage: ["fruit_set", "expansion"],
    target: "root_problem",
    bonus: 1.3
  },
  {
    id: "CIT_ROOT_02",
    crop: "citrus",
    name: "根区缺氧链",
    symptoms: ["soil_waterlogged", "yellow_leaf", "slow_growth"],
    stage: ["all"],
    target: "root_hypoxia",
    bonus: 1.25
  },
  {
    id: "CIT_SOIL_01",
    crop: "citrus",
    name: "土壤板结吸收差链",
    symptoms: ["fertilized_no_effect", "root_shallow", "tree_weak"],
    stage: ["all"],
    target: "soil_compaction",
    bonus: 1.2
  },

  /* ========= 三、水分 & 生理失衡 ========= */

  {
    id: "CIT_WATER_01",
    crop: "citrus",
    name: "水分忽干忽湿链",
    symptoms: ["dry_then_wet", "fruit_crack", "leaf_drop"],
    stage: ["expansion"],
    target: "water_imbalance",
    bonus: 1.3
  },
  {
    id: "CIT_PHYS_01",
    crop: "citrus",
    name: "生理性落果链",
    symptoms: ["normal_leaf", "fruit_drop", "no_disease_spot"],
    stage: ["fruit_set"],
    target: "physiological_drop",
    bonus: 1.25
  },

  /* ========= 四、氮偏旺 & 徒长 ========= */

  {
    id: "CIT_N_HIGH_01",
    crop: "citrus",
    name: "氮肥偏旺徒长链",
    symptoms: ["new_shoot_overgrowth", "leaf_dark_green", "fruit_set_low"],
    stage: ["fruit_set"],
    target: "nitrogen_excess",
    bonus: 1.25
  },

  /* ========= 五、叶片异常综合链 ========= */

  {
    id: "CIT_LEAF_01",
    crop: "citrus",
    name: "新叶畸形微量元素障碍",
    symptoms: ["new_leaf_deformed", "short_internode", "growth_stagnant"],
    stage: ["spring_shoot"],
    target: "micro_element_disorder",
    bonus: 1.25
  },

  /* ========= 六、果实品质问题 ========= */

  {
    id: "CIT_FRUIT_01",
    crop: "citrus",
    name: "转色不良链",
    symptoms: ["uneven_coloring", "low_sugar", "thick_peel"],
    stage: ["coloring"],
    target: "nutrient_balance_issue",
    bonus: 1.2
  },
  {
    id: "CIT_FRUIT_02",
    crop: "citrus",
    name: "果小皮厚综合链",
    symptoms: ["fruit_small", "thick_peel", "tree_overload"],
    stage: ["expansion"],
    target: "tree_load_excess",
    bonus: 1.2
  },

  /* ========= 七、病害风险（不下结论） ========= */

  {
    id: "CIT_DIS_RISK_01",
    crop: "citrus",
    name: "炭疽早期风险链",
    symptoms: ["leaf_spot_small", "spot_expand_slow", "rain_after_worse"],
    stage: ["all"],
    target: "disease_risk",
    bonus: 1.2
  },
  {
    id: "CIT_DIS_RISK_02",
    crop: "citrus",
    name: "溃疡病环境风险链",
    symptoms: ["leaf_oily_spot", "high_humidity", "strong_wind_damage"],
    stage: ["spring_shoot"],
    target: "disease_risk",
    bonus: 1.2
  },

  /* ========= 八、综合衰弱链 ========= */

  {
    id: "CIT_DECLINE_01",
    crop: "citrus",
    name: "树势整体衰弱链",
    symptoms: ["small_leaf", "short_shoot", "low_yield"],
    stage: ["all"],
    target: "tree_decline",
    bonus: 1.3
  },
  {
    id: "CIT_DECLINE_02",
    crop: "citrus",
    name: "老树结果能力下降链",
    symptoms: ["old_tree", "fruit_small", "poor_coloring"],
    stage: ["coloring"],
    target: "aging_tree_issue",
    bonus: 1.25
  },

  /* ========= 九、管理不当信号 ========= */

  {
    id: "CIT_MGMT_01",
    crop: "citrus",
    name: "修剪不当徒长链",
    symptoms: ["long_water_shoot", "shade_inside", "fruit_inside_few"],
    stage: ["summer_shoot"],
    target: "pruning_issue",
    bonus: 1.2
  },
  {
    id: "CIT_MGMT_02",
    crop: "citrus",
    name: "负载过重链",
    symptoms: ["too_many_fruit", "fruit_small", "leaf_yellow_late"],
    stage: ["expansion"],
    target: "overload",
    bonus: 1.25
  },

  /* ========= 十、极端气候适应 ========= */

  {
    id: "CIT_CLIMATE_01",
    crop: "citrus",
    name: "高温热害链",
    symptoms: ["leaf_burn", "fruit_sunburn", "high_temperature"],
    stage: ["summer_shoot", "expansion"],
    target: "heat_stress",
    bonus: 1.3
  },
  {
    id: "CIT_CLIMATE_02",
    crop: "citrus",
    name: "低温冷害链",
    symptoms: ["leaf_wilt", "shoot_black", "sudden_cold"],
    stage: ["winter"],
    target: "cold_stress",
    bonus: 1.3
  }
]
