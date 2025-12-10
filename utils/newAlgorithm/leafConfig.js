// miniprogram/utils/newAlgorithm/leafConfig.js
module.exports = {
  version: "2.0.0",
  
  // 特征权重配置
  features: {
    // 叶龄特征
    leaf_age_young: {
      nutrition: { N: 1, P: 0, K: 0, Fe: 2, Zn: 1, Mn: 1, B: 0, Mg: 0 },
      pathogen: { fungal: 0, bacterial: 0, viral: 1, insect: 0, fertilizer_burn: 0, herbicide_phytotoxic: 0, abiotic_water: 0 }
    },
    leaf_age_mature: {
      nutrition: { N: 1, P: 0, K: 1, Fe: 0, Zn: 0, Mn: 0, B: 0, Mg: 0 },
      pathogen: { fungal: 0, bacterial: 0, viral: 0, insect: 0, fertilizer_burn: 0, herbicide_phytotoxic: 0, abiotic_water: 0 }
    },
    leaf_age_old: {
      nutrition: { N: 6, P: 1, K: 2, Fe: 0, Zn: 0, Mn: 0, B: 0, Mg: 1 },
      pathogen: { fungal: 1, bacterial: 0, viral: 0, insect: 0, fertilizer_burn: 0, herbicide_phytotoxic: 0, abiotic_water: 0 }
    },
    
    // 症状特征
    interveinal_chlorosis: {
      nutrition: { N: 2, P: 0, K: 0, Fe: 8, Zn: 4, Mn: 5, B: 1, Mg: 1 },
      pathogen: { fungal: 1, bacterial: 0, viral: 1, insect: 0, fertilizer_burn: 0, herbicide_phytotoxic: 0, abiotic_water: 0 }
    },
    vein_chlorosis: {
      nutrition: { N: 1, P: 0, K: 0, Fe: 6, Zn: 1, Mn: 1, B: 0, Mg: 0 },
      pathogen: { fungal: 0, bacterial: 0, viral: 2, insect: 0, fertilizer_burn: 0, herbicide_phytotoxic: 0, abiotic_water: 0 }
    },
    mottling_variegation: {
      nutrition: { N: 0, P: 0, K: 0, Fe: 1, Zn: 2, Mn: 1, B: 0, Mg: 0 },
      pathogen: { fungal: 0, bacterial: 0, viral: 9, insect: 0, fertilizer_burn: 0, herbicide_phytotoxic: 0, abiotic_water: 0 }
    },
    local_spots_lesions: {
      nutrition: { N: 0, P: 0, K: 0, Fe: 0, Zn: 0, Mn: 0, B: 0, Mg: 0 },
      pathogen: { fungal: 6, bacterial: 5, viral: 0, insect: 0, fertilizer_burn: 0, herbicide_phytotoxic: 0, abiotic_water: 0 }
    },
    water_soaked_spots: {
      nutrition: { N: 0, P: 0, K: 0, Fe: 0, Zn: 0, Mn: 0, B: 0, Mg: 0 },
      pathogen: { fungal: 9, bacterial: 6, viral: 0, insect: 0, fertilizer_burn: 0, herbicide_phytotoxic: 0, abiotic_water: 0 }
    },
    necrotic_margin: {
      nutrition: { N: 1, P: 0, K: 8, Fe: 0, Zn: 0, Mn: 0, B: 1, Mg: 1 },
      pathogen: { fungal: 2, bacterial: 2, viral: 0, insect: 1, fertilizer_burn: 6, herbicide_phytotoxic: 1, abiotic_water: 0 }
    },
    tip_burn: {
      nutrition: { N: 1, P: 0, K: 6, Fe: 0, Zn: 0, Mn: 0, B: 0, Mg: 0 },
      pathogen: { fungal: 1, bacterial: 0, viral: 0, insect: 0, fertilizer_burn: 7, herbicide_phytotoxic: 0, abiotic_water: 0 }
    },
    leaf_curl: {
      nutrition: { N: 0, P: 0, K: 0, Fe: 0, Zn: 1, Mn: 0, B: 1, Mg: 0 },
      pathogen: { fungal: 2, bacterial: 1, viral: 2, insect: 4, fertilizer_burn: 2, herbicide_phytotoxic: 3, abiotic_water: 1 }
    },
    chlorotic_whole_leaf: {
      nutrition: { N: 7, P: 0, K: 1, Fe: 2, Zn: 1, Mn: 0, B: 0, Mg: 1 },
      pathogen: { fungal: 1, bacterial: 0, viral: 0, insect: 0, fertilizer_burn: 0, herbicide_phytotoxic: 0, abiotic_water: 1 }
    },
    honeydew_sooty: {
      nutrition: { N: 0, P: 0, K: 0, Fe: 0, Zn: 0, Mn: 0, B: 0, Mg: 0 },
      pathogen: { fungal: 2, bacterial: 0, viral: 0, insect: 8, fertilizer_burn: 0, herbicide_phytotoxic: 0, abiotic_water: 0 }
    },
    insects_visible: {
      nutrition: { N: 0, P: 0, K: 0, Fe: 0, Zn: 0, Mn: 0, B: 0, Mg: 0 },
      pathogen: { fungal: 1, bacterial: 0, viral: 0, insect: 9, fertilizer_burn: 0, herbicide_phytotoxic: 0, abiotic_water: 0 }
    },
    
    // 事件特征
    acute_onset: {
      nutrition: { N: 0, P: 0, K: 0, Fe: 0, Zn: 0, Mn: 0, B: 0, Mg: 0 },
      pathogen: { fungal: 1, bacterial: 2, viral: 2, insect: 2, fertilizer_burn: 6, herbicide_phytotoxic: 5, abiotic_water: 1 }
    },
    recent_rain: {
      nutrition: { N: 0, P: 0, K: 0, Fe: 0, Zn: 0, Mn: 0, B: 0, Mg: 0 },
      pathogen: { fungal: 4, bacterial: 2, viral: 0, insect: 0, fertilizer_burn: 0, herbicide_phytotoxic: 0, abiotic_water: 3 }
    },
    recent_heavy_n: {
      nutrition: { N: 2, P: 0, K: 0, Fe: 0, Zn: 0, Mn: 0, B: 0, Mg: 0 },
      pathogen: { fungal: 0, bacterial: 0, viral: 0, insect: 0, fertilizer_burn: 9, herbicide_phytotoxic: 0, abiotic_water: 0 }
    },
    recent_spray: {
      nutrition: { N: 0, P: 0, K: 0, Fe: 0, Zn: 0, Mn: 0, B: 0, Mg: 0 },
      pathogen: { fungal: 0, bacterial: 0, viral: 0, insect: 0, fertilizer_burn: 0, herbicide_phytotoxic: 8, abiotic_water: 0 }
    },
    distribution_sectoral: {
      nutrition: { N: 0, P: 0, K: 0, Fe: 0, Zn: 0, Mn: 0, B: 0, Mg: 0 },
      pathogen: { fungal: 0, bacterial: 0, viral: 6, insect: 0, fertilizer_burn: 0, herbicide_phytotoxic: 0, abiotic_water: 0 }
    },
    distribution_uniform: {
      nutrition: { N: 2, P: 0, K: 1, Fe: 1, Zn: 0, Mn: 0, B: 0, Mg: 1 },
      pathogen: { fungal: 0, bacterial: 0, viral: 0, insect: 0, fertilizer_burn: 0, herbicide_phytotoxic: 0, abiotic_water: 0 }
    }
  },
  
  // 物候校正配置
  phenologyCorrections: {
    "overwinter": { N:1.0, P:1.0, K:1.0, Fe:0.5, Zn:0.7, Mn:0.7, B:1.0, Mg:1.0, fungal:0.8, bacterial:0.8, viral:1.0, insect:0.8, fertilizer_burn:1.0, herbicide_phytotoxic:1.0, abiotic_water:1.0 },
    "budding": { N:0.9, P:1.0, K:1.0, Fe:0.8, Zn:0.8, Mn:0.9, B:1.0, Mg:1.0, fungal:1.0, bacterial:1.0, viral:0.8, insect:1.0, fertilizer_burn:1.0, herbicide_phytotoxic:1.0, abiotic_water:1.0 },
    "budding_flowering": { N:0.8, P:1.0, K:1.0, Fe:0.6, Zn:0.7, Mn:0.7, B:1.0, Mg:1.0, fungal:0.9, bacterial:0.9, viral:0.8, insect:1.0, fertilizer_burn:1.2, herbicide_phytotoxic:1.0, abiotic_water:1.0 },
    "flowering_fruit_drop": { N:1.0, P:1.0, K:1.2, Fe:0.9, Zn:0.9, Mn:0.9, B:1.0, Mg:1.0, fungal:1.0, bacterial:1.0, viral:0.9, insect:1.0, fertilizer_burn:1.2, herbicide_phytotoxic:1.0, abiotic_water:1.1 },
    "fruit_drop_summer_rain": { N:1.0, P:1.0, K:1.0, Fe:1.0, Zn:1.0, Mn:1.0, B:1.0, Mg:1.0, fungal:1.4, bacterial:1.2, viral:1.0, insect:1.0, fertilizer_burn:1.0, herbicide_phytotoxic:1.0, abiotic_water:1.3 },
    "summer_rain": { N:1.0, P:1.0, K:1.0, Fe:0.8, Zn:0.8, Mn:0.8, B:1.0, Mg:1.0, fungal:1.7, bacterial:1.3, viral:1.0, insect:1.0, fertilizer_burn:1.0, herbicide_phytotoxic:1.0, abiotic_water:1.5 },
    "flower_induction": { N:0.9, P:1.0, K:1.0, Fe:0.7, Zn:1.2, Mn:1.0, B:1.0, Mg:1.0, fungal:0.8, bacterial:0.8, viral:1.4, insect:1.0, fertilizer_burn:1.0, herbicide_phytotoxic:1.0, abiotic_water:0.9 },
    "autumn_flush": { N:1.0, P:1.0, K:1.0, Fe:1.0, Zn:1.3, Mn:1.2, B:1.0, Mg:1.0, fungal:0.9, bacterial:0.9, viral:1.6, insect:1.2, fertilizer_burn:1.0, herbicide_phytotoxic:1.0, abiotic_water:1.0 },
    "fruit_expansion": { N:1.0, P:1.0, K:1.0, Fe:0.8, Zn:0.8, Mn:0.8, B:1.0, Mg:1.0, fungal:1.2, bacterial:1.0, viral:0.9, insect:1.0, fertilizer_burn:1.0, herbicide_phytotoxic:1.0, abiotic_water:1.0 }
  },
  
  // 判定阈值
  thresholdRatio: 1.2
};