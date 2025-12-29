/**
 * 👃 TCMCalc.js - 中医辨证算法 (V6.1)
 * 核心逻辑：基于《中药农业》“四诊合参”与“三因制宜”
 * * 职责：
 * 1. 五邪定量 (Quantify Evils)：结合环境与症状，计算风寒湿热毒。
 * 2. 体质辨识 (Constitution)：根据茎叶根土特征，判断气虚/阳亢/淤滞。
 * 3. 核心病机 (Main Pathogenesis)：输出最终的“证候诊断”。
 */

const TCMCalc = {

  /**
   * 运行辨证分析
   * @param {Object} answers - 用户问卷答案 (root_smell, soil_texture...)
   * @param {Object} envEvils - 环境算法输出的邪气值 (cold: 80, damp: 0...)
   * @param {Object} lifeProfile - 生命算法输出的体质与易感权重
   */
  analyze(answers, envEvils, lifeProfile) {
    console.log("👃 [辨证算法] 开始会诊...");

    // 1. 计算体质 (Constitution)
    // 判断作物此刻是"虚"还是"实"，是"通"还是"滞"
    const constitution = this._assessConstitution(answers, lifeProfile.constitution);

    // 2. 计算五邪总分 (Total Evils)
    // 公式：(环境邪气 + 症状邪气) * 易感权重
    const totalEvils = this._calculateTotalEvils(answers, envEvils, lifeProfile.susceptibility);

    // 3. 推导核心证候 (Syndrome Differentiation)
    // 找出得分最高的矛盾点，定性
    const syndrome = this._determineSyndrome(totalEvils, constitution);

    return {
      constitution: constitution, // { type: 'qi_deficiency', score: 40 }
      evils: totalEvils,          // { damp: 85, heat: 20 ... }
      diagnosis: syndrome         // { name: '湿热下注证', desc: '...' }
    };
  },

  /**
   * 内部方法：计算五邪总分
   */
  _calculateTotalEvils(answers, envEvils, weights) {
    // 初始分 = 环境分 (天注定)
    let scores = { 
      wind: envEvils.wind || 0, 
      cold: envEvils.cold || 0, 
      damp: envEvils.damp || 0, 
      heat: envEvils.heat || 0, 
      poison: 0 // 毒邪通常来自人为，与天气无关
    };

    // === 症状加分 (闻诊/切诊/问诊) ===
    
    // 1. 湿邪 (Dampness) - 核心证据：酸馊味、粘土、低洼
    if (answers.root_smell === 'sour' || answers.root_smell === 'rotten') scores.damp += 50; // 铁证
    if (answers.soil_texture === 'sticky') scores.damp += 20;
    if (answers.distribution === 'patchy_low') scores.damp += 15; // 低洼积水

    // 2. 热邪 (Heat) - 核心证据：氨味、焦枯
    if (answers.root_smell === 'ammonia') scores.heat += 40; // 肥热
    if (answers.leaf_symptom === 'scorch') scores.heat += 20;

    // 3. 寒邪 (Cold) - 核心证据：红根、僵苗
    if (answers.root_color === 'reddish') scores.cold += 30;
    if (answers.growth_status === 'stagnant') scores.cold += 20;

    // 4. 风邪 (Wind) - 核心证据：虫群、带状分布
    if (answers.pest_sight === 'swarm') scores.wind += 50;
    if (answers.distribution === 'strip') scores.wind += 30;

    // 5. 毒邪 (Poison) - 核心证据：药害史、畸形、刺鼻味
    if (answers.history_action === 'pesticide_heavy') scores.poison += 60;
    if (answers.soil_smell === 'pungent') scores.poison += 40;
    if (answers.leaf_shape === 'deformed') scores.poison += 20;

    // === 权重修正 (因人制宜) ===
    // 比如：幼苗怕寒，所以寒邪分要放大
    Object.keys(scores).forEach(key => {
      if (weights[key]) {
        scores[key] *= weights[key];
      }
    });

    return scores;
  },

  /**
   * 内部方法：评估体质
   */
  _assessConstitution(answers, congenitalType) {
    let stats = { 
      qi_deficiency: 0, // 气虚
      yang_excess: 0,   // 阳亢
      stagnation: 0     // 淤滞
    };

    // 1. 望/切诊加分
    // 气虚：叶薄、色淡、根少
    if (answers.leaf_thickness === 'thin') stats.qi_deficiency += 20;
    if (answers.leaf_color === 'pale_yellow') stats.qi_deficiency += 20;
    
    // 阳亢：徒长、茎软中空、色浓黑
    if (answers.growth_status === 'overgrowth') stats.yang_excess += 30;
    if (answers.leaf_color === 'dark_green') stats.yang_excess += 15;

    // 淤滞：土硬、根黑、酒味
    if (answers.soil_texture === 'hard_block') stats.stagnation += 30;
    if (answers.root_smell === 'alcohol') stats.stagnation += 25;

    // 2. 结合先天体质 (LifeCycleAlgo 算出来的)
    // 先天不足，后天更容易虚
    if (congenitalType && stats[congenitalType] !== undefined) {
      stats[congenitalType] += 15; // 基础分
    }

    // 3. 判定当前主导态
    let mainType = 'balanced'; // 默认平和
    let maxScore = 0;
    
    Object.entries(stats).forEach(([type, score]) => {
      if (score > maxScore && score > 20) { // 阈值20
        maxScore = score;
        mainType = type;
      }
    });

    return { type: mainType, score: maxScore };
  },

  /**
   * 内部方法：定证候 (Final Diagnosis)
   */
  _determineSyndrome(evils, constitution) {
    // 排序找出最大的邪气
    const topEvil = Object.entries(evils).sort((a,b) => b[1] - a[1])[0]; // [name, score]
    const evilName = topEvil[0];
    const evilScore = topEvil[1];

    let name = "健康微恙";
    let desc = "各项指标基本正常，请继续保持。";

    // === 逻辑判定决策树 ===
    
    if (evilName === 'poison' && evilScore > 40) {
      name = "急毒攻心·药肥胁迫证";
      desc = "检测到强烈的化学刺激信号，判定为近期投入品（农药/化肥）使用不当造成的急性中毒。";
    }
    else if (evilName === 'damp' && evilScore > 40) {
      if (constitution.type === 'stagnation') {
        name = "湿热淤滞·根腐综合征";
        desc = "土壤透气性差导致气滞，加之湿邪困脾（根），引发厌氧发酵。这是根腐病爆发的前兆。";
      } else {
        name = "湿邪困脾·沤根证";
        desc = "水分过多导致根系呼吸受阻，出现缺氧性黄化。";
      }
    }
    else if (evilName === 'cold' && evilScore > 40) {
      name = "寒凝血瘀·僵苗证";
      desc = "低温或冷水灌溉导致根系收缩，气血运行不畅，作物进入'假死'防御状态。";
    }
    else if (evilName === 'wind' && evilScore > 40) {
      name = "风邪犯表·虫媒爆发证";
      desc = "病害呈带状或点片状快速扩散，这是典型虫害或病毒病特征，需立即切断传播源。";
    }
    else if (constitution.type === 'qi_deficiency' && evilScore < 30) {
      name = "气血两虚·早衰证";
      desc = "虽无明显外邪，但作物自身体质虚弱，根系吸收能力差，导致叶片黄化、无光泽。";
    }

    return { name, desc, riskScore: evilScore };
  }
};

module.exports = TCMCalc;