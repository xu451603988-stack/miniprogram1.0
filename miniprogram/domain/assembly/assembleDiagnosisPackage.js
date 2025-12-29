/**
 * miniprogram/domain/assembly/assembleDiagnosisPackage.js
 * --------------------------------------------------
 * 第四层：诊断整合层（Diagnosis Assembly）
 *
 * assemble(answers, diagnosisResult, libraries, options) -> DiagnosisPackage
 *
 * 输入：
 * - answers: 问卷层输出（结构化 answers）
 * - diagnosisResult: 算法层输出（A 主 + alternatives + riskTags + evidence + meta）
 * - libraries:
 *    - solutions: (required) A 主立即处置方案库（按 code 查）
 *    - expertDictionary: (optional) 风险标签解释库（按 tagKey 查 label/why）
 *    - treatmentPlans: (optional) 风险标签预防建议库（按 tagKey 查 prevent[]）
 *    - uiCopy: (optional) 统一话术模板
 *
 * 输出：
 * DiagnosisPackage（前端直接渲染）
 */

const generic = require('./genericFallback');

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
  // 只统计有值的 key（数组非空也算）
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

function pickTopEvidence(evidence = [], limit = 3) {
  // evidenceBuilder 里 impact 可能是 +/-
  const list = Array.isArray(evidence) ? evidence.slice() : [];
  list.sort((a, b) => Math.abs(toNum(b.impact, 0)) - Math.abs(toNum(a.impact, 0)));
  return list.slice(0, limit);
}

function labelForCode(code, solutionsLib) {
  // 不允许用 code 直接出话术：优先方案标题当 label
  if (!code) return '未知问题';
  try {
    const plan = solutionsLib && solutionsLib.getPlan ? solutionsLib.getPlan({ crop: 'citrus', code }) : null;
    const pv = plan && solutionsLib && solutionsLib.toPlanView ? solutionsLib.toPlanView(plan) : null;
    return (pv && pv.title) || (plan && plan.title) || code;
  } catch (e) {
    return code;
  }
}

function buildSummary({ level, primaryLabel, altLabel, uiCopy }) {
  // 按规格：不同置信度话术（不能用 code，必须用 label）:contentReference[oaicite:6]{index=6}
  const copy = uiCopy || {};
  if (level === 'HIGH') {
    return {
      headline: (copy.highHeadline || `你遇到的很可能是：${primaryLabel}`),
      subhead: (copy.highSubhead || `建议按下面步骤处理，避免进一步扩散。`)
    };
  }
  if (level === 'MEDIUM') {
    return {
      headline: (copy.medHeadline || `你遇到的可能是：${primaryLabel}`),
      subhead: (copy.medSubhead || `建议先按以下步骤处理，并持续观察变化。`)
    };
  }
  // LOW：信息不足/初步建议
  return {
    headline: (copy.lowHeadline || `目前信息还不够完整，我先给出：${primaryLabel} 的初步建议`),
    subhead: (copy.lowSubhead || `建议你补充关键信息后再诊断，会更准确。`)
  };
}

function buildActions({ crop, code, solutionsLib, qualityFlags }) {
  // A 主方案装配，缺失则 genericSolution :contentReference[oaicite:7]{index=7}
  let usedFallback = false;
  let planView = null;

  try {
    const plan = solutionsLib && solutionsLib.getPlan ? solutionsLib.getPlan({ crop, code }) : null;
    planView = (plan && solutionsLib && solutionsLib.toPlanView) ? solutionsLib.toPlanView(plan) : null;
  } catch (e) {
    planView = null;
  }

  if (!planView || !planView.title) {
    usedFallback = true;
    planView = generic.genericSolution();
  }

  if (usedFallback) qualityFlags.push('CONTENT_FALLBACK_USED');

  // 统一格式：title/steps/dos/donts/whenToEscalate
  return {
    title: planView.title,
    steps: asArray(planView.steps).slice(0, 5),
    dos: asArray(planView.dos),
    donts: asArray(planView.donts),
    whenToEscalate: asArray(planView.whenToEscalate)
  };
}

function fallbackRiskItem(tagKey) {
  // 风险标签缺失兜底（label/why/prevent）:contentReference[oaicite:8]{index=8}
  const meta = generic.fallbackRiskMeta(tagKey);
  return {
    key: tagKey,
    label: meta.label,
    why: meta.why,
    prevent: meta.prevent
  };
}

