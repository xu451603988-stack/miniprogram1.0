module.exports = function ruleLeafSpots(ctx) {
  const answers = (ctx && ctx.answers) ? ctx.answers : {};
  const symptoms = Array.isArray(answers.symptoms) ? answers.symptoms : [];

  const hit = symptoms.indexOf('leaf_spots') >= 0;
  if (!hit) return null;

  const shape = answers.spots_shape;

  if (shape === undefined) {
    return {
      code: 'LEAF_SPOTS',
      score: 55,
      evidence: ['选择了“叶片斑点/病斑”'],
      suggestions: ['补拍斑点近照 + 叶背，雨后是否加重。'],
      needs: [{ key: 'spots_shape', questionId: 'Q_SPOTS_SHAPE', priority: 80 }]
    };
  }

  // ✅ 兼容新枚举
  const fungalLike = (shape === 'round_brown' || shape === 'scab');
  const bacterialLike = (shape === 'water_soaked');
  const tiny = (shape === 'tiny_black_dense');

  let score = 75;
  let evidence = '已补充斑点形态：' + String(shape);

  if (fungalLike) { score = 92; evidence = '圆形褐斑/结痂，更偏病害型'; }
  if (bacterialLike) { score = 90; evidence = '水渍状扩展，更偏细菌/雨后加重型'; }
  if (tiny) { score = 85; evidence = '小黑点密集，需结合叶背/雨后变化判断'; }
  if (shape === 'unknown') { score = 72; evidence = '斑点形态不确定，建议补拍近照'; }

  return {
    code: 'LEAF_SPOTS',
    score,
    evidence: [evidence],
    suggestions: ['注意通风、雨后预防、必要时做病害针对性处理。'],
    needs: []
  };
};
