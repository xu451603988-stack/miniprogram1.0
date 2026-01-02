/**
 * miniprogram/domain/assembly/assembleDiagnosisPackage.js
 * --------------------------------------------------
 * ✅ 修复：
 * - 不再把 LEAF_SOOTY_MOLD 这类 code 直接显示给用户
 * - solutions 没 title 时，用内置 code->中文映射兜底
 * - nextSteps 字段稳定输出
 */

const pkgVersion = 'v_mvp_followup_3';

const CODE_TO_CN = {
  LEAF_YELLOWING: '叶片发黄（黄化）',
  LEAF_SPOTS: '叶片斑点',
  LEAF_SOOTY_MOLD: '叶片煤污（黑灰霉层）',

  FRUIT_CRACKING: '裂果',
  FRUIT_SPOTS: '果面斑点',

  BRANCH_GUMMING: '枝条流胶',
  ROOT_ROT_RISK: '烂根/根腐风险'
};

function toNum(v, d = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}
function uniq(arr) {
  const a = Array.isArray(arr) ? arr : [];
  return Array.from(new Set(a.filter(Boolean)));
}
function safeArray(v) {
  return Array.isArray(v) ? v : [];
}
function safeObj(v) {
  return v && typeof v === 'object' ? v : {};
}
function scoreToConfidenceLevel(score) {
  const s = toNum(score, 0);
  if (s >= 0.80) return 'HIGH';
  if (s >= 0.65) return 'MEDIUM';
  return 'LOW';
}
function pickTopEvidence(evidence = [], limit = 3) {
  const list = safeArray(evidence).slice();
  list.sort((a, b) => Math.abs(toNum(b.impact, 0)) - Math.abs(toNum(a.impact, 0)));
  return list.slice(0, limit);
}

// ✅ 永不把 UNKNOWN/code 生硬露给用户
function labelForCode(code, solutionsLib) {
  const lib = safeObj(solutionsLib);
  const c = String(code || '').trim();
  const s = c ? lib[c] : null;

  if (s && s.title) return String(s.title);
  if (c && CODE_TO_CN[c]) return CODE_TO_CN[c];

  // 不返回 UNKNOWN
  if (!c) return '问题待进一步确认';
  return '问题待进一步确认';
}

function buildSuggestedFollowups({ followupKeys, needMore }) {
  const fk = safeArray(followupKeys);
  const nm = safeArray(needMore);
  if (fk.length === 0 && nm.length === 0) return [];
  return ['还需要补充少量信息，才能给出更准确判断。'];
}

function buildPrimarySection({ primary, solutionsLib }) {
  const p = safeObj(primary);
  const code = p.code ? String(p.code) : '';
  const score = toNum(p.score, 0);

  const solution = code ? safeObj(safeObj(solutionsLib)[code]) : {};
  const actions = solution && solution.actions ? solution.actions : null;

  const cn = labelForCode(code, solutionsLib);

  return {
    code,
    title: cn,
    displayName: cn,
    score,
    confidenceLevel: scoreToConfidenceLevel(score),
    evidence: pickTopEvidence(p.evidence || [], 3),
    actions: actions || null,
  };
}

function buildSummary({ primarySection }) {
  const p = safeObj(primarySection);
  return {
    headline: p.title || '问题待进一步确认',
    subline: '判断情况：还需要进一步确认'
  };
}

function buildQualityFlags({ diagnosisResult }) {
  const dr = safeObj(diagnosisResult);
  const flags = safeArray(dr.qualityFlags).map(String);
  const missing = safeArray(safeObj(dr.meta).missingKeys);
  if (missing.length > 0) flags.push('INFO_INSUFFICIENT');
  return uniq(flags);
}

function buildAlternativesSection({ alternatives, solutionsLib, maxItems = 2 }) {
  const list = safeArray(alternatives).slice(0, maxItems).map(a => {
    const code = a && a.code ? String(a.code) : '';
    const score = toNum(a && a.score, 0);
    const title = labelForCode(code, solutionsLib);
    const s = safeObj(safeObj(solutionsLib)[code]);
    return { code, title, score, actions: s.actions || null };
  });

  return { title: '其他可能情况', items: list };
}

function buildFollowupKeys({ answers, diagnosisResult, primaryCode }) {
  const dr = safeObj(diagnosisResult);
  const meta = safeObj(dr.meta);
  const ns = safeObj(dr.nextSteps);

  const direct = safeArray(dr.needMoreKeys)
    .concat(safeArray(ns.followupKeys))
    .map(String);

  const missing = safeArray(meta.missingKeys).map(String);

  let keys = uniq(direct.concat(missing));

  // 裂果 MVP 兜底
  if (primaryCode === 'FRUIT_CRACKING') {
    const a = safeObj(answers);
    const want = [];
    if (a.FRUIT_CRACKING_WATER_SWING === undefined && a.Q_FRUIT_CRACKING_WATER_SWING === undefined) want.push('FRUIT_CRACKING_WATER_SWING');
    if (a.FRUIT_CRACKING_CRACK_SHAPE === undefined && a.Q_FRUIT_CRACKING_CRACK_SHAPE === undefined) want.push('FRUIT_CRACKING_CRACK_SHAPE');
    if (a.FRUIT_CRACKING_RATE === undefined && a.Q_FRUIT_CRACKING_RATE === undefined) want.push('FRUIT_CRACKING_RATE');
    keys = uniq(keys.concat(want));
  }

  return keys;
}

function buildNeedMoreFromFollowupKeys(followupKeys) {
  return safeArray(followupKeys).map(k => ({
    key: String(k),
    reason: '需要补充信息以提高判断准确度'
  }));
}

function assemble(answers, diagnosisResult, libraries = {}, options = {}) {
  const libs = safeObj(libraries);
  const solutionsLib = safeObj(libs.solutions);

  const dr = safeObj(diagnosisResult);
  const primary = safeObj(dr.primary);
  const alternatives = safeArray(dr.alternatives);

  const generatedAt = new Date().toISOString();

  const primarySection = buildPrimarySection({ primary, solutionsLib });
  const summary = buildSummary({ primarySection });
  const qualityFlags = buildQualityFlags({ diagnosisResult: dr });

  const followupKeys = buildFollowupKeys({
    answers: safeObj(answers),
    diagnosisResult: dr,
    primaryCode: primarySection.code
  });

  const needMore = buildNeedMoreFromFollowupKeys(followupKeys);

  const nextSteps = {
    followupKeys: safeArray(followupKeys),
    needMore: safeArray(needMore),
    suggestedFollowups: buildSuggestedFollowups({ followupKeys, needMore })
  };

  const alternativesSection = buildAlternativesSection({
    alternatives,
    solutionsLib,
    maxItems: 2
  });

  const answeredKeyCount = Object.keys(safeObj(answers)).length;
  const level = scoreToConfidenceLevel(primarySection.score);

  return {
    meta: {
      packageVersion: pkgVersion,
      generatedAt,
      confidenceLevel: level,
      primaryScore: primarySection.score,
      answeredKeyCount,
      qualityFlags
    },
    summary,
    primarySection,
    riskSection: dr.riskSection || { title: '风险提示', items: [] },
    alternativesSection,
    nextSteps
  };
}

module.exports = assemble;
