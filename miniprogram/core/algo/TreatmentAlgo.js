/**
 * 💊 TreatmentAlgo.js - 处方与农事决策算法 (V6.1)
 * 核心逻辑：基于《中药农业》“扶正祛邪”与“五法治则”
 * * 职责：
 * 1. 生成治则 (Principle)：如“清热燥湿，扶正固本”。
 * 2. 生成方案 (Actions)：具体的农事操作步骤。
 * 3. 适龄修正 (Adjustment)：根据树龄调整药量或操作强度。
 */

const TreatmentAlgo = {

  /**
   * 生成调理方案
   * @param {Object} diagnosis - TCMCalc 输出的中医诊断 { name: '湿热...', desc: '...' }
   * @param {Object} disease - SymptomMatcher 输出的确诊病害 { code: 'root_rot', ... }
   * @param {Object} lifeProfile - 生命算法输出的档案 { stage: 'seedling', ... }
   */
  generate(diagnosis, disease, lifeProfile) {
    console.log("💊 [处方算法] 开始开方...");

    // 1. 确定核心治则 (Principle)
    // 如果有确诊的具体病害，优先治病；否则治未病(调理体质)
    const principle = this._determinePrinciple(diagnosis, disease);

    // 2. 生成基础方案 (Base Actions)
    let actions = this._getActions(diagnosis, disease);

    // 3. 生命周期的适龄修正 (Age Adjustment)
    // 比如：幼苗期禁用烈药，盛果期需保果
    actions = this._adjustByLifeStage(actions, lifeProfile.stage);

    return {
      title: principle.title,    // 标题：清热燥湿方案
      method: principle.method,  // 治法：清、补、和
      steps: actions,            // 步骤数组
      warning: principle.warning // 禁忌提醒
    };
  },

  /**
   * 内部方法：确定治则
   */
  _determinePrinciple(diagnosis, disease) {
    let title = "基础调理方案";
    let method = "和";
    let warning = "";

    // 优先处理具体病害
    if (disease && disease.code) {
      if (['root_rot', 'anthracnose'].includes(disease.code)) {
        title = "清湿祛邪·抢救方案"; method = "清";
      } else if (['freeze_injury'].includes(disease.code)) {
        title = "回阳救逆·防冻方案"; method = "温";
      } else if (['red_spider', 'thrips'].includes(disease.code)) {
        title = "祛风杀虫·阻断方案"; method = "清";
      } else if (['magnesium_def'].includes(disease.code)) {
        title = "滋阴补血·营养方案"; method = "补";
      }
    } 
    // 如果没具体病，按中医证候来
    else if (diagnosis.name.includes("湿热")) {
      title = "清热燥湿调理"; method = "清";
    } else if (diagnosis.name.includes("寒凝")) {
      title = "温经通脉调理"; method = "温";
    }

    return { title, method, warning };
  },

  /**
   * 内部方法：获取具体步骤
   */
  _getActions(diagnosis, disease) {
    const steps = [];
    const dCode = disease ? disease.code : '';
    const syndrome = diagnosis.name;

    // === 场景 1: 根腐/湿热 (重中之重) ===
    if (dCode === 'root_rot' || syndrome.includes("湿热") || syndrome.includes("根腐")) {
      steps.push({ 
        icon: '🌊', 
        name: '清湿', 
        desc: '立即开沟排水，降低根区湿度，扒开根颈部表土晾根。' 
      });
      steps.push({ 
        icon: '💊', 
        name: '祛邪', 
        desc: '淋施精甲·咯菌腈或铜制剂，杀灭土壤活跃病菌。' 
      });
      steps.push({ 
        icon: '🌱', 
        name: '扶正', 
        desc: '7天后淋施枯草芽孢杆菌 + 腐植酸，重建根际防线。' 
      });
    }

    // === 场景 2: 冻害/寒凝 ===
    else if (dCode === 'freeze_injury' || syndrome.includes("寒")) {
      steps.push({ icon: '🔥', name: '温经', desc: '根部培土覆盖，防止冷风直吹根颈。' });
      steps.push({ icon: '💧', name: '补气', desc: '叶面喷施磷酸二氢钾 + 芸苔素内酯，提升抗逆性。' });
      steps.push({ icon: '🛑', name: '禁忌', desc: '受冻期间严禁使用氮肥，以免加重冻害。' });
    }

    // === 场景 3: 虫害 (红蜘蛛等) ===
    else if (dCode === 'red_spider' || syndrome.includes("虫")) {
      steps.push({ icon: '⚔️', name: '杀虫', desc: '选用阿维菌素/乙唑螨腈，重点喷施叶背。' });
      steps.push({ icon: '🔄', name: '轮换', desc: '建议3天后更换机理药剂复打一次，防止卵块孵化。' });
    }

    // === 场景 4: 缺素/虚证 ===
    else if (dCode === 'magnesium_def' || syndrome.includes("虚")) {
      steps.push({ icon: '🩸', name: '补血', desc: '叶面喷施螯合镁/锌微肥，间隔7天连喷2次。' });
      steps.push({ icon: '🌿', name: '养根', desc: '根部冲施海藻酸水溶肥，促进根系吸收能力。' });
    }

    // === 默认兜底 ===
    else {
      steps.push({ icon: '👀', name: '观察', desc: '暂未发现明显病害，建议清理园区杂草，保持通风透光。' });
    }

    return steps;
  },

  /**
   * 内部方法：生命周期修正 (V6.1 核心亮点)
   * 防止"药死"幼苗，防止"毒死"果实
   */
  _adjustByLifeStage(actions, stage) {
    return actions.map(step => {
      // 深拷贝，避免修改原对象
      let newStep = { ...step };

      // 1. 幼苗期修正 (Seedling)
      if (stage === 'seedling') {
        if (newStep.desc.includes("药")) {
          newStep.desc += " (⚠️幼苗药液浓度建议减半)";
        }
        if (newStep.desc.includes("化肥") || newStep.desc.includes("氮肥")) {
          newStep.desc = "幼苗期根系嫩弱，暂缓施用化肥，改用淋施清水或稀薄海藻液。";
        }
      }

      // 2. 盛果期/成熟期修正 (Fruiting/Maturing)
      if (stage === 'fruiting' || stage === 'maturing') {
        // 如果方案里有毒性药，提醒安全间隔期
        if (newStep.name === '祛邪' || newStep.name === '杀虫') {
          newStep.desc += " (⚠️采果前30天严禁使用高毒农药)";
        }
        // 如果方案涉及动土
        if (newStep.desc.includes("开沟") || newStep.desc.includes("松土")) {
          newStep.desc += " (注意：开沟宜浅，避免伤及浮根导致落果)";
        }
      }

      return newStep;
    });
  }
};

module.exports = TreatmentAlgo;