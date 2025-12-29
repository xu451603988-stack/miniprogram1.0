const gumming = require('./rules/gumming');

module.exports = function runBranch(ctx) {
  const candidates = [];
  const r = gumming(ctx);
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
