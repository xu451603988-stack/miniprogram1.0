module.exports = function ruleYellowingNew(ctx) {
  const { answers = {} } = ctx;

  // 先约定一个 key：leaf_yellowing_new = true/false
  if (!answers.leaf_yellowing_new) return null;

  return {
    code: "LEAF_YELLOWING_NEW",
    score: 20,
    evidence: ["出现新叶黄化"],
    tags: ["yellowing", "new_leaf"],
    suggestions: ["先确认是脉间黄还是整叶黄，再判断缺素还是吸收障碍"]
  };
};
