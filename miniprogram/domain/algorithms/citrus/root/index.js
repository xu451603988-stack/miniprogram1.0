const rootRot = require('./rules/root_rot');

module.exports = function runRoot(ctx) {
  const candidates = [];
  const r = rootRot(ctx);
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
