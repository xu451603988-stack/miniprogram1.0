/**
 * riskTagger.js
 * --------------------------------------------------
 * B 辅：风险标签生成器（Top2）
 *
 * 输入：
 *  - answers: 问卷答案
 *  - primaryCode: A 主 top1 code（可为空）
 *  - context: { crop, month, positions }
 *
 * 输出：
 *  {
 *    tags: [
 *      { key, score, label, why:[], advice:[] }
 *    ],
 *    evidence: [
 *      { type:'riskTag', key, impact, source, detail }
 *    ]
 *  }
 *
 * 说明：
 *  - 本文件不写 UI 方案步骤
 *  - 只负责“风险标签”的生成与解释线索
 */

const RISK_MAPPING = require('../config/ab_risk_mapping.js');

let riskTagDict = null;
try {
  // 可选：如果你有 riskTagDictionary.js，会用它补 label/advice
  riskTagDict = require('../dictionary/riskTagDictionary');
} catch (e) {
  riskTagDict = null;
}

function toNumber(v, dft = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : dft;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function isEmpty(v) {
  return v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);
}

function asArray(v) {
  if (Array.isArray(v)) return v;
  if (v === undefined || v === null) return [];
  return [v];
}

function uniq(arr) {
  return Array.from(new Set(arr));
}

/**
 * 取映射表结构：
 * 允许你的 YAML 使用不同命名（兼容）
 */
function getConfig() {
  const cfg = RISK_MAPPING || {};
  return {
    // primaryCode 默认倾向：{ CODE: [{key, score, why?, advice?} ...] }
    codeDefaults: cfg.codeDefaults || cfg.code_defaults || {},

    // answers 信号叠加：[{ key, when:{answerKey, values?}, add, why?, advice? }, ...]
    answerSignals: cfg.answerSignals || cfg.answer_signals || [],

    // tag 元信息（如果 YAML 自带）：{ tagKey: {label, explain, advice} }
    tagMeta: cfg.tagMeta || cfg.tag_meta || {},
  };
}

function buildTagMeta(tagKey, tagMetaFromYaml, dict) {
  const yamlMeta = (tagMetaFromYaml && tagMetaFromYaml[tagKey]) ? tagMetaFromYaml[tagKey] : null;
  const dictMeta = (dict && dict[tagKey]) ? dict[tagKey] : null;

  const label = (yamlMeta && (yamlMeta.label || yamlMeta.name))
    || (dictMeta && (dictMeta.label || dictMeta.name))
    || tagKey;

  const advice = []
    .concat(asArray(yamlMeta && (yamlMeta.advice || yamlMeta.prevent || yamlMeta.tips)))
    .concat(asArray(dictMeta && (dictMeta.advice || dictMeta.prevent || dictMeta.tips)))
    .filter(Boolean);

  const explain = (yamlMeta && (yamlMeta.explain || yamlMeta.desc))
    || (dictMeta && (dictMeta.explain || dictMeta.desc))
    || '';

  return { label, advice: uniq(advice), explain };
}

/**
 * 判断一个信号是否命中
 * 支持：
 *  - values: ['yes','maybe'] 精确匹配
 *  - values 为空：只要 answers[key] 非空即命中
 */
function signalHit(answers, when) {
  if (!when || !when.answerKey) return false;
  const key = when.answerKey;
  const val = answers[key];

  if (isEmpty(val)) return false;

  const values = asArray(when.values);
  if (values.length === 0) return true;

  // 支持数组答案（多选）
  if (Array.isArray(val)) {
    return val.some(v => values.includes(v));
  }

  return values.includes(val);
}

/**
 * 添加一条 evidence
 */
function pushEvidence(evidence, { tagKey, impact, source, detail }) {
  evidence.push({
    type: 'riskTag',
    key: tagKey,
    impact: toNumber(impact, 0),
    source: source || 'unknown',
    detail: detail || ''
  });
}

/**
 * 主入口
 */