function buildRiskSection({ riskTags, expertDictionary, treatmentPlans, qualityFlags, conflictMode }) {
  // Top2 风险标签装配：补齐 label/why + prevent(2~4) :contentReference[oaicite:9]{index=9}
  const items = [];
  const tags = Array.isArray(riskTags) ? riskTags.slice(0, 2) : [];

  let usedFallback = false;

  tags.forEach(t => {
    const key = t && (t.key || t.tag || t.riskKey);
    if (!key) return;

    const dict = expertDictionary && expertDictionary[key] ? expertDictionary[key] : null;
    const plan = treatmentPlans && treatmentPlans[key] ? treatmentPlans[key] : null;

    let label = (t.label || (dict && (dict.label || dict.name)) || '');
    let why = asArray(t.why).concat(asArray(dict && (dict.why || dict.explain || dict.desc)));
    let prevent = asArray(t.advice).concat(asArray(plan && (plan.prevent || plan.preventList || plan.tips)));

    why = uniq(why.map(s => String(s).trim())).filter(Boolean);
    prevent = uniq(prevent.map(s => String(s).trim())).filter(Boolean).slice(0, 4);

    if (!label || why.length === 0 || prevent.length === 0) {
      usedFallback = true;
      const fb = fallbackRiskItem(key);
      label = label || fb.label;
      why = (why.length ? why : fb.why);
      prevent = (prevent.length ? prevent : fb.prevent);
    }

    items.push({
      key,
      label,
      score: toNum(t.score, 0),
      why,
      prevent
    });
  });

  if (items.length === 0) {
    // 没有任何 riskTags：也给一个保守兜底（不白屏）:contentReference[oaicite:10]{index=10}
    usedFallback = true;
    items.push({
      key: 'general_management',
      score: 0,
      ...fallbackRiskItem('general_management')
    });
  }

  if (usedFallback) qualityFlags.push('CONTENT_FALLBACK_USED');

  return {
    title: conflictMode ? '可能相关的管理风险（建议看看）' : '可能的原因与预防（建议看看）', // 风险与主诊断不一致时建议更中性 :contentReference[oaicite:11]{index=11}
    defaultCollapsed: true,
    items
  };
}

function buildAlternativesSection({ alternatives, solutionsLib, crop, maxItems = 3 }) {
  const items = (Array.isArray(alternatives) ? alternatives.slice(0, maxItems) : [])
    .map(a => ({
      code: a.code,
      label: labelForCode(a.code, solutionsLib),
      score: toNum(a.score, 0)
    }));

  return {
    defaultCollapsed: true,
    items
  };
}

function buildSuggestedFollowups(answers = {}, primaryCode = '') {
  // 简单规则：信息不足时给可补充点（你以后可对接 scheduler 的“缺失关键题”）
  const followups = [];

  if (!answers.yellow_stage && /YELLOW/i.test(primaryCode)) followups.push('补充：黄化发生在新叶还是老叶？');
  if (!answers.insects_visible) followups.push('补充：叶片背面是否能看到蚜虫/粉虱等害虫？');
  if (!answers.soil_waterlog) followups.push('补充：根部/土壤是否有积水或排水不畅？');
  if (!answers.leaf_spots_type) followups.push('补充：叶斑是圆形带晕圈，还是不规则水渍状？');

  return uniq(followups).slice(0, 4);
}

function detectEvidenceConflicts(evidence = []) {
  // 轻量冲突检测：同 key 同时出现 strong(+)/penalty(-)
  const map = {};
  const list = Array.isArray(evidence) ? evidence : [];
  list.forEach(ev => {
    const k = ev && ev.key;
    if (!k) return;
    map[k] = map[k] || { pos: 0, neg: 0 };
    const imp = toNum(ev.impact, 0);
    if (imp > 0) map[k].pos += 1;
    if (imp < 0) map[k].neg += 1;
  });
  return Object.keys(map).some(k => map[k].pos > 0 && map[k].neg > 0);
}

/**
 * assemble 主函数
 */
