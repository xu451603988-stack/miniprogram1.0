// miniprogram/domain/algorithms/engine/runRules.js
var helpers = require('./helpers');

function runRules(ctx, rules) {
  var candidates = [];
  for (var i = 0; i < (rules || []).length; i++) {
    var rule = rules[i];
    try {
      var out = rule(ctx);
      if (out && (Number(out.score) || 0) > 0) candidates.push(out);
    } catch (e) {
      // 单条规则异常不影响整体
    }
  }

  var sorted = helpers.sortByScoreDesc(candidates);
  var best = sorted[0] || null;
  var second = sorted[1] || null;

  return {
    candidates: sorted,
    best: best,
    confidence: helpers.calcConfidence(best, second)
  };
}

module.exports = {
  runRules: runRules
};
