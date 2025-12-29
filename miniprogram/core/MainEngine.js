/**
 * 🧠 MainEngine.js - V6.1 核心主控引擎
 * 职责：调度 5 大微算法模块，执行"时空-生命-辨证"全维诊断
 * * 流程：
 * 1. 【算命】LifeCycleAlgo: 定体质 (幼苗/老树)
 * 2. 【算天】EnvironmentAlgo: 定邪气 (长沙/湿冷)
 * 3. 【看病】SymptomMatcher: 查病害 (表象匹配+风险加权)
 * 4. 【把脉】TCMCalc: 定证候 (五邪合参+病机推演)
 * 5. 【开方】TreatmentAlgo: 出方案 (适龄修正)
 */

// 引入 5 大专家模块
const LifeCycleAlgo = require('./algo/LifeCycleAlgo.js');
const EnvironmentAlgo = require('./algo/EnvironmentAlgo.js');
const TCMCalc = require('./algo/TCMCalc.js');
const SymptomMatcher = require('./algo/SymptomMatcher.js');
const TreatmentAlgo = require('./algo/TreatmentAlgo.js');

const MainEngine = {

  /**
   * 启动全维诊断
   * @param {Object} userProfile - 果园档案 { treeAge: 3, variety: 'sugar', location: {...} }
   * @param {Object} userAnswers - 问卷答案 { leaf_color: 'yellow', ... }
   * @param {Object} weatherData - 实时天气 { temp: 15, rain: true ... }
   */
  run(userProfile, userAnswers, weatherData) {
    const startTime = Date.now();
    console.log("🚀 [MainEngine] 诊断启动...");

    // === 第一步：算命 (Life Cycle Analysis) ===
    // 看看这棵树是"身强力壮"还是"老弱病残"
    const lifeProfile = LifeCycleAlgo.calculate(
      userProfile.treeAge, 
      userProfile.variety
    );

    // === 第二步：算天 (Environment Analysis) ===
    // 看看老天爷在帮倒忙还是在帮忙
    const envProfile = EnvironmentAlgo.calculate(
      userProfile.location, 
      weatherData
    );

    // === 综合风险画像 (Risk Profile) ===
    // 将"体质易感"与"环境邪气"结合，传给后续模块
    const riskProfile = {
      susceptibility: lifeProfile.susceptibility, // 易感权重
      envEvils: envProfile.envEvils               // 环境邪气
    };

    // === 第三步：看病 (Symptom Matching) ===
    // 结合风险画像，匹配具体病害 (如：红蜘蛛、炭疽病)
    // 返回一个排序后的疑似病害列表
    const diseaseList = SymptomMatcher.match(userAnswers, riskProfile);
    const topDisease = diseaseList.length > 0 ? diseaseList[0] : null;

    if (topDisease) {
      console.log(`🍂 [初诊] 疑似病害: ${topDisease.name} (置信度:${topDisease.prob}%)`);
    }

    // === 第四步：把脉 (TCM Dialectic) ===
    // 不管有没有确诊具体病害，都要进行"五邪辨证"
    // 比如：虽然不像红蜘蛛，但是"湿热重"，也要治湿热
    const tcmResult = TCMCalc.analyze(
      userAnswers, 
      envProfile.envEvils, 
      lifeProfile
    );
    console.log(`👃 [辨证] 核心病机: ${tcmResult.diagnosis.name}`);

    // === 第五步：开方 (Treatment Generation) ===
    // 根据确诊病害(优先) 或 中医证候(兜底)，生成方案
    // 并根据树龄(lifeProfile)自动调整药量
    const prescription = TreatmentAlgo.generate(
      tcmResult.diagnosis, 
      topDisease, 
      lifeProfile
    );

    const endTime = Date.now();
    console.log(`✅ [MainEngine] 诊断完成，耗时 ${endTime - startTime}ms`);

    // === 最终报告组装 ===
    return {
      success: true,
      timestamp: endTime,
      
      // 1. 基础结论
      mainDiagnosis: topDisease ? topDisease.name : tcmResult.diagnosis.name, // 主病名
      diagnosisDesc: topDisease ? 
        `综合判定为【${topDisease.name}】。${tcmResult.diagnosis.desc}` : 
        tcmResult.diagnosis.desc,
      
      confidence: topDisease ? topDisease.prob : 80,
      
      // 2. 详细数据 (用于前端展示雷达图、标签等)
      tags: [
        lifeProfile.stageName,          // 标签1: 幼苗期
        envProfile.phenology.name,      // 标签2: 萌芽期
        tcmResult.diagnosis.name        // 标签3: 湿热下注证
      ],
      
      details: {
        diseaseList: diseaseList,       // 疑似病害排名前3
        evils: tcmResult.evils,         // 五邪雷达数据
        constitution: tcmResult.constitution // 体质数据
      },

      // 3. 调理方案
      prescription: prescription,
      
      // 4. 农事预警 (来自环境算法)
      warning: envProfile.warning
    };
  }
};

module.exports = MainEngine;