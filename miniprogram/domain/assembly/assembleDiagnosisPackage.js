/**
 * miniprogram/domain/assembly/assembleDiagnosisPackage.js
 * --------------------------------------------------
 * ✅ 方案A最终版（工程化收口）：
 * - 业务文案/步骤（steps）全部下沉到 solutions（配置层）
 * - assembly 只负责“组装 + 质量门槛”
 * - 强制协议：pkg.primarySection.actions.steps 为 string[] 且长度 >= 3
 * - 若 solutions 命中不足 3 条：用 solutions.DEFAULT 补齐；仍不足则用内置通用 DEFAULT 补齐
 */

const PKG_VERSION = 'v_final_protocol_solution_driven_v1';

const CODE_TO_CN = {
  LEAF_YELLOWING: '叶片发黄（黄化）',
  LEAF_SPOTS: '叶片斑点',
  LEAF_SOOTY_MOLD: '叶片煤污（黑灰霉层）',

  FRUIT_CRACKING: '裂果',
  FRUIT_SPOTS: '果面斑点',

  BRANCH_GUMMING: '枝条流胶',
  ROOT_ROT_RISK: '烂根/根腐风险'
};

// 内置“通用 DEFAULT”，仅在 solutions.DEFAULT 缺失或不足时兜底（避免 assembly 写业务文案）
const BUILTIN_DEFAULT_STEPS = [
  '补充关键照片/信息（叶背、病斑近景、整株远景、近期管理记录），以提高判断准确度。',
  '优先排查基础管理问题：水分波动、肥害/盐害、积水闷根、近期用药/用肥史。',
  '若症状快速扩展或影响产量，建议尽快线下复核（农技站/植保站）并带样确认。'
];

function toNum(v, d = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}
function safeArray(v) {
  return Array.isArray(v) ? v : [];
}
function safeObj(v) {
  return v && typeof v === 'object' ? v : {};
}
function uniq(arr) {
  const a = safeArray(arr).filter(Boolean);
  return Array.from(new Set(a));
}

function scoreToConfidenceLevel(score) {
  const s = toNum(score, 0);
  if (s >= 0.8) return 'HIGH';
  if (s >= 0.65) return 'MEDIUM';
  return 'LOW';
}

/**
 * 统一把 steps 归一为 string[]
 * - 支持 string
 * - 支持 {title, detail}（兼容历史/误配）
 */
function normalizeStepsAnyToStrings(steps) {
  const raw = safeArray(steps);
  const out = [];

  raw.forEach((x) => {
    if (!x) return;
    if (typeof x === 'string') {
      const s = x.trim();
      if (s) out.push(s);
      return;
    }
    if (typeof x === 'object') {
      const title = (x.title || x.text || '').toString().trim();
      const detail = (x.detail || x.desc || '').toString().trim();
      if (title && detail) out.push(`${title}：${detail}`);
      else if (title) out.push(title);
      return;
    }
  });

  return out;
}

function getDefaultStepsFromSolutions(solutionsLib) {
  const lib = safeObj(solutionsLib);
  const def = lib.DEFAULT || lib.default || null;
  const actions = def && def.actions ? def.actions : null;
  const steps = actions ? actions.steps : null;
  return normalizeStepsAnyToStrings(steps);
}

/**
 * 强制 steps >= 3：
 * - 先用命中 steps（solutions[code]）
 * - 不足用 solutions.DEFAULT 补齐
 * - 仍不足用内置通用 DEFAULT 补齐
 */
function normalizeStepsToAtLeast3({ stepsHit, stepsDefault }) {
  let out = normalizeStepsAnyToStrings(stepsHit);
  const def = normalizeStepsAnyToStrings(stepsDefault);

  if (out.length < 3) out = out.concat(def);
  if (out.length < 3) out = out.concat(BUILTIN_DEFAULT_STEPS);

  out = uniq(out);
  if (out.length < 3) {
    out = uniq(out.concat(BUILTIN_DEFAULT_STEPS));
  }
  return out.slice(0, 3);
}

