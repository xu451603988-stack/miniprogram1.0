module.exports = function ruleFruit(ctx) {
  const answers = (ctx && ctx.answers) ? ctx.answers : {};
  const symptoms = Array.isArray(answers.symptoms) ? answers.symptoms : [];

  const hitSpots = symptoms.indexOf('fruit_spots') >= 0;
  const hitCrack = symptoms.indexOf('fruit_cracking') >= 0;

  if (!hitSpots && !hitCrack) return null;

  const needs = [];
  const evidence = [];
  const suggestions = [];

  if (hitSpots) {
    evidence.push('选择了“果面斑点/黑点/锈斑”');
    if (answers.fruit_spots_type === undefined) {
      needs.push({ key: 'fruit_spots_type', questionId: 'Q_FRUIT_SPOTS_TYPE', priority: 85 });
    }
    suggestions.push('补拍果面近照，关注是否凹陷扩大或仅表面锈斑。');
  }

  if (hitCrack) {
    evidence.push('选择了“裂果/开裂”');
    if (answers.fruit_crack_pattern === undefined) {
      needs.push({ key: 'fruit_crack_pattern', questionId: 'Q_FRUIT_CRACK_PATTERN', priority: 80 });
    }
    suggestions.push('裂果常与水分波动有关：雨后突涨/灌溉波动/钙镁不足。');
  }

  return {
    code: hitSpots ? 'FRUIT_SPOTS' : 'FRUIT_CRACKING',
    score: 70,
    evidence,
    suggestions,
    needs
  };
};
