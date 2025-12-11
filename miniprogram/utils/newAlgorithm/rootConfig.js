// miniprogram/utils/newAlgorithm/rootConfig.js
// 柑橘根系微观权重表

module.exports = {
  version: "2.1.0",
  
  features: {
    // === 1. 土壤质地 ===
    soil_clay_hard: {
      physio: { soil_compaction: 8, root_hypoxia: 6 } // 板结->缺氧
    },
    soil_salty: {
      physio: { salt_stress: 10 } // 盐害
    },
    
    // === 2. 干湿情况 ===
    waterlogged: {
      pathogen: { root_rot_fungal: 5 }, // 积水易诱发疫霉根腐
      physio: { root_hypoxia: 10 } // 严重缺氧
    },
    dry_crack: {
      physio: { drought_stress: 8 }
    },

    // === 3. 根系症状（核心） ===
    // 沤根/根腐：湿、烂、臭
    root_rot_smell: {
      pathogen: { root_rot_fungal: 10 },
      physio: { root_hypoxia: 5 }
    },
    // 肥害：干、黑、脆
    root_burn_dry: {
      physio: { fertilizer_burn: 12 }
    },
    // 线虫：根结
    root_knots: {
      pathogen: { nematodes: 20 } // 铁证
    },
    // 红根/僵苗
    root_red_stagnant: {
      physio: { soil_compaction: 5, aging_tree: 3 }
    },
    // 无白根
    few_white_roots: {
      physio: { weak_vigor: 6 }
    },

    // === 4. 近期事件 ===
    ev_heavy_fertilizer: {
      physio: { fertilizer_burn: 6 }
    },
    ev_herbicide: {
      physio: { herbicide_damage: 10 } // 除草剂药害
    },
    ev_flood: {
      pathogen: { root_rot_fungal: 4 }
    }
  },
  
  // 物候修正
  phenologyCorrections: {
    "summer_rain": { // 梅雨季/夏季暴雨
      root_rot_fungal: 1.5, root_hypoxia: 1.5
    },
    "autumn_flush": { // 秋梢期（根系生长高峰）
      nematodes: 1.3, weak_vigor: 1.2
    },
    "overwinter": { // 冬季
      drought_stress: 1.2 // 冬旱
    }
  }
};