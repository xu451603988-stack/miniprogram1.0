// miniprogram/domain/diagnosisEngine.js
const expertDictionary = require('./dictionary/expertDictionary');
const treatmentPlans = require('./plans/treatmentPlans');

// 你的算法入口（你现在用的是 citrus/index.js）
const citrusAlgo = require('./algorithms/citrus'); // 这里是 require('../algorithms/citrus') 那种的话就保持一致

function pick(obj, key, fallback = null) {
  return (obj && obj[key]) ? obj[key] : fallback;
}

module.exports = {
  /**
   * answers: question页收集的 answers（可能包含 orchard / symptoms / environment / management...）
   * returns: { syndromeKey, confidence, reasons, dictionary, plans }
   */
  run(answers = {}) {
    // 1) 算法先跑出 syndromeKey（证型键）
    const algoRes = citrusAlgo.evaluate ? citrusAlgo.evaluate(answers) : citrusAlgo(answers);

    const syndromeKey = algoRes.syndromeKey || algoRes.syndrome || 'nutrition_imbalance';
    const confidence = Number(algoRes.confidence || 0.6);
    const reasons = algoRes.reasons || algoRes.details || [];

    // 2) 查词典（专家辩证）
    const dict = pick(expertDictionary, syndromeKey, {
      name: "未收录证型",
      brief: "该证型暂未在词典库中配置。",
      expertPoints: [],
      commonTriggers: [],
      typicalSigns: []
    });

    // 3) 查方案（病/虫/肥三条线）
    const plans = pick(treatmentPlans, syndromeKey, {
      disease: [],
      pest: [],
      nutrition: []
    });

    return {
      syndromeKey,
      syndromeName: dict.name || syndromeKey,
      confidence,
      reasons,
      dictionary: dict,
      plans
    };
  }
};
