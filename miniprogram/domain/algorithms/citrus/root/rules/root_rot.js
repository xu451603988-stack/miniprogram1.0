module.exports = function ruleRootRot(ctx) {
  const answers = (ctx && ctx.answers) ? ctx.answers : {};
  const symptoms = Array.isArray(answers.symptoms) ? answers.symptoms : [];

  const hitRot = symptoms.indexOf('root_rot') >= 0;
  const hitWaterlog = symptoms.indexOf('soil_waterlog_smell') >= 0;

  if (!hitRot && !hitWaterlog) return null;

  const needs = [];
  const evidence = [];
  const suggestions = [];

  if (hitRot) evidence.push('选择了“疑似烂根/根腐”');
  if (hitWaterlog) evidence.push('选择了“土壤臭味/长期积水”');

  if (answers.soil_waterlog === undefined) {
    needs.push({ key: 'soil_waterlog', questionId: 'Q_SOIL_WATERLOG', priority: 92 });
  } else {
    evidence.push('已补充排水情况：' + String(answers.soil_waterlog));
  }

  suggestions.push('根系问题优先处理“水”：先排水通气，再谈药/肥。');
  suggestions.push('建议补拍：树冠整体 + 根颈部 + 土表湿度（雨后/灌后）。');

  return {
    code: 'ROOT_ROT_RISK',
    score: 80,
    evidence,
    suggestions,
    needs
  };
};
