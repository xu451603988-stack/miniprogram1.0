/**
 * miniprogram/domain/orchestrator/diagnosisEngine.js
 * --------------------------------------------------
 * ✅ 修复：
 * - 兼容 candidate.score / candidate.score.score / candidate.finalScore / candidate.confidence 等多种结构
 * - 强制补齐 report.primary / alternatives
 * - 保持兼容：仍输出 report.code / candidates / riskTags / evidence / meta / needMoreKeys
 */

const primaryScoreEngine = require('../algorithms/primaryScoreEngine');
const riskTagger = require('../algorithms/riskTagger');

function toNum(v, d = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

function pickScore(c) {
  if (!c) return 0;

  // 最常见：score 是 number
  if (typeof c.score === 'number') return toNum(c.score, 0);

  // 兼容：score 是对象，如 { score: 0.72 }
  if (c.score && typeof c.score === 'object') {
    if (typeof c.score.score === 'number') return toNum(c.score.score, 0);
    if (typeof c.score.value === 'number') return toNum(c.score.value, 0);
  }

  // 兼容：finalScore / confidence
  if (typeof c.finalScore === 'number') return toNum(c.finalScore, 0);
  if (typeof c.confidence === 'number') return toNum(c.confidence, 0);

  // 兼容：result.score
  if (c.result && typeof c.result === 'object') {
    if (typeof c.result.score === 'number') return toNum(c.result.score, 0);
  }

  return 0;
}

function pickEvidence(c) {
  if (!c) return [];
  if (Array.isArray(c.evidence)) return c.evidence;
  if (c.result && Array.isArray(c.result.evidence)) return c.result.evidence;
  return [];
}

function run(answers = {}) {
  const context = {
    crop: answers.crop || 'citrus',
    month: toNum(answers.month, 0),
    positions: Array.isArray(answers.positions) ? answers.positions : [],
  };

  // A) 主：候选评分
  const primaryResult = primaryScoreEngine.run({ answers, context }) || {};
  const rawCandidates = Array.isArray(primaryResult.candidates) ? primaryResult.candidates : [];

  // 统一成 {code, score, evidence, raw}
  const normCandidates = rawCandidates.map(c => ({
    code: String(c?.code || ''),
    score: pickScore(c),
    evidence: pickEvidence(c),
    raw: c
  }));

  normCandidates.sort((a, b) => (toNum(b.score) - toNum(a.score)));

  const top = normCandidates[0] || null;

  const primary = top
    ? { code: top.code, score: toNum(top.score), evidence: top.evidence }
    : { code: '', score: 0, evidence: [] };

  const alternatives = normCandidates.slice(1, 3).map(x => ({
    code: x.code,
    score: toNum(x.score),
    evidence: x.evidence
  }));

  // B) 风险标签
  const risk = riskTagger.run({
    answers,
    primaryCode: top ? top.code : null,
    context
  }) || {};

  const evidence = []
    .concat(Array.isArray(primaryResult.evidence) ? primaryResult.evidence : [])
    .concat(Array.isArray(risk.evidence) ? risk.evidence : []);

  const meta = {
    crop: context.crop,
    positions: context.positions,
    month: context.month,
    ...(primaryResult.meta ? { primaryMeta: primaryResult.meta } : {}),
  };

  // 缺口 keys
  let needMoreKeys = [];
  if (Array.isArray(primaryResult?.meta?.missingKeys) && primaryResult.meta.missingKeys.length > 0) {
    needMoreKeys = primaryResult.meta.missingKeys.slice();
  } else {
    // MVP：裂果追问兜底（不影响叶子类）
    if (primary.code === 'FRUIT_CRACKING' && primary.score < 0.65) {
      needMoreKeys = [
        'FRUIT_CRACKING_WATER_SWING',
        'FRUIT_CRACKING_CRACK_SHAPE',
        'FRUIT_CRACKING_RATE'
      ];
    }
  }

  return {
    // 兼容旧字段
    code: primary.code,

    // ✅ 必有 primary
    primary,

    // ✅ alternatives
    alternatives,

    // ✅ candidates：仍给最简 {code, score}
    candidates: normCandidates.map(x => ({ code: x.code, score: toNum(x.score) })),

    riskTags: Array.isArray(risk.tags) ? risk.tags : [],
    evidence,
    meta,
    needMoreKeys,
  };
}

module.exports = { run };
