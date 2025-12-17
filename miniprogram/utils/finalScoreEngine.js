/**
 * 最终评分引擎（Final Score Engine）
 *
 * 三重权重融合模型：
 * 1️⃣ 症状基础权重（symptom weight）
 * 2️⃣ 环境 / 土壤 / 气候权重（environment weight）
 * 3️⃣ 症状链专家加成（symptom chain bonus）
 *
 * 输出：排序后的诊断结果（最可能 → 最不可能）
 */

const symptomMap = require("../data/symptomMap");
const symptomChain = require("../data/symptomChain");

/* =========================
 * 一、基础症状权重表
 * ========================= */
const BASE_SYMPTOM_WEIGHT = {
  very_high: 5,
  high: 4,
  medium: 3,
  low: 2
};

/* =========================
 * 二、目标初始分（避免冷启动）
 * ========================= */
const BASE_TARGET_SCORE = {
  nitrogen_def: 10,
  magnesium_def: 10,
  iron_def: 10,
  calcium_def: 10,
  boron_def: 10,
  root_absorption_problem: 8,
  nutrition_imbalance: 8,
  possible_disease_or_stress: 6
};

/* =========================
 * 三、环境权重（可外接 climateImpactMap）
 * ========================= */
function calcEnvironmentWeight(env = {}) {
  let factor = 1.0;

  // 连续降雨 → 根系问题权重上升
  if (env.continuousRain) factor += 0.15;

  // 低温 → 吸收能力下降
  if (env.lowTemperature) factor += 0.10;

  // 土壤黏重
  if (env.heavySoil) factor += 0.10;

  return factor;
}

/* =========================
 * 四、核心执行函数
 * ========================= */

/**
 * @param {Array} selectedSymptoms  用户选择的 symptomKey 数组
 * @param {Object} env              环境参数（可选）
 * @param {String} stage            当前物候期
 * @returns {Array}                 排序后的诊断结果
 */
function calculateFinalScores(selectedSymptoms = [], env = {}, stage = "all") {

  const scores = {};

  /* ---------- 1️⃣ 初始化目标分 ---------- */
  Object.keys(BASE_TARGET_SCORE).forEach(target => {
    scores[target] = BASE_TARGET_SCORE[target];
  });

  /* ---------- 2️⃣ 症状基础加分 ---------- */
  selectedSymptoms.forEach(symptomKey => {
    const symptom = symptomMap.find(
      s => s.symptomKey === symptomKey && s.enabled
    );
    if (!symptom) return;

    const weight = BASE_SYMPTOM_WEIGHT[symptom.weightHint] || 1;

    // 症状本身并不直接指向 target，这里只是累计基础分
    Object.keys(scores).forEach(target => {
      scores[target] += weight;
    });
  });

  /* ---------- 3️⃣ 症状链专家加成 ---------- */
  symptomChain.forEach(chain => {
    if (!chain.enabled) return;
    if (chain.stage[0] !== "all" && !chain.stage.includes(stage)) return;

    const hit = chain.symptomKeys.every(key =>
      selectedSymptoms.includes(key)
    );

    if (hit) {
      const bonus =
        chain.baseBonus * chain.confidence;

      scores[chain.target] =
        (scores[chain.target] || 0) * bonus;
    }
  });

  /* ---------- 4️⃣ 环境权重修正 ---------- */
  const envFactor = calcEnvironmentWeight(env);

  Object.keys(scores).forEach(target => {
    scores[target] = scores[target] * envFactor;
  });

  /* ---------- 5️⃣ 排序输出 ---------- */
  const result = Object.keys(scores)
    .map(target => ({
      target,
      score: Number(scores[target].toFixed(2))
    }))
    .sort((a, b) => b.score - a.score);

  return result;
}

/* =========================
 * 五、对外暴露接口
 * ========================= */
module.exports = {
  calculateFinalScores
};
