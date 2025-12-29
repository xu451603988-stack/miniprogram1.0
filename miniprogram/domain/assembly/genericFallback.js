// miniprogram/domain/assembly/genericFallback.js

function genericSolution() {
  // 立即处置方案缺失兜底：按规格 6.2 :contentReference[oaicite:16]{index=16}
  return {
    title: '通用处置建议（先做这些）',
    steps: [
      '先排查虫害、积水等明显原因（叶背/根区重点看）',
      '清理明显病叶/病果，减少传染源或继发风险',
      '按说明做一次保护性处理（避免激进用药/过量）',
      '3–5 天复查变化：变轻继续维护；变重建议找农技员'
    ],
    dos: ['小量多次、先保守后加强', '先观察再调整管理措施'],
    donts: ['不要一次性混用多种药肥', '不要在高温强光下做刺激性处理'],
    whenToEscalate: ['连续 3–5 天明显加重', '出现大面积落叶/腐烂/流胶等严重症状']
  };
}

function fallbackRiskMeta(key) {
  // 风险标签缺失兜底：按规格 6.1 :contentReference[oaicite:17]{index=17}
  const shortMap = {
    worm_vector: '害虫传播风险',
    damp_heat: '高温高湿风险',
    nutrition_imbalance: '营养失衡风险',
    water_fluctuation: '水分波动风险',
    waterlogging: '积水渍害风险',
    general_management: '管理与环境风险'
  };

  return {
    label: shortMap[key] || '相关管理风险',
    why: ['该风险可能与环境/管理有关（当前信息有限）'],
    prevent: [
      '保持通风透光、避免积水',
      '水肥小量多次、观察变化再调整'
    ]
  };
}

module.exports = {
  genericSolution,
  fallbackRiskMeta
};
