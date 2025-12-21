/**
 * 柑橘病虫害气象预警规则库 V1.0
 * 逻辑：基于天气预报数组(forecast)进行条件判定
 */
const DiseaseRules = [
  {
    id: 'canker',
    name: '溃疡病',
    icon: '🦠',
    // 触发条件：未来3天内有雨 且 最高温 > 25°C
    condition: (forecast) => {
      const rainDays = forecast.slice(0, 3).filter(d => d.text.includes('雨') && d.maxTemp > 25);
      return rainDays.length > 0;
    },
    historyMatch: ['canker_spots', 'citrus_canker', 'TREE_WEAK'],
    advice: '环境温高湿重，溃疡病传播风险极高。',
    action: '建议：雨前喷施有机铜制剂防护，雨后及时巡检。'
  },
  {
    id: 'red_spider',
    name: '红蜘蛛',
    icon: '🕷️',
    // 触发条件：连续3天最高温 > 28°C 且 无雨
    condition: (forecast) => {
      const dryHotDays = forecast.slice(0, 5).filter(d => d.maxTemp > 28 && !d.text.includes('雨'));
      return dryHotDays.length >= 3;
    },
    historyMatch: ['red_spider_symptoms', 'color_normal'],
    advice: '持续高温干旱将导致红蜘蛛爆发。',
    action: '建议：检查叶背及果实，发现虫口立即进行局部挑治。'
  },
  {
    id: 'anthracnose',
    name: '炭疽病',
    icon: '🍂',
    // 触发条件：未来5天内有3天以上有雨
    condition: (forecast) => {
      const rainDays = forecast.slice(0, 5).filter(d => d.text.includes('雨'));
      return rainDays.length >= 3;
    },
    historyMatch: ['anthracnose_spots', 'uniform_yellow'],
    advice: '连续阴雨易诱发急性炭疽病。',
    action: '建议：清理排灌沟渠，防止果园积水导致根系受损。'
  },
  {
    id: 'heat_stress',
    name: '高温日灼',
    icon: '☀️',
    // 触发条件：最高温 > 35°C
    condition: (forecast) => {
      return forecast.some(d => d.maxTemp > 35);
    },
    historyMatch: ['tip_burn', 'TREE_VIGOROUS'],
    advice: '极端高温可能导致果实及新梢日灼。',
    action: '建议：傍晚或清晨进行滴灌补水，切忌中午浇水。'
  }
];

module.exports = DiseaseRules;