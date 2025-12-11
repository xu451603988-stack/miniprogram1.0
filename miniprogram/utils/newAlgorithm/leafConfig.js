// miniprogram/utils/newAlgorithm/leafConfig.js
// 柑橘叶片微观权重表（精修版）

module.exports = {
  version: "2.1.0",
  
  // 特征权重矩阵
  // 结构: { 特征Key: { 营养元素分: {}, 病虫害分: {}, 生理分: {} } }
  features: {
    // === 1. 叶龄特征 ===
    leaf_age_young: {
      nutrition: { Fe: 2, Zn: 2, Mn: 1, Cu: 1 }, // 缺铁锌锰多发于新叶
      pathogen: { leaf_miner: 3, aphid: 3, thrips: 2 } // 潜叶蛾/蚜虫爱吃嫩叶
    },
    leaf_age_old: {
      nutrition: { Mg: 3, N: 2, K: 1, B: 1 }, // 缺镁/氮多发于老叶
      pathogen: { red_spider: 2, anthracnose: 2, greasy_spot: 2 } // 红蜘蛛/炭疽/脂点黄斑病多在老叶
    },

    // === 2. 黄化特征 ===
    // 缺铁：新叶，叶脉绿，肉黄（白化）
    interveinal_chlorosis: { 
      nutrition: { Fe: 5, Zn: 4, Mn: 3, Mg: 2 } 
    },
    // 缺镁：老叶，倒V字
    inverted_v_yellow: {
      nutrition: { Mg: 10 } // 强特征，直接指向缺镁
    },
    // 缺氮：全叶均匀黄，老叶先黄
    uniform_yellow: {
      nutrition: { N: 6, S: 2 },
      pathogen: { root_rot: 3 } // 根腐也会导致全叶黄
    },
    // 缺硼：脉肿，发黄
    vein_chlorosis: {
      nutrition: { B: 5 },
      pathogen: { viral: 2 } // 衰退病等病毒也可能叶脉黄
    },

    // === 3. 斑点与形态 ===
    // 潜叶蛾（鬼画符）
    leaf_miner_trails: {
      pathogen: { leaf_miner: 15, canker: 5 } // 伤口容易诱发溃疡
    },
    // 红蜘蛛（灰白点）
    red_spider_symptoms: {
      pathogen: { red_spider: 10 }
    },
    // 煤污病
    sooty_mold: {
      pathogen: { sooty_mold: 10, aphid: 5, scale_insect: 5, whitefly: 5 } // 煤污通常是蚜虫/介壳虫/粉虱分泌蜜露引起的
    },
    // 卷叶
    leaf_curl: {
      pathogen: { aphid: 5, viral: 2 },
      physio: { drought: 3 } // 干旱卷叶
    },
    // 溃疡病/炭疽病（通用斑点）
    local_spots_lesions: {
      pathogen: { canker: 4, anthracnose: 4, greasy_spot: 3 }
    },
    // 叶尖焦枯
    tip_burn: {
      physio: { fertilizer_burn: 6, salt_stress: 4 }, // 肥害/盐害
      nutrition: { K: 2 } // 极度缺钾
    },

    // === 4. 近期事件 ===
    ev_new_shoot: {
      pathogen: { leaf_miner: 5, aphid: 5, psyllid: 5 } // 梢期防虫关键
    },
    ev_rain: {
      pathogen: { canker: 3, anthracnose: 3, greasy_spot: 3 } // 雨水传播真菌/细菌
    },
    ev_heavy_n: {
      nutrition: { N: -2 }, // 刚施肥排除缺氮
      physio: { fertilizer_burn: 5 } // 怀疑肥害
    }
  },
  
  // 物候期修正系数 (月份 -> 权重系数)
  phenologyCorrections: {
    "budding": { // 萌芽期 (2-3月)
      aphid: 1.5, red_spider: 1.2, N: 1.2
    },
    "summer_rain": { // 夏梢/雨季 (5-7月)
      canker: 1.5, anthracnose: 1.3, leaf_miner: 1.5
    },
    "autumn_flush": { // 秋梢期 (8-10月)
      leaf_miner: 1.8, red_spider: 1.5, dry_stress: 1.2
    },
    "overwinter": { // 越冬 (11-1月)
      red_spider: 1.2, frost_damage: 2.0, Mg: 1.3 // 冬季容易缺镁
    }
  }
};