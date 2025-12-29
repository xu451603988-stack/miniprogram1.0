module.exports = function ruleYellowingOld(ctx) {
  const { answers = {} } = ctx;
  if (!answers.leaf_yellowing_old) return null;

  return {
    code: "LEAF_YELLOWING_OLD",
    score: 18,
    evidence: ["出现老叶黄化"],
    tags: ["yellowing", "old_leaf"],
    suggestions: ["排查缺镁/氮等移动性元素，同时关注根系与水分波动"]
  };
};
