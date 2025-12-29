const { topNByScore } = require("./helpers");

// 一个很够用的置信度：top1 与 top2 的差距越大越自信
function calcConfidence(top1, top2) {
  const s1 = top1?.score || 0;
  const s2 = top2?.score || 0;
  if (s1 <= 0) return 0;
  // 差距比例
  const gap = (s1 - s2) / Math.max(s1, 1);
  // 映射到 50~95 之间（你可随时调）
  const conf = 50 + Math.round(Math.max(0, Math.min(1, gap)) * 45);
  return Math.max(0, Math.min(100, conf));
}

function mergeCandidates(candidates) {
  const sorted = [...candidates].sort((a, b) => (b.score || 0) - (a.score || 0));
  const best = sorted[0] || null;
  const confidence = best ? calcConfidence(sorted[0], sorted[1]) : 0;
  return { best, confidence, sorted };
}

module.exports = { mergeCandidates };
