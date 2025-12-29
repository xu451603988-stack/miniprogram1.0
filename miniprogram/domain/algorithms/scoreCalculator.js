/**
 * scoreCalculator.js
 * --------------------------------------------------
 * A 主单个 code 的分数计算器
 */

const evidenceBuilder = require('./evidenceBuilder');

/**
 * @param {Object} param
 * @param {String} param.code
 * @param {Object} param.rule
 * @param {Object} param.answers
 */
function calculate({ code, rule, answers }) {
  if (!rule) return null;

  let score = 0;
  const evidence = [];
  const missingKeys = [];

  // ---------- base ----------
  if (rule.base) {
    score += rule.base;
    evidence.push(
      evidenceBuilder.base(code, rule.base)
    );
  }

  // ---------- strong signals ----------
  if (Array.isArray(rule.strong)) {
    rule.strong.forEach(item => {
      const val = answers[item.key];
      if (val === undefined || val === null) {
        missingKeys.push(item.key);
        return;
      }
      if (item.values?.includes(val)) {
        score += item.score;
        evidence.push(
          evidenceBuilder.strong(code, item, val)
        );
      }
    });
  }

  // ---------- weak signals ----------
  if (Array.isArray(rule.weak)) {
    rule.weak.forEach(item => {
      const val = answers[item.key];
      if (val === undefined || val === null) return;
      if (item.values?.includes(val)) {
        score += item.score;
        evidence.push(
          evidenceBuilder.weak(code, item, val)
        );
      }
    });
  }

  // ---------- penalty ----------
  if (Array.isArray(rule.penalty)) {
    rule.penalty.forEach(item => {
      const val = answers[item.key];
      if (val === undefined || val === null) return;
      if (item.values?.includes(val)) {
        score -= item.score;
        evidence.push(
          evidenceBuilder.penalty(code, item, val)
        );
      }
    });
  }

  // ---------- score cap（信息不足） ----------
  let scoreCap = null;
  if (missingKeys.length && rule.scoreCap) {
    scoreCap = rule.scoreCap;
    if (score > scoreCap) {
      score = scoreCap;
      evidence.push(
        evidenceBuilder.cap(code, scoreCap, missingKeys)
      );
    }
  }

  // ---------- clamp ----------
  score = Math.max(0, Math.min(1, score));

  return {
    code,
    score,
    evidence,
    meta: {
      missingKeys,
      scoreCap,
    },
  };
}

module.exports = {
  calculate,
};
