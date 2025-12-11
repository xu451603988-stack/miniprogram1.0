// miniprogram/utils/newAlgorithm/fruitConfig.js
// 柑橘果实微观权重表（精修版）

module.exports = {
  version: "2.1.0",
  
  features: {
    // === 1. 位置特征 ===
    position_outer: { // 外围果
      physio: { sunburn: 5, wind_scar: 3 } // 容易日灼、风疤
    },
    position_inner: { // 内膛果
      nutrition: { color_pale: 2 } // 容易着色不良
    },
    position_lower: { // 下部果
      pathogen: { brown_rot: 5, snail: 3 } // 容易得疫菌褐腐（泥土飞溅）、蜗牛
    },

    // === 2. 果面症状 ===
    // 溃疡病：火山口状
    canker_spots: {
      pathogen: { canker: 15 } // 铁证
    },
    // 砂皮病（黑点病）
    melanose_spots: {
      pathogen: { melanose: 10 }
    },
    // 蓟马（银白圈）
    thrips_ring: {
      pathogen: { thrips: 12 }
    },
    // 日灼
    sunburn_patch: {
      physio: { sunburn: 12 }
    },
    // 裂果
    cracking: {
      physio: { cracking: 10, Ca: 3 } // 裂果常与缺钙/水分波动有关
    },
    // 实蝇/蛆柑
    maggot_rot: {
      pathogen: { fruit_fly: 15 }
    },
    // 小果/畸形
    small_deformed: {
      nutrition: { B: 3, Zn: 2 }, // 缺硼缺锌
      pathogen: { hlb: 2 } // 疑似黄龙病(需谨慎报)
    },

    // === 3. 落果情况 ===
    drop_severe: {
      pathogen: { anthracnose: 3, brown_rot: 3 },
      physio: { physiological_drop: 5 }
    },

    // === 4. 环境事件 ===
    ev_drought_rain: { // 久旱逢雨
      physio: { cracking: 8 } // 极易裂果
    },
    ev_rain: {
      pathogen: { melanose: 3, canker: 3, brown_rot: 4 }
    },
    ev_hot: {
      physio: { sunburn: 5 }
    }
  },
  
  // 物候期修正
  phenologyCorrections: {
    "flowering_fruit_drop": { // 谢花幼果期
      thrips: 1.5, scab: 1.5, physiological_drop: 1.2
    },
    "fruit_expansion": { // 膨大期
      sunburn: 1.5, cracking: 1.5, canker: 1.2
    },
    "fruit_drop_summer_rain": { // 梅雨季
      melanose: 1.5, brown_rot: 1.2
    },
    "autumn_flush": { // 转色前
      fruit_fly: 1.5, red_spider: 1.2
    }
  }
};