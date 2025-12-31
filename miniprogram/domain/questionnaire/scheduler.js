/**
 * scheduler.js
 *
 * 作用：
 * 决定「还要不要问 / 问哪一题」
 *
 * MVP 能力：
 * 1. followupKeys / needMore 优先级最高（只要存在就继续问）
 * 2. 追问上限（默认最多 3 题）
 * 3. 已问去重（问过的不再问）
 * 4. 所有条件都不满足时，才返回 null（结束问卷）
 */

/**
 * 默认最大追问数量
 * 防止无限追问
 */
const MAX_FOLLOWUPS = 3;

/**
 * answers 中哪些 key 视为「已经回答过」
 * unknown 也算回答过（符合你之前的约定）
 */
function isAnswered(answers, key) {
  return Object.prototype.hasOwnProperty.call(answers || {}, key);
}

/**
 * 主调度函数
 *
 * @param {Object} options
 * @param {Object} options.answers         当前所有答案
 * @param {string[]} options.followupKeys  结构化缺口 key（最高优先级）
 * @param {Array} options.needMore          可选：[{ key, questionId, reason }]
 * @param {string[]} options.askedKeys      已经问过的 key（防复读）
 *
 * @returns {Object|null}
 *   { questionId, key, from } 或 null（表示结束）
 */
module.exports = function scheduler(options = {}) {
  const {
    answers = {},
    followupKeys = [],
    needMore = [],
    askedKeys = []
  } = options;

  /**
   * ===== 0. 追问次数上限 =====
   */
  if (Array.isArray(askedKeys) && askedKeys.length >= MAX_FOLLOWUPS) {
    return null;
  }

  /**
   * ===== 1. followupKeys（最高优先级）=====
   * 这是 MVP 的核心
   */
  if (Array.isArray(followupKeys) && followupKeys.length > 0) {
    for (const key of followupKeys) {
      // 已经问过的，不再问
      if (askedKeys.includes(key)) continue;

      // 已经回答过的，不再问
      if (isAnswered(answers, key)) continue;

      return {
        key,
        // MVP 约定：followupKey === questionId
        questionId: key,
        from: 'followupKeys'
      };
    }
  }

  /**
   * ===== 2. needMore（结构化缺口，次高优先级）=====
   * 格式：[{ key, questionId?, reason }]
   */
  if (Array.isArray(needMore) && needMore.length > 0) {
    for (const item of needMore) {
      if (!item || !item.key) continue;

      const key = item.key;
      const questionId = item.questionId || key;

      if (askedKeys.includes(key)) continue;
      if (isAnswered(answers, key)) continue;

      return {
        key,
        questionId,
        from: 'needMore'
      };
    }
  }

  /**
   * ===== 3. 无可追问缺口，结束问卷 =====
   */
  return null;
};
