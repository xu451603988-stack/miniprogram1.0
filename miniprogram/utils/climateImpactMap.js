/**
 * climateImpactMap.js
 *
 * 作用：
 * 将【气候标签】 → 转换为【算法权重影响因子】
 *
 * 设计原则：
 * 1. 气候只做“修正”，不做“裁决”
 * 2. 影响是乘法，而不是直接加减
 * 3. 所有因子都有兜底 = 1
 */

const DEFAULT_IMPACT = {
  nutrient: 1,   // 营养相关（缺镁、缺氮、缺钾等）
  root: 1,       // 根系活力 / 土壤环境
  disease: 1,    // 病害风险
  water: 1       // 水分胁迫
};

/**
 * 不同气候区的基础影响
 */
const CLIMATE_ZONE_IMPACT = {
  // 华南湿热（广西、广东、福建、海南等）
  humid_south: {
    nutrient: 1.1,  // 易淋失
    root: 1.15,     // 根系压力大
    disease: 1.15,
    water: 0.95
  },

  // 西南高湿
  southwest_humid: {
    nutrient: 1.05,
    root: 1.2,
    disease: 1.2,
    water: 1
  },

  // 中部亚热带
  central_subtropical: {
    nutrient: 1,
    root: 1,
    disease: 1,
    water: 1
  },

  // 未识别
  unknown: {}
};

/**
 * 水分趋势影响
 */
const WATER_TREND_IMPACT = {
  wet: {
    nutrient: 1.1,
    root: 1.15,
    disease: 1.1
  },
  medium: {},
  dry: {
    water: 1.2,
    nutrient: 0.95
  }
};

/**
 * 风险标签影响（可叠加）
 */
const RISK_TAG_IMPACT = {
  // 根系病害高风险区
  root_disease_high: {
    root: 1.2,
    disease: 1.15
  },

  // 营养淋失高风险区
  nutrient_leaching: {
    nutrient: 1.15
  },

  // 转色困难区（预留）
  color_change_difficult: {
    nutrient: 1.05
  }
};

/**
 * 工具函数：合并影响因子（乘法）
 */
function mergeImpact(base, impact) {
  const result = { ...base };
  Object.keys(impact).forEach(key => {
    result[key] = (result[key] || 1) * impact[key];
  });
  return result;
}

/**
 * 对外主函数
 * @param {Object} climate - globalData.climate
 * @returns {Object} impactFactor
 */
export function getClimateImpactFactor(climate) {
  let impactFactor = { ...DEFAULT_IMPACT };

  if (!climate) {
    return impactFactor;
  }

  // 1️⃣ 气候区影响
  if (climate.climateZone && CLIMATE_ZONE_IMPACT[climate.climateZone]) {
    impactFactor = mergeImpact(
      impactFactor,
      CLIMATE_ZONE_IMPACT[climate.climateZone]
    );
  }

  // 2️⃣ 水分趋势影响
  if (climate.waterTrend && WATER_TREND_IMPACT[climate.waterTrend]) {
    impactFactor = mergeImpact(
      impactFactor,
      WATER_TREND_IMPACT[climate.waterTrend]
    );
  }

  // 3️⃣ 风险标签叠加
  if (Array.isArray(climate.riskTags)) {
    climate.riskTags.forEach(tag => {
      if (RISK_TAG_IMPACT[tag]) {
        impactFactor = mergeImpact(
          impactFactor,
          RISK_TAG_IMPACT[tag]
        );
      }
    });
  }

  return impactFactor;
}
