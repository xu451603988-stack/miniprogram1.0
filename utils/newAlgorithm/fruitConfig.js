// miniprogram/utils/newAlgorithm/fruitConfig.js
module.exports = {
  version: "2.0.0",
  
  // 特征权重配置
  features: {
    // 果实位置
    is_outer: {
      pathogen: { melanose: 2, greasy_spot: 1, canker: 2, septoria: 1, fungal_generic: 1, bacterial: 1, viral: 0, fruit_fly: 1, stem_puncture_rot: 1 },
      physio: { cracking_water_imbalance: 1, sunburn: 4, calcium_deficiency: 1, ethylene_induced_drop: 1, HLB_physiology: 0 }
    },
    
    // 果实症状
    has_surface_pits: {
      pathogen: { melanose: 5, greasy_spot: 2, canker: 3, septoria: 4, fungal_generic: 3, bacterial: 2, viral: 0, fruit_fly: 0, stem_puncture_rot: 2 },
      physio: { cracking_water_imbalance: 0, sunburn: 0, calcium_deficiency: 0, ethylene_induced_drop: 0, HLB_physiology: 0 }
    },
    has_oily_spots: {
      pathogen: { melanose: 2, greasy_spot: 5, canker: 1, septoria: 3, fungal_generic: 2, bacterial: 0, viral: 0, fruit_fly: 0, stem_puncture_rot: 1 },
      physio: { cracking_water_imbalance: 0, sunburn: 0, calcium_deficiency: 0, ethylene_induced_drop: 0, HLB_physiology: 0 }
    },
    has_sunburn: {
      pathogen: { melanose: 0, greasy_spot: 0, canker: 0, septoria: 0, fungal_generic: 0, bacterial: 0, viral: 0, fruit_fly: 0, stem_puncture_rot: 0 },
      physio: { cracking_water_imbalance: 0, sunburn: 5, calcium_deficiency: 0, ethylene_induced_drop: 0, HLB_physiology: 0 }
    },
    has_cracking: {
      pathogen: { melanose: 0, greasy_spot: 0, canker: 0, septoria: 0, fungal_generic: 0, bacterial: 0, viral: 0, fruit_fly: 0, stem_puncture_rot: 0 },
      physio: { cracking_water_imbalance: 5, sunburn: 0, calcium_deficiency: 2, ethylene_induced_drop: 0, HLB_physiology: 0 }
    },
    has_color_inversion: {
      pathogen: { melanose: 0, greasy_spot: 0, canker: 0, septoria: 0, fungal_generic: 0, bacterial: 0, viral: 3, fruit_fly: 0, stem_puncture_rot: 0 },
      physio: { cracking_water_imbalance: 0, sunburn: 0, calcium_deficiency: 0, ethylene_induced_drop: 0, HLB_physiology: 5 }
    },
    has_premature_drop: {
      pathogen: { melanose: 1, greasy_spot: 1, canker: 2, septoria: 1, fungal_generic: 2, bacterial: 2, viral: 3, fruit_fly: 1, stem_puncture_rot: 2 },
      physio: { cracking_water_imbalance: 0, sunburn: 0, calcium_deficiency: 1, ethylene_induced_drop: 3, HLB_physiology: 4 }
    },
    has_oviposition: {
      pathogen: { melanose: 0, greasy_spot: 0, canker: 0, septoria: 0, fungal_generic: 0, bacterial: 0, viral: 0, fruit_fly: 5, stem_puncture_rot: 0 },
      physio: { cracking_water_imbalance: 0, sunburn: 0, calcium_deficiency: 0, ethylene_induced_drop: 0, HLB_physiology: 0 }
    },
    
    // 事件特征
    recent_rain: {
      pathogen: { melanose: 3, greasy_spot: 4, canker: 2, septoria: 3, fungal_generic: 3, bacterial: 2, viral: 0, fruit_fly: -1, stem_puncture_rot: 2 },
      physio: { cracking_water_imbalance: 2, sunburn: 0, calcium_deficiency: 0, ethylene_induced_drop: 0, HLB_physiology: 0 }
    },
    recent_hot: {
      pathogen: { melanose: 0, greasy_spot: 0, canker: 0, septoria: 0, fungal_generic: 0, bacterial: 0, viral: 0, fruit_fly: 1, stem_puncture_rot: 0 },
      physio: { cracking_water_imbalance: 0, sunburn: 4, calcium_deficiency: 0, ethylene_induced_drop: 0, HLB_physiology: 0 }
    },
    recent_heavy_n: {
      pathogen: { melanose: 0, greasy_spot: 0, canker: 0, septoria: 0, fungal_generic: 0, bacterial: 0, viral: 0, fruit_fly: 0, stem_puncture_rot: 0 },
      physio: { cracking_water_imbalance: 0, sunburn: 0, calcium_deficiency: 0, ethylene_induced_drop: 2, HLB_physiology: 0 }
    },
    recent_spray: {
      pathogen: { melanose: 0, greasy_spot: 0, canker: 0, septoria: 0, fungal_generic: 0, bacterial: 0, viral: 0, fruit_fly: 0, stem_puncture_rot: 0 },
      physio: { cracking_water_imbalance: 0, sunburn: 0, calcium_deficiency: 0, ethylene_induced_drop: 0, HLB_physiology: 0 }
    }
  },
  
  // 物候校正配置
  phenologyCorrections: {
    "overwinter": { melanose: 0.5, greasy_spot: 0.5, canker: 0.8, septoria: 0.6, fungal_generic: 0.7, bacterial: 0.8, viral: 1.0, fruit_fly: 0.6, stem_puncture_rot: 0.7, cracking_water_imbalance: 0.8, sunburn: 0.6, calcium_deficiency: 1.0, ethylene_induced_drop: 1.0, HLB_physiology: 1.2 },
    "budding": { melanose: 0.8, greasy_spot: 0.8, canker: 1.0, septoria: 0.9, fungal_generic: 0.9, bacterial: 1.0, viral: 0.8, fruit_fly: 0.8, stem_puncture_rot: 0.9, cracking_water_imbalance: 1.0, sunburn: 0.8, calcium_deficiency: 1.0, ethylene_induced_drop: 0.9, HLB_physiology: 0.9 },
    "budding_flowering": { melanose: 0.6, greasy_spot: 0.6, canker: 1.1, septoria: 0.8, fungal_generic: 0.8, bacterial: 1.1, viral: 0.8, fruit_fly: 0.9, stem_puncture_rot: 0.8, cracking_water_imbalance: 1.0, sunburn: 0.8, calcium_deficiency: 1.0, ethylene_induced_drop: 1.0, HLB_physiology: 0.8 },
    "flowering_fruit_drop": { melanose: 0.9, greasy_spot: 0.9, canker: 1.0, septoria: 0.9, fungal_generic: 1.0, bacterial: 1.0, viral: 0.9, fruit_fly: 0.8, stem_puncture_rot: 1.0, cracking_water_imbalance: 1.0, sunburn: 0.7, calcium_deficiency: 1.0, ethylene_induced_drop: 1.0, HLB_physiology: 1.0 },
    "fruit_drop_summer_rain": { melanose: 1.3, greasy_spot: 1.5, canker: 1.0, septoria: 1.2, fungal_generic: 1.3, bacterial: 1.2, viral: 1.0, fruit_fly: 1.0, stem_puncture_rot: 1.3, cracking_water_imbalance: 0.9, sunburn: 1.0, calcium_deficiency: 1.0, ethylene_induced_drop: 1.0, HLB_physiology: 1.1 },
    "summer_rain": { melanose: 1.6, greasy_spot: 1.7, canker: 1.0, septoria: 1.4, fungal_generic: 1.5, bacterial: 1.3, viral: 1.0, fruit_fly: 1.0, stem_puncture_rot: 1.6, cracking_water_imbalance: 0.8, sunburn: 0.8, calcium_deficiency: 1.0, ethylene_induced_drop: 1.0, HLB_physiology: 1.2 },
    "flower_induction": { melanose: 0.7, greasy_spot: 0.7, canker: 1.0, septoria: 0.8, fungal_generic: 0.8, bacterial: 1.0, viral: 1.4, fruit_fly: 0.9, stem_puncture_rot: 0.7, cracking_water_imbalance: 1.0, sunburn: 0.9, calcium_deficiency: 1.0, ethylene_induced_drop: 1.0, HLB_physiology: 1.0 },
    "autumn_flush": { melanose: 0.7, greasy_spot: 0.7, canker: 1.0, septoria: 0.8, fungal_generic: 0.8, bacterial: 1.0, viral: 1.7, fruit_fly: 1.0, stem_puncture_rot: 0.7, cracking_water_imbalance: 1.0, sunburn: 1.1, calcium_deficiency: 1.0, ethylene_induced_drop: 1.0, HLB_physiology: 1.0 },
    "fruit_expansion": { melanose: 1.4, greasy_spot: 0.9, canker: 1.0, septoria: 1.0, fungal_generic: 1.1, bacterial: 1.0, viral: 0.9, fruit_fly: 0.9, stem_puncture_rot: 1.0, cracking_water_imbalance: 1.0, sunburn: 2.1, calcium_deficiency: 1.0, ethylene_induced_drop: 0.8, HLB_physiology: 0.8 },
    "fruit_expansion_critical": { melanose: 1.6, greasy_spot: 1.0, canker: 1.0, septoria: 1.0, fungal_generic: 1.2, bacterial: 1.0, viral: 0.9, fruit_fly: 1.0, stem_puncture_rot: 1.0, cracking_water_imbalance: 1.0, sunburn: 2.3, calcium_deficiency: 1.0, ethylene_induced_drop: 0.6, HLB_physiology: 0.6 }
  },
  
  // 判定阈值
  thresholdRatio: 1.3,
  
  // 优先证据规则
  priorityRules: [
    {
      name: "fruit_fly_strong",
      condition: (data) => data.fruit?.visible_holes_or_larvae || data.fruit?.symptoms?.includes("oviposition_punctures"),
      result: { type: "pathogen", category: "fruit_fly", label: "虫害：果蝇蛀果", explanation: "果面可见产卵孔或幼虫，确定为果蝇危害。建议立即诱杀并销毁受害果实。" }
    },
    {
      name: "canker_strong",
      condition: (data) => data.fruit?.symptoms?.includes("surface_spots_pits") && data.recent_events?.includes("ev_rain"),
      result: { type: "pathogen", category: "canker", label: "病害：柑橘溃疡病", explanation: "典型canaker症状+雨水传播模式。建议隔离并通报检疫部门。" }
    },
    {
      name: "HLB_strong",
      condition: (data) => data.fruit?.symptoms?.includes("color_inversion_green_when_ripen") && data.fruit?.symptoms?.includes("small_lopsided"),
      result: { type: "physio", category: "HLB_physiology", label: "疑似：黄龙病(HLB)", explanation: "果小、畸形、成熟期返青是HLB典型症状。建议立即采样送检并隔离病树。" }
    }
  ]
};