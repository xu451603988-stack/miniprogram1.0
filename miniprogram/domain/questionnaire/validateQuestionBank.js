const { getQuestion } = require('./questionBank');
const scheduler = require('./scheduler');

/**
 * 从函数源码里提取所有 'Q_XXX' / "Q_XXX" 字面量。
 * 目的：开发期护栏，提前发现 scheduler 写死的 questionId 在题库里缺失。
 */
function extractQuestionIdsFromFunction(fn) {
  const ids = new Set();
  if (typeof fn !== 'function') return ids;

  const src = Function.prototype.toString.call(fn);

  // 匹配 'Q_XXXX' 或 "Q_XXXX"
  // 例：'Q_CHIEF_COMPLAINT', "Q_LEAF_SPOTS_COLOR", 'Q_FRUIT_ROT_SMELL'
  const re = /['"]((?:Q_[A-Z0-9_]+))['"]/g;

  let m;
  while ((m = re.exec(src)) !== null) {
    if (m[1]) ids.add(m[1]);
  }

  return ids;
}

/**
 * 开发期护栏：检查问卷层引用的 questionId 是否都在题库里存在。
 *
 * ✅ 方式2默认开启：自动校验 scheduler.js 里写死的 Q_*
 *
 * @param {Array} ruleResults - 规则输出（含 needs）
 * @param {Array} positions  - 当前部位，用于 getQuestion(id, {positions})
 * @param {Object} options
 * @param {boolean} options.validateScheduler - 可显式开/关（默认 true）
 *
 * @returns {string[]} missingIds - 缺失的 questionId 列表
 */
module.exports = function validateQuestionBank(ruleResults = [], positions = [], options = {}) {
  const missing = new Set();

  // ✅ 方式2默认：开启 scheduler 源码提取校验
  const validateScheduler =
    (options && typeof options.validateScheduler === 'boolean')
      ? options.validateScheduler
      : true;

  // 1) 校验规则输出 needs 引用的 questionId
  (ruleResults || []).forEach(r => {
    if (!r || !Array.isArray(r.needs)) return;

    r.needs.forEach(n => {
      if (!n || !n.questionId) return;

      const q = getQuestion(n.questionId, { positions });
      if (!q) missing.add(n.questionId);
    });
  });

  // 2) 校验 scheduler 源码中写死的 questionId（forced followup 等）
  if (validateScheduler) {
    const idsInScheduler = extractQuestionIdsFromFunction(scheduler);

    idsInScheduler.forEach(id => {
      const q = getQuestion(id, { positions });
      if (!q) missing.add(id);
    });
  }

  const missingIds = Array.from(missing);

  if (missingIds.length) {
    console.warn(
      '[QuestionLayer] questionBank missing questionId(s):',
      missingIds,
      'positions=',
      positions
    );
  }

  return missingIds;
};
