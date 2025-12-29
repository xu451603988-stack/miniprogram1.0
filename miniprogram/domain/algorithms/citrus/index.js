function safeRequire(path) {
  try {
    return require(path);
  } catch (e) {
    console.warn('[citrus/index] require failed:', path, e && (e.message || e));
    return null;
  }
}

const leaf = safeRequire('./leaf/index.js');
const fruit = safeRequire('./fruit/index.js');
const branch = safeRequire('./branch/index.js');
const root = safeRequire('./root/index.js');

// ✅ 关键：在算法入口统一做口径映射（不依赖问卷层/结果页传参）
function normalizeAnswersForAlgo(uiAnswers = {}) {
  const a = { ...uiAnswers };

  // 1) symptoms 映射：问卷层 -> 算法层命中词
  const s = Array.isArray(a.symptoms) ? a.symptoms.slice() : [];
  const has = (v) => s.indexOf(v) >= 0;

  // 煤污线路：leaf_sooty -> honeydew（sooty_mold.js 用的是 honeydew）
  if (has('leaf_sooty') && !has('honeydew')) s.push('honeydew');

  // 根腐风险：root_vigor -> root_rot（root_rot.js 用 root_rot）
  if (has('root_vigor') && !has('root_rot')) s.push('root_rot');

  a.symptoms = s;

  // 2) yes/no/unknown -> true/false/unknown（规则里判断 insects_visible === true/false）
  const ynToBool = (v) => {
    if (v === 'yes') return true;
    if (v === 'no') return false;
    return v; // unknown / undefined 原样保留
  };

  if (a.insects_visible !== undefined) a.insects_visible = ynToBool(a.insects_visible);
  if (a.soil_waterlog !== undefined) a.soil_waterlog = ynToBool(a.soil_waterlog);

  return a;
}

function normalizeRes(res) {
  if (!res) return { candidates: [] };

  if (Array.isArray(res.candidates)) {
    return { candidates: res.candidates };
  }

  if (res.best) {
    const code = res.best.code || res.best.id || res.best;
    const score = Number(res.confidence) || Number(res.best.score) || 0;
    return {
      candidates: [{
        code,
        score,
        evidence: res.best.evidence || [],
        suggestions: res.best.suggestions || [],
        needs: res.best.needs || []
      }]
    };
  }

  return { candidates: [] };
}

function mergeCandidates(list) {
  const out = [];
  (list || []).forEach(item => {
    const r = normalizeRes(item);
    if (r && Array.isArray(r.candidates)) out.push(...r.candidates);
  });

  out.forEach(c => { c.score = Number(c.score) || 0; });
  out.sort((a, b) => (b.score || 0) - (a.score || 0));
  return out;
}

module.exports = function runCitrus(ctx) {
  const inAnswers = (ctx && ctx.answers) ? ctx.answers : {};
  const answers = normalizeAnswersForAlgo(inAnswers);

  const positions = Array.isArray(answers.positions) ? answers.positions : [];

  const nextCtx = { ...ctx, answers };

  const parts = [];
  if (positions.length === 0) {
    if (leaf) parts.push(leaf(nextCtx));
  } else {
    if (positions.includes('leaf') && leaf) parts.push(leaf(nextCtx));
    if (positions.includes('fruit') && fruit) parts.push(fruit(nextCtx));
    if (positions.includes('branch') && branch) parts.push(branch(nextCtx));
    if (positions.includes('root') && root) parts.push(root(nextCtx));
  }

  const candidates = mergeCandidates(parts);
  return { candidates };
};
