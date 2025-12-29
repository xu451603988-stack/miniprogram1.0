// miniprogram/domain/dictionary/riskTagDictionary.js
// --------------------------------------------------
// 第5层：风险标签词典（给 riskTagger 用）
// key: riskTagKey -> { label, explain, advice[] }

module.exports = {
  worm_vector: {
    label: '害虫传播风险',
    explain: '害虫活动可能诱发次生病害或传播病原。',
    advice: [
      '定期巡园检查叶背与嫩梢',
      '必要时及时控虫'
    ]
  },

  damp_heat: {
    label: '高温高湿风险',
    explain: '高温高湿环境有利于病害发生。',
    advice: [
      '改善通风透光',
      '雨后及时排湿'
    ]
  },

  nutrition_imbalance: {
    label: '营养失衡风险',
    explain: '缺素或比例失衡会导致生长异常。',
    advice: [
      '测土配方施肥',
      '小量多次补微量元素'
    ]
  },

  water_fluctuation: {
    label: '水分波动风险',
    explain: '忽干忽湿易产生生理应激。',
    advice: [
      '稳水管理',
      '干旱分次补水'
    ]
  },

  waterlogging: {
    label: '积水渍害风险',
    explain: '积水会导致根区缺氧，诱发根腐。',
    advice: [
      '疏通排水',
      '改土增氧'
    ]
  },

  general_management: {
    label: '管理与环境风险',
    explain: '管理与环境变化可能导致症状反复。',
    advice: [
      '先做保守调整并观察',
      '明显加重请农技员到园'
    ]
  }
};
