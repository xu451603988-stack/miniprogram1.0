/**
 * 老叶脉间黄 规则（规则驱动版）
 */

module.exports = function ruleYellowOldInterveinal(ctx = {}) {
  const answers = ctx.answers || {};
  const symptoms = answers.symptoms || [];

  const hit = symptoms.includes('leaf_yellow_old_interveinal');
  if (!hit) {
    return {
      code: 'LEAF_YELLOW_OLD_INTERVEINAL',
      hit: false,
      score: 0,
      evidence: [],
      needs: []
    };
  }

  const distribution = answers.yellow_distribution;

  // 缺“发生范围”
  if (distribution === undefined) {
    return {
      code: 'LEAF_YELLOW_OLD_INTERVEINAL',
      hit: true,
      score: 50,
      evidence: ['出现老叶脉间黄'],
      needs: [
        {
          key: 'yellow_distribution',
          questionId: 'Q_YELLOW_DISTRIBUTION',
          priority: 8
        }
      ]
    };
  }

  // 信息完整
  return {
    code: 'LEAF_YELLOW_OLD_INTERVEINAL',
    hit: true,
    score: distribution === 'whole_tree' ? 90 : 75,
    evidence: [
      '老叶脉间黄',
      distribution === 'whole_tree'
        ? '整株发生，偏向养分/根系问题'
        : '局部发生，需警惕根区或土壤差异'
    ],
    needs: []
  };
};
