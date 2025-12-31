/**
 * questionBank.js
 *
 * 职责：
 * - questionId / followupKey -> 题面配置
 * - 保证 scheduler 返回的 questionId 一定能取到题
 *
 * MVP 约定：
 * - followupKey === questionId
 * - 若取不到题，页面层负责兜底结束
 */

/**
 * ===== 题库主体 =====
 * key = questionId = followupKey
 */
const QUESTION_BANK = {
  /**
   * ========================
   * 裂果（FRUIT_CRACKING）追问（MVP）
   * ========================
   */

  FRUIT_CRACKING_WATER_SWING: {
    id: 'FRUIT_CRACKING_WATER_SWING',
    key: 'fruit_cracking_water_swing',
    type: 'single',
    title: '最近是否出现过“干旱后突然大雨或猛浇水”？',
    options: [
      { label: '是的，发生过', value: 'yes' },
      { label: '没有', value: 'no' },
      { label: '不确定', value: 'unknown' }
    ]
  },

  FRUIT_CRACKING_SHAPE: {
    id: 'FRUIT_CRACKING_SHAPE',
    key: 'fruit_cracking_shape',
    type: 'single',
    title: '果实裂口更接近哪种形态？',
    options: [
      { label: '果脐周围放射状开裂', value: 'navel' },
      { label: '纵向裂开（从上到下）', value: 'longitudinal' },
      { label: '环状裂口', value: 'ring' },
      { label: '说不清', value: 'unknown' }
    ]
  },

  FRUIT_CRACKING_RATIO: {
    id: 'FRUIT_CRACKING_RATIO',
    key: 'fruit_cracking_ratio',
    type: 'single',
    title: '大约有多少果实出现裂果？',
    options: [
      { label: '少量（<5%）', value: 'low' },
      { label: '比较明显（5–20%）', value: 'medium' },
      { label: '很多（>20%）', value: 'high' },
      { label: '不确定', value: 'unknown' }
    ]
  }

  /**
   * ========================
   * 后续病种在这里继续追加
   * ========================
   */
};

/**
 * 根据 questionId 取题
 *
 * @param {string} questionId
 * @param {Object} ctx 可选上下文（MVP 暂不使用）
 * @returns {Object|null}
 */
function getQuestion(questionId, ctx = {}) {
  if (!questionId) return null;
  return QUESTION_BANK[questionId] || null;
}

/**
 * 可选：暴露所有 questionId
 * 用于开发期校验（rules / followupKeys 是否闭环）
 */
function listAllQuestionIds() {
  return Object.keys(QUESTION_BANK);
}

module.exports = {
  getQuestion,
  listAllQuestionIds
};
