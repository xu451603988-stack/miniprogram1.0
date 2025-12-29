/**
 * diagnosisEngine.js
 * --------------------------------------------------
 * 算法调度总入口（Algorithm Orchestrator）
 *
 * 职责：
 * 1. 接收问卷 answers
 * 2. 调用 A 主打分引擎（Primary）
 * 3. 生成 B 辅 riskTags（RiskTagger）
 * 4. 汇总 candidates / evidence / meta
 * 5. 输出统一 report（供 result 页装配）
 *
 * ⚠️ 本文件不写任何 UI 文案
 * ⚠️ 不直接 require 方案库（solutions）
 */

const primaryScoreEngine = require('../algorithms/primaryScoreEngine');
const riskTagger = require('../algorithms/riskTagger');

/**
 * 统一入口
 * @param {Object} answers - 问卷答案（questionConfig 的 key）
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

  /**
   * primaryResult 结构约定：
   * {
   *   candidates: [
   *     { code, score, evidence: [...] }
   *   ],
   *   evidence: [...],
   *   meta: {
   *     scoreCap?: 0.75,
   *     missingKeys?: []
   *   }
   * }
   */

  const candidates = Array.isArray(primaryResult.candidates)
    ? primaryResult.candidates
    : [];

  // 排序（防御性）
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

    // 算法调试信息（不会在 UI 主视图展示）
    scoreCap: primaryResult.meta?.scoreCap,
    missingKeys: primaryResult.meta?.missingKeys || [],
  };

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
  };
}

module.exports = {
  run,
};
