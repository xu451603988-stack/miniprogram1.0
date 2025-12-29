module.exports = function ruleLeafYellowing(ctx) {
  const answers = (ctx && ctx.answers) ? ctx.answers : {};
  const symptoms = Array.isArray(answers.symptoms) ? answers.symptoms : [];

  const hit = symptoms.indexOf('leaf_yellowing') >= 0;
  if (!hit) return null;

  const stage = answers.yellow_stage;

  if (stage === undefined) {
    return {
      code: 'LEAF_YELLOWING',
      score: 50,
      evidence: ['选择了“叶片黄化”'],
      suggestions: ['新叶黄更偏缺铁/缺锌或根吸收障碍；老叶黄更偏缺镁/氮钾等。'],
      needs: [{ key: 'yellow_stage', questionId: 'Q_YELLOW_STAGE', priority: 70 }]
    };
  }

  return {
    code: 'LEAF_YELLOWING',
    score: stage === 'new_leaf' ? 80 : 70,
    evidence: ['已补充黄化阶段：' + String(stage)],
    suggestions: ['建议结合土壤/施肥/排水情况，必要时做叶片/土壤检测。'],
    needs: []
  };
};