function labelForCode(code, solutionsLib) {
  const lib = safeObj(solutionsLib);
  const c = String(code || '').trim();
  const s = c ? safeObj(lib[c]) : null;

  if (s && s.title) return String(s.title);
  if (c && CODE_TO_CN[c]) return CODE_TO_CN[c];
  return '问题待进一步确认';
}

function pickTopEvidence(evidence = [], limit = 3) {
  const list = safeArray(evidence).slice();
  list.sort((a, b) => Math.abs(toNum(b.impact, 0)) - Math.abs(toNum(a.impact, 0)));
  return list.slice(0, limit);
}

function buildPrimarySection({ primary, solutionsLib }) {
  const p = safeObj(primary);
  const code = p.code ? String(p.code) : '';
  const score = toNum(p.score, 0);

  const lib = safeObj(solutionsLib);
  const hit = code ? safeObj(lib[code]) : null;

  const hitActions = hit && hit.actions ? hit.actions : null;
  const hitSteps = hitActions ? hitActions.steps : null;

  const defaultSteps = getDefaultStepsFromSolutions(lib);
  const steps = normalizeStepsToAtLeast3({ stepsHit: hitSteps, stepsDefault: defaultSteps });

  try {
    console.log('[assembly][steps]', 'source=', hitSteps ? 'solutions' : 'default', 'code=', code, 'finalLen=', steps.length);
  } catch (e) {}

  const title = labelForCode(code, lib);

  return {
    code,
    title,
    displayName: title,
    score,
    confidenceLevel: scoreToConfidenceLevel(score),
    evidence: pickTopEvidence(p.evidence || [], 3),
    actions: { steps }
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
  const lib = safeObj(solutionsLib);

  const items = safeArray(alternatives).slice(0, maxItems).map((a) => {
    const code = a && a.code ? String(a.code) : '';
    const score = toNum(a && a.score, 0);

    const hit = code ? safeObj(lib[code]) : null;
    const hitActions = hit && hit.actions ? hit.actions : null;
    const hitSteps = hitActions ? hitActions.steps : null;

    const defaultSteps = getDefaultStepsFromSolutions(lib);
    const steps = normalizeStepsToAtLeast3({ stepsHit: hitSteps, stepsDefault: defaultSteps });

    const title = labelForCode(code, lib);

    return { code, title, score, actions: { steps } };
  });

  return { title: '其他可能情况', items };
}

function buildSuggestedFollowups({ followupKeys, needMore }) {
  const fk = safeArray(followupKeys);
  const nm = safeArray(needMore);
  if (fk.length === 0 && nm.length === 0) return [];
  return ['还需要补充少量信息，才能给出更准确判断。'];
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

  // ✅ 追问 key 的兜底属于“流程控制”，可保留（不是业务文案）
  if (primaryCode === 'FRUIT_CRACKING') {
    const a = safeObj(answers);
    const want = [];
    if (a.FRUIT_CRACKING_WATER_SWING === undefined && a.Q_FRUIT_CRACKING_WATER_SWING === undefined) want.push('FRUIT_CRACKING_WATER_SWING');
    if (a.FRUIT_CRACKING_CRACK_SHAPE === undefined && a.Q_FRUIT_CRACKING_CRACK_SHAPE === undefined) want.push('FRUIT_CRACKING_CRACK_SHAPE');
    if (a.FRUIT_CRACKING_RATE === undefined && a.Q_FRUIT_CRACKING_RATE === undefined) want.push('FRUIT_CRACKING_RATE');
    keys = uniq(keys.concat(want));
  }

  // 过滤已答
  const ans = safeObj(answers);
  keys = keys.filter(k => ans[k] === undefined);

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
      packageVersion: PKG_VERSION,
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
