/**
 * miniprogram/domain/algorithms/primaryScoreEngine.js
 * --------------------------------------------------
 * 终极兼容导出：
 * - require(...) 既可以当函数调用：primaryScoreEngine(payload)
 * - 也一定支持：primaryScoreEngine.run(payload)
 *
 * 同时保留：
 * - scoreCalculator 多种导出兼容
 * - scoreCalculator 返回 null/number/对象 都不崩
 * - positions 过滤（选果实不出叶病）
 */

const scoreCalculator = require('./scoreCalculator');
const evidenceBuilder = require('./evidenceBuilder');
const PRIMARY_SCORE_TABLE = require('../config/ab_primary_score.js');

// 诊断 code -> 部位映射（用于 positions 过滤）
const CODE_TO_POSITION = {
  LEAF_YELLOWING: 'leaf',
  LEAF_SPOTS: 'leaf',
  LEAF_SOOTY_MOLD: 'leaf',

  FRUIT_CRACKING: 'fruit',
  FRUIT_SPOTS: 'fruit',

  BRANCH_GUMMING: 'branch',
  ROOT_ROT_RISK: 'root'
};

function filterByPositions(candidates, positions) {
  const pos = Array.isArray(positions) ? positions.filter(Boolean) : [];
  if (pos.length === 0) return candidates;

  const filtered = candidates.filter(c => {
    const p = CODE_TO_POSITION[c.code];
    return p ? pos.includes(p) : false;
  });

  // 过滤后为空就回退，避免“无结果”
  return filtered.length > 0 ? filtered : candidates;
}

// 归一 scoreCalculator 返回
function normalizeScoreResult(ret) {
  if (ret == null) return { score: 0, cap: null, missing: [] };

  if (typeof ret === 'number') {
    return { score: ret, cap: null, missing: [] };
  }

  if (typeof ret === 'object') {
    const score = (typeof ret.score === 'number') ? ret.score : 0;
    const cap = (typeof ret.cap === 'number') ? ret.cap : null;
    const missing = Array.isArray(ret.missing) ? ret.missing : [];
    return { score, cap, missing };
  }

  return { score: 0, cap: null, missing: [] };
}

function calcScore(payload) {
  let ret = null;
  try {
    if (scoreCalculator && typeof scoreCalculator.calc === 'function') {
      ret = scoreCalculator.calc(payload);
    } else if (scoreCalculator && typeof scoreCalculator.run === 'function') {
      ret = scoreCalculator.run(payload);
    } else if (scoreCalculator && typeof scoreCalculator.calculate === 'function') {
      ret = scoreCalculator.calculate(payload);
    } else if (typeof scoreCalculator === 'function') {
      ret = scoreCalculator(payload);
    } else {
      ret = null;
    }
  } catch (e) {
    console.error('[primaryScoreEngine] scoreCalculator failed:', e);
    ret = null;
  }
  return normalizeScoreResult(ret);
}

function buildEvidence(payload) {
  try {
    if (evidenceBuilder && typeof evidenceBuilder.buildEvidence === 'function') {
      return evidenceBuilder.buildEvidence(payload) || [];
    }
    if (evidenceBuilder && typeof evidenceBuilder.build === 'function') {
      return evidenceBuilder.build(payload) || [];
    }
    if (typeof evidenceBuilder === 'function') {
      return evidenceBuilder(payload) || [];
    }
  } catch (e) {
    console.error('[primaryScoreEngine] evidenceBuilder failed:', e);
  }
  return [];
}

// ✅ 真正的 run 实现（diagnosisEngine 会调用它）
function run({ answers = {}, context = {} }) {
  const candidates = [];
  let scoreCap = null;
  const missingKeys = [];

  Object.keys(PRIMARY_SCORE_TABLE).forEach((code) => {
    const conf = PRIMARY_SCORE_TABLE[code] || {};

    const r = calcScore({
      answers,
      strong: conf.strong || [],
      weak: conf.weak || [],
      penalty: conf.penalty || [],
      base: conf.base || 0
    });

    if (r.cap !== null && r.cap !== undefined) scoreCap = r.cap;
    (r.missing || []).forEach(k => missingKeys.push(k));

    const evidence = buildEvidence({
      answers,
      strong: conf.strong || [],
      weak: conf.weak || []
    });

    candidates.push({
      code,
      score: r.score,
      evidence
    });
  });

  const filteredCandidates = filterByPositions(candidates, context.positions);

  return {
    candidates: filteredCandidates,
    evidence: [],
    meta: {
      scoreCap,
      missingKeys: Array.from(new Set(missingKeys))
    }
  };
}

/**
 * ✅ 终极兼容导出：
 * - module.exports 是一个函数（老代码可能直接调用 primaryScoreEngine(...)）
 * - 同时挂载 .run（diagnosisEngine 用 primaryScoreEngine.run(...)）
 */
function exported(payload) {
  return run(payload);
}
exported.run = run;

module.exports = exported;
