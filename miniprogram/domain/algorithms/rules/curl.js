module.exports = function ruleLeafCurl(ctx) {
  const { answers = {} } = ctx;
  if (!answers.leaf_curl) return null;

  return {
    code: "LEAF_CURL",
    score: 16,
    evidence: ["叶片出现卷曲/皱缩"],
    tags: ["curl"],
    suggestions: ["进一步确认是否伴随虫害（螨/蚜）、药害或缺素；必要时补拍叶背照片"]
  };
};
