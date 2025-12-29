/**
 * sampleAnswers.js
 * --------------------------------------------------
 * 算法调试 / 回归测试用 answers
 *
 * 每一组 case 都代表一个「典型农户场景」
 */

module.exports = {
  cases: [

    // ===== Case 1：典型煤污病 =====
    {
      name: 'LEAF_SOOTY_MOLD_典型',
      expectPrimary: 'LEAF_SOOTY_MOLD',
      expectRiskTags: ['worm_vector', 'damp_heat'],
      answers: {
        crop: 'citrus',
        month: 7,
        season: 'summer',
        positions: ['leaf'],
        humidity: 'high',

        insects_visible: 'yes',
        leaf_surface: 'sticky_black',

        soil_waterlog: 'no'
      }
    },

    // ===== Case 2：叶斑病 =====
    {
      name: 'LEAF_SPOTS_典型',
      expectPrimary: 'LEAF_SPOTS',
      expectRiskTags: ['damp_heat'],
      answers: {
        crop: 'citrus',
        month: 6,
        season: 'summer',
        positions: ['leaf'],
        humidity: 'high',

        insects_visible: 'no',
        leaf_spots_type: 'ring_spot',

        soil_waterlog: 'no'
      }
    },

    // ===== Case 3：缺素性黄化 =====
    {
      name: 'LEAF_YELLOWING_缺素',
      expectPrimary: 'LEAF_YELLOWING',
      expectRiskTags: ['nutrition_imbalance'],
      answers: {
        crop: 'citrus',
        month: 5,
        season: 'spring',
        positions: ['leaf'],

        insects_visible: 'no',
        yellow_stage: 'new_leaf',
        vein_color: 'green',

        soil_fertility: 'low',
        soil_waterlog: 'no'
      }
    },

    // ===== Case 4：裂果（水分波动） =====
    {
      name: 'FRUIT_CRACKING_水分波动',
      expectPrimary: 'FRUIT_CRACKING',
      expectRiskTags: ['water_fluctuation'],
      answers: {
        crop: 'citrus',
        month: 8,
        season: 'summer',
        positions: ['fruit'],

        fruit_crack_pattern: 'radial',
        irrigation_change: 'sudden',

        insects_visible: 'no',
        soil_waterlog: 'no'
      }
    },

    // ===== Case 5：根腐风险（积水） =====
    {
      name: 'ROOT_ROT_RISK_积水',
      expectPrimary: 'ROOT_ROT_RISK',
      expectRiskTags: ['waterlogging'],
      answers: {
        crop: 'citrus',
        month: 7,
        season: 'summer',
        positions: ['root'],

        soil_waterlog: 'yes',
        root_smell: 'bad',

        insects_visible: 'no'
      }
    }
  ]
};
