/**
 * miniprogram/domain/assembly/assembleDiagnosisPackage.js
 * --------------------------------------------------
 * 第四层：诊断整合层（Diagnosis Assembly）
 *
 * assemble(answers, diagnosisResult, libraries, options) -> DiagnosisPackage
 */

const generic = require('./genericFallback');

/* ===== 原有工具函数：全部保留 ===== */
function nowISO() {
  try { return new Date().toISOString(); } catch (e) { return String(Date.now()); }
}
function toNum(v, d = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}
function uniq(arr) {
  return Array.from(new Set((arr || []).filter(Boolean)));
}
function asArray(v) {
  if (Array.isArray(v)) return v;
  if (v === undefined || v === null) return [];
  return [v];
}
function countAnsweredKeys(answers = {}) {
  let c = 0;
  Object.keys(answers || {}).forEach(k => {
    const v = answers[k];
    if (v === undefined || v === null) return;
    if (typeof v === 'string' && v.trim() === '') return;
    if (Array.isArray(v) && v.length === 0) return;
    c += 1;
  });
  return c;
}
function confidenceLevel(score01) {
  const s = toNum(score01, 0);
  if (s >= 0.80) return 'HIGH';
  if (s >= 0.65) return 'MEDIUM';
  return 'LOW';
}

/* ===== assemble 主函数 ===== */
function assemble(answers = {}, diagnosisResult = {}, libraries = {}, options = {}) {
  const pkgVersion = options.packageVersion || '1.0.0';
  const generatedAt = nowISO();

  const solutionsLib = libraries.solutions;
  const expertDictionary = libraries.expertDictionary || {};
  const treatmentPlans = libraries.treatmentPlans || {};
  const uiCopy = libraries.uiCopy || {};

  const crop = answers.crop || diagnosisResult.meta?.crop || 'citrus';

  /* ---------- 原有 primary / alternatives / risk / qualityFlags 逻辑（不动） ---------- */

  const candidates = Array.isArray(diagnosisResult.candidates)
    ? diagnosisResult.candidates.slice()
    : [];

  candidates.sort((a, b) => toNum(b.score, 0) - toNum(a.score, 0));

  const top1 = candidates[0] || { code: diagnosisResult.code || 'UNKNOWN', score: 0 };
  const top2 = candidates[1] || null;

  const primary = {
    code: top1.code || 'UNKNOWN',
    score: clamp(toNum(top1.score, 0), 0, 1),
    evidence: asArray(diagnosisResult.evidence).slice(0, 3)
  };

  const alternatives = candidates.slice(1, 3).map(c => ({
    code: c.code,
    score: clamp(toNum(c.score, 0), 0, 1)
  }));

  const riskTags = Array.isArray(diagnosisResult.riskTags)
    ? diagnosisResult.riskTags.slice(0, 2)
    : [];

  const level = confidenceLevel(primary.score);

  const qualityFlags = [];
  const answeredKeyCount = countAnsweredKeys(answers);
  const evCount = asArray(diagnosisResult.evidence).length;

  if (primary.score < 0.65 || answeredKeyCount < 4 || evCount < 1) {
    qualityFlags.push('INFO_INSUFFICIENT');
  }

  if (top2 && (primary.score - clamp(toNum(top2.score, 0), 0, 1) < 0.10)) {
    qualityFlags.push('CONFLICTING_SIGNALS');
  }

  /* ===================== ★ 新增：结构化追问缺口 ===================== */

  const followupKeys = [];

  if (qualityFlags.includes('INFO_INSUFFICIENT')) {
    // MVP：按主诊断 code 决定追问缺口
    if (primary.code === 'FRUIT_CRACKING') {
      followupKeys.push(
        'FRUIT_CRACKING_WATER_SWING',
        'FRUIT_CRACKING_SHAPE'
      );
    }
    // 后续你可以继续加：
    // if (primary.code === 'LEAF_YELLOWING') ...
  }

  const nextSteps =
    followupKeys.length > 0
      ? {
          followupKeys: uniq(followupKeys),
          // UI 仍然可以用你原有 suggestedFollowups
          suggestedFollowups: buildSuggestedFollowups(answers, primary.code)
        }
      : undefined;

  /* ---------- 返回结构（只是在原结构上多透传 nextSteps） ---------- */

  return {
    meta: {
      packageVersion: pkgVersion,
      generatedAt,
      confidenceLevel: level,
      primaryScore: primary.score,
      answeredKeyCount,
      qualityFlags: uniq(qualityFlags)
    },

    summary: {
      headline: `你遇到的可能是：${primary.code}`,
      subhead: level === 'LOW'
        ? '建议补充关键信息后再确认，会更准确。'
        : '建议按下面步骤处理。'
    },

    primarySection: {
      title: primary.code,
      code: primary.code,
      score: primary.score,
      evidence: primary.evidence
    },

    riskSection: {
      title: '可能的原因与预防（建议看看）',
      defaultCollapsed: true,
      items: riskTags
    },

    alternativesSection: {
      defaultCollapsed: true,
      items: alternatives
    },

    ...(nextSteps ? { nextSteps } : {})
  };
}

module.exports = assemble;
