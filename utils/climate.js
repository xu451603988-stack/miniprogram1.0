// utils/climate.js

/**
 * 根据省份映射气候标签（够用版）
 * 后期你可以随时扩展
 */

export function mapProvinceToClimate(province) {
  // 华南 / 西南为主（柑橘友好）
  const humidSouth = ['广西', '广东', '海南', '福建', '云南'];
  const southwest = ['四川', '贵州', '重庆'];
  const central = ['湖南', '湖北', '江西'];

  if (humidSouth.includes(province)) {
    return {
      climateZone: 'humid_south',
      waterTrend: 'wet',
      riskTags: ['root_disease_high', 'nutrient_leaching']
    };
  }

  if (southwest.includes(province)) {
    return {
      climateZone: 'southwest_humid',
      waterTrend: 'wet',
      riskTags: ['root_disease_high']
    };
  }

  if (central.includes(province)) {
    return {
      climateZone: 'central_subtropical',
      waterTrend: 'medium',
      riskTags: []
    };
  }

  // 兜底
  return {
    climateZone: 'unknown',
    waterTrend: 'medium',
    riskTags: []
  };
}
