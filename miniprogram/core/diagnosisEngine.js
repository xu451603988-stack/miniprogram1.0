// miniprogram/core/diagnosisEngine.js
/**
 * V6.0 中医农业·系统辨证引擎 (TCM-Agri Systemic Diagnostic Engine)
 * 核心逻辑依据：《中药农业：中医式植保体系》
 * * 架构：
 * 1. 输入层：望(Visual)、闻(Olfactory)、问(History)、切(Tactile) + 环境数据
 * 2. 辨证层：五邪计算 (Evils) + 体质分析 (Constitution)
 * 3. 决策层：生成病机 (Pathogenesis) + 处方 (Prescription)
 */

const DiagnosticEngine = {

  /**
   * 核心入口函数
   * @param {Object} inputData - 包含 answers (问卷答案) 和 weather (天气/环境)
   * @returns {Object} 完整的诊断报告
   */
  runDiagnosis(inputData) {
    const { answers, weather } = inputData;
    console.log("🔍 V6.0 引擎启动，输入数据:", inputData);

    // 第一步：五邪定量分析 (Quantify Five Evils)
    const evils = this.calculateFiveEvils(answers, weather);

    // 第二步：作物体质辨识 (Identify Constitution)
    const constitution = this.assessConstitution(answers);

    // 第三步：合成系统诊断 (Synthesize Diagnosis)
    const diagnosis = this.synthesizeSyndrome(evils, constitution);

    // 第四步：生成中医式处方 (Generate Prescription)
    const prescription = this.generatePrescription(diagnosis, evils, constitution);

    return {
      type: "tcm_v6",
      syndrome: diagnosis.name,     // 证候名称 (如：湿热下注证)
      pathogenesis: diagnosis.logic, // 病机推演 (故事线)
      evils: evils,                 // 五邪雷达数据
      constitution: constitution,   // 体质数据
      prescription: prescription,   // 系统调理方案
      confidence: diagnosis.confidence
    };
  },

  /**
   * 模块一：五邪计算器
   * 根据《中药农业》4.2节 邪气分类体系
   */
  calculateFiveEvils(answers, weather) {
    let scores = { wind: 0, cold: 0, damp: 0, heat: 0, poison: 0 };
    
    // 1. 湿邪 (Dampness) - [cite: 1808]
    // 依据：连雨、土壤粘重、霉味、酸腐味
    if (weather && weather.rain) scores.damp += 30;
    if (answers.root_smell === 'sour' || answers.root_smell === 'rotten') scores.damp += 40; // 核心证据 [cite: 371]
    if (answers.soil_texture === 'sticky') scores.damp += 20;
    if (answers.root_color === 'black_rotten') scores.damp += 30;

    // 2. 热邪 (Heat) - [cite: 1830]
    // 依据：高温、灼斑、氨味(肥热)
    if (weather && weather.temp > 30) scores.heat += 25;
    if (answers.leaf_symptom === 'scorch' || answers.leaf_symptom === 'spot_red') scores.heat += 30;
    if (answers.root_smell === 'ammonia') scores.heat += 40; // 肥热 [cite: 371]
    
    // 3. 寒邪 (Cold) - [cite: 1783]
    // 依据：低温、根系发红/黑、生长停滞
    if (weather && weather.temp < 15) scores.cold += 30;
    if (answers.root_color === 'reddish' || answers.root_color === 'dark_brown') scores.cold += 25;
    if (answers.growth_status === 'stagnant') scores.cold += 20;

    // 4. 风邪 (Wind) - [cite: 1758]
    // 依据：分布呈带状、突发、害虫群飞
    if (answers.distribution === 'strip' || answers.distribution === 'spotty') scores.wind += 35;
    if (answers.pest_sight === 'swarm') scores.wind += 40;
    
    // 5. 毒邪 (Poison) - [cite: 1852]
    // 依据：近期打药、畸形、刺鼻化学味
    if (answers.history_action === 'pesticide_heavy') scores.poison += 50;
    if (answers.leaf_shape === 'deformed') scores.poison += 30;
    if (answers.soil_smell === 'pungent') scores.poison += 40; // [cite: 407]

    return scores;
  },

  /**
   * 模块二：体质辨识器
   * 根据《中药农业》1.3节 证候体系
   */
  assessConstitution(answers) {
    let stats = { 
      qi_deficiency: 0, // 气虚 (弱)
      yang_excess: 0,   // 阳亢 (旺/徒长)
      stagnation: 0     // 淤滞 (不通)
    };

    // 气虚判据 [cite: 26, 1380]
    if (answers.leaf_thickness === 'thin') stats.qi_deficiency += 30;
    if (answers.leaf_color === 'pale_yellow') stats.qi_deficiency += 25;
    if (answers.root_quantity === 'sparse') stats.qi_deficiency += 30;

    // 阳亢判据 [cite: 66, 1462]
    if (answers.growth_status === 'overgrowth') stats.yang_excess += 40;
    if (answers.leaf_color === 'dark_green') stats.yang_excess += 20;
    if (answers.stem_texture === 'soft_hollow') stats.yang_excess += 20; // 茎软为气虚或徒长

    // 淤滞判据 [cite: 182]
    if (answers.soil_texture === 'hard_block') stats.stagnation += 40; // 板结
    if (answers.root_smell === 'alcohol') stats.stagnation += 30; // 缺氧发酵 [cite: 371]

    // 归一化处理，找出主体质
    const maxVal = Math.max(stats.qi_deficiency, stats.yang_excess, stats.stagnation);
    let mainType = 'balanced'; // 平和质
    if (maxVal > 20) {
      if (maxVal === stats.qi_deficiency) mainType = 'qi_deficiency';
      else if (maxVal === stats.yang_excess) mainType = 'yang_excess';
      else mainType = 'stagnation';
    }

    return { scores: stats, mainType };
  },

  /**
   * 模块三：病机推演 (The Logic Core)
   * 将五邪与体质结合，生成“故事”
   */
  synthesizeSyndrome(evils, constitution) {
    // 找出得分最高的邪气
    const evilEntries = Object.entries(evils).sort((a,b) => b[1] - a[1]);
    const topEvil = evilEntries[0]; // [name, score]
    
    let diagnosisName = "健康微恙";
    let logicText = "系统运行基本平稳，未见明显异常。";
    let confidence = 0;

    // === 逻辑判定树 ===
    
    // 场景 1: 湿邪重 + 淤滞 = 根腐/沤根综合征 [cite: 301]
    if (topEvil[0] === 'damp' && topEvil[1] > 30) {
      diagnosisName = "湿热下注型·根腐综合征";
      confidence = 85;
      logicText = `检测到环境湿气过重（湿邪 ${topEvil[1]}分），且根部有${this._getSmellDesc(evils)}迹象。土壤淤滞导致根系呼吸受阻（气滞），厌氧环境引发了病菌爆发。这不仅是病害，更是根际生态系统的崩塌。`;
    }
    
    // 场景 2: 毒邪重 = 药害/肥害 [cite: 1852]
    else if (topEvil[0] === 'poison' && topEvil[1] > 30) {
      diagnosisName = "急毒攻心型·药肥胁迫";
      confidence = 90;
      logicText = `闻诊与问诊信息显示强烈的化学刺激信号（毒邪 ${topEvil[1]}分）。这不是普通的病害，而是近期投入品（药/肥）使用不当造成的急性中毒，系统正处于免疫崩溃边缘。`;
    }

    // 场景 3: 风邪重 = 虫害/病毒传播 [cite: 1758]
    else if (topEvil[0] === 'wind' && topEvil[1] > 30) {
      diagnosisName = "风邪犯表型·虫媒爆发";
      confidence = 80;
      logicText = `病症呈现明显的带状分布或突发性特征（风邪 ${topEvil[1]}分），这是典型且快速的外部侵袭。需立即阻断传播路径，否则将迅速蔓延全园。`;
    }

    // 场景 4: 气虚 + 寒邪 = 僵苗/冷害 [cite: 1783]
    else if (constitution.mainType === 'qi_deficiency' && evils.cold > 20) {
      diagnosisName = "阳虚寒凝型·生长停滞";
      confidence = 75;
      logicText = `作物自身体质虚弱（气虚），又遭遇低温或根系受寒（寒邪），导致气血运行不畅。表现为生长停滞、僵苗，单纯施肥无法解决，需先提地温。`;
    }

    // 场景 5: 阳亢 + 热邪 = 徒长/日灼 [cite: 1830]
    else if (constitution.mainType === 'yang_excess' && evils.heat > 20) {
      diagnosisName = "火热内扰型·徒长灼伤";
      confidence = 70;
      logicText = `作物前期生长过旺（阳亢），导致组织嫩弱，遇高温强光（热邪）极易发生日灼或萎蔫。这是典型的"外强中干"状态。`;
    }

    return { name: diagnosisName, logic: logicText, confidence };
  },

  /**
   * 模块四：系统处方生成器 (Treatment Plan)
   * 依据《中药农业》4.1.2 祛邪五法 [cite: 1709]
   */
  generatePrescription(diagnosis, evils, constitution) {
    let steps = [];

    // 1. 清 (Clear) - 去除主要矛盾
    if (evils.damp > 30) steps.push({ method: "清湿", action: "立即开沟排水，降低根区湿度，破坏病菌温床。" });
    if (evils.poison > 30) steps.push({ method: "清毒", action: "停止一切农药肥料，大水淋洗根部或喷清水解毒。" });
    if (evils.heat > 30) steps.push({ method: "清热", action: "适当遮阴或傍晚喷水降温，减少蒸腾消耗。" });

    // 2. 泻 (Drain) - 解决实证/淤滞
    if (constitution.mainType === 'yang_excess') steps.push({ method: "泻火", action: "严格控制氮肥，进行控旺修剪，减少无效生长。" });
    if (constitution.mainType === 'stagnation') steps.push({ method: "通滞", action: "中耕松土，打破土壤板结层，恢复根系呼吸。" });

    // 3. 补 (Tonify) - 扶正固本
    if (constitution.mainType === 'qi_deficiency' || evils.cold > 20) {
      steps.push({ method: "补气", action: "淋施含氨基酸/海藻酸的生根剂，通过叶面补充锌、硼等微量元素。" });
    }
    steps.push({ method: "扶正", action: "施用复合微生物菌剂（枯草芽孢杆菌等），重建根际微生态屏障。" }); // 普适性扶正 [cite: 1541]

    // 4. 和 (Harmonize) - 长期调理
    steps.push({ method: "调和", action: "7天后复查，根据新叶生长情况调整水肥比例，保持阴阳平衡。" });

    return steps;
  },

  // --- 辅助函数 ---
  _getSmellDesc(evils) {
    if (evils.damp > 30) return "酸腐/霉味";
    if (evils.poison > 30) return "刺鼻异味";
    if (evils.heat > 30) return "氨味/发酵味";
    return "异常";
  }
};

module.exports = DiagnosticEngine;