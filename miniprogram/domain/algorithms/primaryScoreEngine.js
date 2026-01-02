/**
 * primaryScoreEngine.js
 * ✅ 修复：meta.missingKeys 输出，触发问卷基础追问
 */

function has(arr, v) {
  return Array.isArray(arr) && arr.includes(v);
}

function run({ answers }) {
  const a = answers || {};

  // ✅ 没这些信息就要求追问
  const missingKeys = [];
  if (!Object.prototype.hasOwnProperty.call(a, 'leaf_color')) missingKeys.push('leaf_color');
  if (!Object.prototype.hasOwnProperty.call(a, 'leaf_shape')) missingKeys.push('leaf_shape');
  if (!Object.prototype.hasOwnProperty.call(a, 'start')) missingKeys.push('start');

  const scoreMap = {
    LEAF_SOOTY_MOLD: 0,
    LEAF_YELLOWING: 0,
    LEAF_SPOTS: 0
  };

  if (has(a.leaf_color, 'red_spider_symptoms')) scoreMap.LEAF_SOOTY_MOLD += 0.6;
  if (has(a.leaf_shape, 'leaf_curled_back')) scoreMap.LEAF_SOOTY_MOLD += 0.3;

  if (has(a.leaf_color, 'vein_green_leaf_yellow')) scoreMap.LEAF_YELLOWING += 0.7;
  if (a.start === 'tree_weak') scoreMap.LEAF_YELLOWING += 0.2;

  if (has(a.leaf_shape, 'leaf_small_deformed')) scoreMap.LEAF_SPOTS += 0.4;

  const candidates = Object.keys(scoreMap).map(code => ({
    code,
    score: Math.min(scoreMap[code], 1)
  }));

  return {
    candidates,
    evidence: [],
    meta: { missingKeys }
  };
}

module.exports = { run };
