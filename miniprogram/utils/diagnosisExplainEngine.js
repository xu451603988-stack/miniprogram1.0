/**
 * 诊断解释生成器
 * 作用：
 * - 把“算法结论”翻译成人话
 * - 告诉用户：为什么是这个结果
 */

const symptomMap = require("../data/symptomMap");
const symptomChain = require("../data/symptomChain");

/**
 * 生成解释文本
 * @param {Object} mainResult   排名第一的结果 { target, score }
 * @param {Array} selectedSymptoms symptomKey 数组
 * @param {String} stage 物候期
 */
function generateDiagnosisExplain(mainResult, selectedSymptoms = [], stage = "all") {
  if (!mainResult) return "暂无足够信息生成诊断解释。";

  const target = mainResult.target;

  /* 1️⃣ 找出命中的症状链 */
  const hitChains = symptomChain.filter(chain => {
    if (!chain.enabled) return false;
    if (chain.target !== target) return false;
    if (chain.stage[0] !== "all" && !chain.stage.includes(stage)) return false;

    return chain.symptomKeys.every(key =>
      selectedSymptoms.includes(key)
    );
  });

  /* 2️⃣ 找出与该结论最相关的症状 */
  const relatedSymptoms = symptomMap.filter(item =>
    selectedSymptoms.includes(item.symptomKey)
  );

  /* 3️⃣ 生成解释文本 */
  let explain = `系统判断当前最可能的问题为【${translateTarget(target)}】，主要依据如下：\n`;

  if (hitChains.length > 0) {
    const chain = hitChains[0];
    explain += `\n🔗 命中了专家经验模式：${chain.chainName}。\n`;
  }

  if (relatedSymptoms.length > 0) {
    explain += `\n📌 你选择的关键症状包括：\n`;
    relatedSymptoms.forEach(item => {
      explain += `- ${item.questionText}\n`;
    });
  }

  explain += `\n🌱 结合当前物候期（${translateStage(stage)}），该类问题在此阶段更容易表现出来。`;

  return explain;
}

/* =========================
 * 辅助翻译函数
 * ========================= */

function translateTarget(target) {
  const map = {
    nitrogen_def: "缺氮",
    magnesium_def: "缺镁",
    iron_def: "缺铁",
    calcium_def: "缺钙",
    boron_def: "缺硼",
    root_absorption_problem: "根系吸收障碍",
    nutrition_imbalance: "营养失衡",
    possible_disease_or_stress: "病害或环境胁迫风险"
  };

  return map[target] || target;
}

function translateStage(stage) {
  const map = {
    shooting: "新梢期",
    flowering: "开花期",
    fruiting: "幼果期",
    expansion: "膨果期",
    coloring: "转色期",
    all: "当前生长阶段"
  };

  return map[stage] || stage;
}

module.exports = {
  generateDiagnosisExplain
};
