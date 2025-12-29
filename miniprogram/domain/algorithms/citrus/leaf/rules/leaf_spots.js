/**
 * 叶片斑点 / 病斑 规则（规则驱动版）
 */

module.exports = function ruleLeafSpots(ctx = {}) {
  const answers = ctx.answers || {};
  const symptoms = answers.symptoms || [];

  const hit = symptoms.includes('leaf_spots');
  if (!hit) {
    return {
      code: 'LEAF_SPOTS',
      hit: false,
      score: 0,
      evidence: [],
      needs: []
    };
  }

  const shape = answers.spots_shape;

  // 缺“斑点形态”
  if (shape === undefined) {
    return {
      code: 'LEAF_SPOTS',
      hit: true,
      score: 55,
      evidence: ['叶片出现斑点/病斑'],
      needs: [
        {
          key: 'spots_shape',
          questionId: 'Q_SPOTS_SHAPE',
          priority: 9
        }
      ]
    };
  }

  return {
    code: 'LEAF_SPOTS',
    hit: true,
    score: shape === 'round_with_halo' ? 92 : 78,
    evidence: [
      '叶片斑点',
      shape === 'round_with_halo'
        ? '圆形带晕圈，偏病原性病害'
        : '形态不规则，更像逆境或生理斑'
    ],
    needs: []
  };
};
