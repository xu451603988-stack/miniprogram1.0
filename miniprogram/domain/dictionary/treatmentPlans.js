// miniprogram/domain/dictionary/treatmentPlans.js
// --------------------------------------------------
// 第5层：预防建议库（Prevent / Advice）
// key: riskTagKey -> { prevent: [ ... ] }

module.exports = {
  worm_vector: {
    prevent: [
      '定期巡园，重点检查嫩梢与叶背',
      '优先采用综合防治：物理+生物+必要时化学',
      '避免长期单一药剂，注意轮换'
    ]
  },

  damp_heat: {
    prevent: [
      '合理修剪，改善通风透光',
      '雨后及时排湿，减少叶面持水',
      '清园，及时处理病残体'
    ]
  },

  nutrition_imbalance: {
    prevent: [
      '测土配方施肥，避免偏施氮肥',
      '缺素优先小量多次补充微量元素',
      '根区通气差先改土再补肥'
    ]
  },

  water_fluctuation: {
    prevent: [
      '保持灌溉节奏稳定，避免忽干忽湿',
      '干旱期分次补水，不猛灌',
      '注意补钙，提高果皮韧性'
    ]
  },

  waterlogging: {
    prevent: [
      '完善排水系统，雨后及时排水',
      '改土增施有机质，提高通气性',
      '低洼地块考虑起垄或暗管排水'
    ]
  },

  general_management: {
    prevent: [
      '先保守调整管理措施并观察 3–5 天',
      '避免高温强光下喷药/混配',
      '出现明显加重及时请农技员到园'
    ]
  }
};
