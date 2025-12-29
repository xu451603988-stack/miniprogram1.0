/**
 * algorithms/index.js
 * --------------------------------------------------
 * 算法层统一出口（Algorithm Layer Facade）
 *
 * 设计原则：
 * - 页面 / orchestrator 不直接调用单个算法文件
 * - 所有算法能力从这里暴露
 * - 方便后续替换 / 上云 / A-B Test
 */

const primaryScoreEngine = require('./primaryScoreEngine');
const riskTagger = require('./riskTagger');

module.exports = {
  /**
   * A 主诊断打分
   * @param {Object} params
   * @param {Object} params.answers
   * @param {Object} params.context
   */
  runPrimary(params = {}) {
    return primaryScoreEngine.run(params);
  },

  /**
   * B 辅风险标签生成
   * @param {Object} params
   * @param {Object} params.answers
   * @param {String} params.primaryCode
   * @param {Object} params.context
   */
  runRiskTags(params = {}) {
    return riskTagger.run(params);
  }
};
