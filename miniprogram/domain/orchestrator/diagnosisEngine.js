/**
 * diagnosisEngine.js
 * --------------------------------------------------
 * 算法调度总入口（Algorithm Orchestrator）
 *
 * 最小增强：
 * - 输出结构化 needMoreKeys（不给 UI，不调度，只声明“缺什么”）
 */

const primaryScoreEngine = require('../algorithms/primaryScoreEngine');
const riskTagger = require('../algorithms/riskTagger');

/**
 * 统一入口
 * @param {Object} answers - 问卷答案
 * @returns {Object} report
 */
function run(answers = {}) {
  const startTime = Date.now();

  // ---------- 基础上下文 ----------
  const context = {
    crop: answers.crop || 'citrus',
    positions: Array.isArray(answers.positions)
      ? answers.positions
      : (answers.position ? [answers.position] : []),
    month: answers.month || (new Date().getMonth() + 1),
  };

  // ---------- A 主：Primary Diagnosis ----------
  const primaryResult = primaryScoreEngine.run({
    answers,
    context,
  });

  const candidates = Array.isArray(primaryResult.candidates)
    ? primaryResult.candidates
    : [];

  const sortedCandidates = candidates
    .slice()
    .sort((a, b) => (b.score || 0) - (a.score || 0));

  const topCandidate = sortedCandidates[0] || null;

  // ---------- B 辅：Risk Tags ----------
  const riskTags = riskTagger.run({
    answers,
    primaryCode: topCandidate ? topCandidate.code : null,
    context,
  });

  // ---------- 汇总 evidence ----------
  const evidence = []
    .concat(primaryResult.evidence || [])
    .concat(riskTags.evidence || []);

  // ---------- Meta ----------
  const meta = {
    crop: context.crop,
    positions: context.positions,
    month: context.month,

    elapsedMs: Date.now() - startTime,

    scoreCap: primaryResult.meta?.scoreCap,
    missingKeys: primaryResult.meta?.missingKeys || [],
  };

  /**
   * ===============================
   * ★ 最小增强：结构化缺口声明
   * ===============================
   */
  let needMoreKeys = [];

  // 1️⃣ primary 引擎已经明确声明缺口（最优）
  if (Array.isArray(primaryResult.meta?.missingKeys) && primaryResult.meta.missingKeys.length > 0) {
    needMoreKeys = primaryResult.meta.missingKeys.slice();
  }

  // 2️⃣ 否则：基于病种 + 不确定性，做一次最小兜底
  if (needMoreKeys.length === 0) {
    const score = topCandidate ? Number(topCandidate.score || 0) : 0;

    if (score < 0.65 && topCandidate?.code === 'FRUIT_CRACKING') {
      needMoreKeys.push(
        'FRUIT_CRACKING_WATER_SWING',
        'FRUIT_CRACKING_SHAPE'
      );
    }
  }

  // ---------- 输出 report ----------
  return {
    code: topCandidate ? topCandidate.code : '',

    candidates: sortedCandidates.map(c => ({
      code: c.code,
      score: Number(c.score || 0),
    })),

    riskTags: Array.isArray(riskTags.tags) ? riskTags.tags : [],

    evidence,
    meta,

    // ★ 新增字段（稳定，不影响现有调用）
    needMoreKeys,
  };
}

module.exports = {
  run,
};
