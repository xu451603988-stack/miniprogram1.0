// miniprogram/domain/algorithms/engine/helpers.js

function pushUnique(arr, item) {
  if (!item) return;
  if (arr.indexOf(item) < 0) arr.push(item);
}

function sortByScoreDesc(list) {
  return (list || []).slice().sort(function (a, b) {
    return (Number(b.score) || 0) - (Number(a.score) || 0);
  });
}

function calcConfidence(best, second) {
  var s1 = best ? (Number(best.score) || 0) : 0;
  var s2 = second ? (Number(second.score) || 0) : 0;
  if (s1 <= 0) return 0.3;
  var gap = (s1 - s2) / Math.max(s1, 1);
  var conf = 0.5 + Math.max(0, Math.min(1, gap)) * 0.45; // 0.50~0.95
  return Math.max(0.1, Math.min(0.99, conf));
}

module.exports = {
  pushUnique: pushUnique,
  sortByScoreDesc: sortByScoreDesc,
  calcConfidence: calcConfidence
};

