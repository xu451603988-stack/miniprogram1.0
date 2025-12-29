const sooty = require('./rules/sooty_mold');
const spots = require('./rules/spots');
const yellowing = require('./rules/yellowing');

module.exports = function runLeaf(ctx) {
  const rules = [sooty, spots, yellowing];
  const candidates = [];

  rules.forEach(fn => {
    const r = fn(ctx);
    if (!r) return;
    candidates.push({
      code: r.code,
      score: r.score || 0,
      evidence: r.evidence || [],
      suggestions: r.suggestions || [],
      needs: r.needs || []
    });
  });

  return { candidates };
};
