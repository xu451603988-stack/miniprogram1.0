module.exports = function ruleBranchGumming(ctx) {
  const answers = (ctx && ctx.answers) ? ctx.answers : {};
  const symptoms = Array.isArray(answers.symptoms) ? answers.symptoms : [];

  const hit = symptoms.indexOf('branch_gumming') >= 0;
  if (!hit) return null;

  const needs = [];
  const evidence = ['选择了“枝条流胶/渗胶”'];
  const suggestions = ['补拍流胶点近照 + 周边树皮是否开裂/溃疡/虫孔。'];

  if (answers.branch_gum_color === undefined) {
    needs.push({ key: 'branch_gum_color', questionId: 'Q_BRANCH_GUM_COLOR', priority: 88 });
  } else {
    evidence.push('已补充流胶颜色：' + String(answers.branch_gum_color));
  }

  return {
    code: 'BRANCH_GUMMING',
    score: 75,
    evidence,
    suggestions,
    needs
  };
};