function run({ answers = {}, primaryCode = null, context = {} } = {}) {
  const cfg = getConfig();
  const scoreMap = {};     // tagKey -> score(0..100)
  const whyMap = {};       // tagKey -> string[]
  const adviceMap = {};    // tagKey -> string[]
  const evidence = [];     // evidence list

  // ---------- 1) primaryCode 默认倾向 ----------
  const code = primaryCode ? String(primaryCode).trim() : '';
  if (code && cfg.codeDefaults && cfg.codeDefaults[code]) {
    const defaults = asArray(cfg.codeDefaults[code]);
    defaults.forEach(item => {
      const key = item && (item.key || item.tag || item.riskKey);
      if (!key) return;

      const add = toNumber(item.score ?? item.add ?? item.weight, 0);
      scoreMap[key] = toNumber(scoreMap[key], 0) + add;

      whyMap[key] = (whyMap[key] || []).concat(
        asArray(item.why || item.reason || (item.text ? [item.text] : []))
          .filter(Boolean)
      );

      adviceMap[key] = (adviceMap[key] || []).concat(
        asArray(item.advice || item.prevent || item.tips).filter(Boolean)
      );

      pushEvidence(evidence, {
        tagKey: key,
        impact: add,
        source: 'codeDefault',
        detail: `${code} -> ${key} (+${add})`
      });
    });
  }

  // ---------- 2) answers 信号叠加 ----------
  const signals = Array.isArray(cfg.answerSignals) ? cfg.answerSignals : [];
  signals.forEach(sig => {
    if (!sig) return;
    const key = sig.key || sig.tag || sig.riskKey;
    if (!key) return;

    if (!signalHit(answers, sig.when)) return;

    const add = toNumber(sig.add ?? sig.score ?? sig.weight, 0);
    scoreMap[key] = toNumber(scoreMap[key], 0) + add;

    // why：优先用 sig.why，否则生成一条基于答案 key 的说明
    const whenKey = sig.when && sig.when.answerKey ? sig.when.answerKey : '';
    const val = answers[whenKey];
    const autoWhy = whenKey
      ? [`命中关键信号：${whenKey}=${Array.isArray(val) ? val.join(',') : String(val)}`]
      : [];

    whyMap[key] = (whyMap[key] || []).concat(
      asArray(sig.why || sig.reason || sig.text || []).filter(Boolean).concat(autoWhy)
    );

    adviceMap[key] = (adviceMap[key] || []).concat(
      asArray(sig.advice || sig.prevent || sig.tips).filter(Boolean)
    );

    pushEvidence(evidence, {
      tagKey: key,
      impact: add,
      source: 'answerSignal',
      detail: `${whenKey} hit -> ${key} (+${add})`
    });
  });

  // ---------- 3) 组装 tags，并补齐 label/advice ----------
  const allKeys = Object.keys(scoreMap);
  const tagsAll = allKeys.map(tagKey => {
    const meta = buildTagMeta(tagKey, cfg.tagMeta, riskTagDict);

    const score = clamp(Math.round(toNumber(scoreMap[tagKey], 0)), 0, 100);

    const why = uniq(
      (whyMap[tagKey] || [])
        .map(s => String(s).trim())
        .filter(Boolean)
    );

    // advice：映射给的 + 字典/元信息的（去重）
    const advice = uniq(
      []
        .concat(adviceMap[tagKey] || [])
        .concat(meta.advice || [])
        .map(s => String(s).trim())
        .filter(Boolean)
    );

    // 若 why 为空，给一个兜底（避免 UI 空白）
    const whyFinal = why.length ? why : (meta.explain ? [meta.explain] : []);

    return {
      key: tagKey,
      score,
      label: meta.label,
      why: whyFinal,
      advice
    };
  });

  // ---------- 4) 排序 & Top2 ----------
  tagsAll.sort((a, b) => (b.score || 0) - (a.score || 0));

  const top2 = tagsAll
    .filter(t => (t.score || 0) > 0)
    .slice(0, 2);

  // 若全为 0：直接输出空（不强行造标签）
  return {
    tags: top2,
    evidence
  };
}

module.exports = {
  run
};
