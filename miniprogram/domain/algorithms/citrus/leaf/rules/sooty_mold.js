module.exports = function ruleSootyMold(ctx) {
  const answers = (ctx && ctx.answers) ? ctx.answers : {};
  const symptoms = Array.isArray(answers.symptoms) ? answers.symptoms : [];

  const hit = symptoms.indexOf('honeydew') >= 0;
  if (!hit) return null;

  const insectsVisible = answers.insects_visible;

  if (insectsVisible === undefined) {
    return {
      code: 'LEAF_SOOTY_MOLD',
      score: 60,
      evidence: ['选择了“叶片煤污/黏腻（蜜露）”'],
      suggestions: ['先控蜜露源头（蚜虫/粉虱/介壳），再清洁煤污。'],
      needs: [{ key: 'insects_visible', questionId: 'Q_INSECTS_VISIBLE', priority: 90 }]
    };
  }

  return {
    code: 'LEAF_SOOTY_MOLD',
    score: insectsVisible === true ? 95 : 75,
    evidence: insectsVisible === true ? ['煤污 + 可见害虫'] : ['煤污但未见明显害虫'],
    suggestions: ['建议复查叶背/嫩梢；配合通风透光与虫害管理。'],
    needs: []
  };
};
