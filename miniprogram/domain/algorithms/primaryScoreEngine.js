/**
 * primaryScoreEngine.js
 * --------------------------------------------------
 * A 主诊断打分引擎
 */

const scoreCalculator = require('./scoreCalculator');
const evidenceBuilder = require('./evidenceBuilder');

// A 主打分表（由 YAML 转 JS）
const PRIMARY_SCORE_TABLE = require('../config/ab_primary_score.js');

/**
 * @param {Object} param
 * @param {Object} param.answers
 * @param {Object} param.context
 */
function run({ answers = {}, context = {} }) {
  const candidates = [];
  const globalEvidence = [];

  const missingKeys = [];
  let scoreCap = null;

  // 遍历每一个诊断 code
  Object.keys(PRIMARY_SCORE_TABLE).forEach(code => {
    const rule = PRIMARY_SCORE_TABLE[code];

    const result = scoreCalculator.calculate({
      code,
      rule,
      answers,
    });

    if (!result) return;

    const { score, evidence, meta } = result;

    if (Array.isArray(evidence)) {
      globalEvidence.push(...evidence);
    }

    if (meta?.missingKeys?.length) {
      missingKeys.push(...meta.missingKeys);
      scoreCap = Math.min(scoreCap ?? 1, meta.scoreCap ?? 1);
    }

    candidates.push({
      code,
      score,
      evidence,
    });
  });

  return {
    candidates,
    evidence: globalEvidence,
    meta: {
      scoreCap,
      missingKeys: Array.from(new Set(missingKeys)),
    },
  };
}

module.exports = {
  run,
};
