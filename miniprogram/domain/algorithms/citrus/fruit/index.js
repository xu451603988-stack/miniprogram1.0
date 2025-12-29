const fruitRule = require('./rules/spots');

module.exports = function runFruit(ctx) {
  const candidates = [];
  const r = fruitRule(ctx);
  if (r) {
    candidates.push({
      code: r.code,
      score: r.score || 0,
      evidence: r.evidence || [],
      suggestions: r.suggestions || [],
      needs: r.needs || []
    });
  }
  return { candidates };
};