function assemble(answers = {}, diagnosisResult = {}, libraries = {}, options = {}) {
  const pkgVersion = options.packageVersion || '1.0.0';
  const generatedAt = nowISO();

  const solutionsLib = libraries.solutions; // required
  const expertDictionary = libraries.expertDictionary || {};
  const treatmentPlans = libraries.treatmentPlans || {};
  const uiCopy = libraries.uiCopy || {};

  const crop = answers.crop || diagnosisResult.meta?.crop || 'citrus';

  // ---- Primary / Alternatives / RiskTags ----
  const candidates = Array.isArray(diagnosisResult.candidates) ? diagnosisResult.candidates.slice() : [];
  candidates.sort((a, b) => toNum(b.score, 0) - toNum(a.score, 0));

  const top1 = candidates[0] || { code: diagnosisResult.code || 'UNKNOWN', score: 0 };
  const top2 = candidates[1] || null;

  const primary = {
    code: top1.code || 'UNKNOWN',
    score: clamp(toNum(top1.score, 0), 0, 1),
    evidence: pickTopEvidence((diagnosisResult.evidence || []), 3)
  };

  const alternatives = candidates.slice(1, 3).map(c => ({
    code: c.code,
    score: clamp(toNum(c.score, 0), 0, 1)
  }));

  const riskTags = Array.isArray(diagnosisResult.riskTags) ? diagnosisResult.riskTags.slice(0, 2) : [];

  // ---- Confidence ----
  const level = confidenceLevel(primary.score); // HIGH/MEDIUM/LOW :contentReference[oaicite:12]{index=12}

  // ---- qualityFlags ----
  const qualityFlags = [];
  const answeredKeyCount = countAnsweredKeys(answers);
  const evCount = Array.isArray(diagnosisResult.evidence) ? diagnosisResult.evidence.length : 0;

  if (primary.score < 0.65 || answeredKeyCount < 4 || evCount < 1) {
    qualityFlags.push('INFO_INSUFFICIENT'); // :contentReference[oaicite:13]{index=13}
  }

  // 冲突：top1 与 top2 接近 / evidence 冲突
  let conflictMode = false;
  if (top2 && (primary.score - clamp(toNum(top2.score, 0), 0, 1) < 0.10)) {
    qualityFlags.push('CONFLICTING_SIGNALS'); // :contentReference[oaicite:14]{index=14}
    conflictMode = true;
  } else if (detectEvidenceConflicts(diagnosisResult.evidence || [])) {
    qualityFlags.push('CONFLICTING_SIGNALS'); // :contentReference[oaicite:15]{index=15}
    conflictMode = true;
  }

  // ---- Labels ----
  const primaryLabel = labelForCode(primary.code, solutionsLib);
  const altLabel = alternatives[0] ? labelForCode(alternatives[0].code, solutionsLib) : '';

  // ---- Summary ----
  let summary = buildSummary({ level, primaryLabel, altLabel, uiCopy });

  // 若冲突且 top2 存在：summary 用“可能…也可能…”
  if (conflictMode && alternatives[0]) {
    summary = {
      headline: `你遇到的可能是：${primaryLabel}；也可能是：${altLabel}`,
      subhead: '建议补充关键信息后再确认，并先按保守方案处理。'
    };
  }

  // ---- Primary Section (A 主 + actions) ----
  const primarySection = {
    title: primaryLabel,
    code: primary.code,
    score: primary.score,
    evidence: primary.evidence,
    actions: buildActions({ crop, code: primary.code, solutionsLib, qualityFlags })
  };

  // ---- Risk Section (B 辅 Top2) ----
  const riskSection = buildRiskSection({
    riskTags,
    expertDictionary,
    treatmentPlans,
    qualityFlags,
    conflictMode
  });

  // ---- Alternatives Section ----
  const alternativesSection = buildAlternativesSection({
    alternatives,
    solutionsLib,
    crop,
    maxItems: 2
  });

  // ---- Next Steps (可选) ----
  const nextSteps = {};
  if (qualityFlags.includes('INFO_INSUFFICIENT') || qualityFlags.includes('CONFLICTING_SIGNALS')) {
    nextSteps.suggestedFollowups = buildSuggestedFollowups(answers, primary.code);
  }

  // ---- Trace (可开关) ----
  const traceOn = options.trace === true;
  const trace = traceOn ? {
    assemblyVersion: pkgVersion,
    usedPrimaryCode: primary.code,
    primaryScore: primary.score,
    usedEvidenceKeys: uniq((diagnosisResult.evidence || []).map(e => e && e.key).filter(Boolean)),
    riskTagScores: (riskTags || []).map(t => ({ key: t.key, score: t.score })),
    missingContent: qualityFlags.includes('CONTENT_FALLBACK_USED') ? ['solutions/expertDictionary/treatmentPlans may be missing'] : [],
  } : undefined;

  return {
    meta: {
      packageVersion: pkgVersion,
      generatedAt,
      confidenceLevel: level,
      primaryScore: primary.score,
      answeredKeyCount,
      qualityFlags: uniq(qualityFlags),
    },

    summary,

    primarySection,

    riskSection,

    alternativesSection,

    ...(Object.keys(nextSteps).length ? { nextSteps } : {}),

    ...(traceOn ? { trace } : {}),

    // 留给你调试/日志：原始输入（线上可不存）
    _raw: traceOn ? { answers, diagnosisResult } : undefined
  };
}

module.exports = assemble;
