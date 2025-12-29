// miniprogram/domain/dictionary/expertDictionary.js
// --------------------------------------------------
// 第5层：解释库（Why / Explain）
// key: riskTagKey -> { label, explain, why[] }

module.exports = {
  worm_vector: {
    label: '害虫传播风险',
    explain: '刺吸式害虫会分泌蜜露并可能传播病原，容易诱发次生问题。',
    why: [
      '园内害虫活动会增加病害发生概率',
      '蜜露会为霉层/病菌提供条件'
    ]
  },

  damp_heat: {
    label: '高温高湿风险',
    explain: '高温高湿环境有利于多种病害发生和扩散。',
    why: [
      '叶面持水时间长更易感染',
      '通风差会加重扩散'
    ]
  },

  nutrition_imbalance: {
    label: '营养失衡风险',
    explain: '营养供应不足或比例失衡，会导致生长异常和抗性下降。',
    why: [
      '缺素或吸收受阻都可能导致黄化',
      '水肥不稳会加剧问题'
    ]
  },

  water_fluctuation: {
    label: '水分波动风险',
    explain: '水分忽干忽湿会造成生理应激，裂果/根系压力增加。',
    why: [
      '干旱后骤雨或猛灌易裂果',
      '果皮韧性不足更易开裂'
    ]
  },

  waterlogging: {
    label: '积水渍害风险',
    explain: '长期积水会导致根区缺氧，诱发根腐与吸收障碍。',
    why: [
      '根系缺氧后容易发黑腐烂',
      '吸收下降会带来黄化等连锁反应'
    ]
  },

  general_management: {
    label: '管理与环境风险',
    explain: '管理方式与环境变化可能导致症状加重或反复。',
    why: [
      '近期管理/天气变化可能触发症状',
      '建议先做保守调整再观察'
    ]
  }
};
