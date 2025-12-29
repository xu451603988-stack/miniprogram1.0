/**
 * 🌳 LifeCycleAlgo.js - 生命周期与体质算法 (V6.1)
 * 核心逻辑：基于《中药农业》“因人制宜”理论
 * * 职责：
 * 1. 根据树龄判定生命阶段 (Life Stage)。
 * 2. 判定先天体质 (Constitution)。
 * 3. 输出易感病害权重 (Susceptibility Weights)。
 */

const LifeCycleAlgo = {
  
  /**
   * 计算生命体质参数
   * @param {Number} treeAge - 树龄 (年)
   * @param {String} variety - 品种 (可选，如 'sugar_orange' 砂糖橘)
   */
  calculate(treeAge, variety = 'common') {
    const age = parseFloat(treeAge) || 0;
    
    // 1. 判定生命阶段
    const stageInfo = this._getStageByAge(age);
    
    // 2. 获取品种修正系数 (预留接口)
    const varietyBias = this._getVarietyBias(variety);

    // 3. 合并计算易感权重 (基础权重 * 品种修正)
    const finalSusceptibility = {};
    Object.keys(stageInfo.susceptibility).forEach(key => {
      // 如果品种有特殊修正就乘上去，否则乘 1
      const bias = varietyBias[key] || 1.0;
      finalSusceptibility[key] = stageInfo.susceptibility[key] * bias;
    });

    console.log(`🌱 [生命算法] 树龄:${age}年 -> 阶段:${stageInfo.stageName} | 体质:${stageInfo.constitution}`);

    return {
      stage: stageInfo.stageKey,       // 阶段代码 (seedling/growing/fruiting/aging)
      stageName: stageInfo.stageName,  // 阶段名称
      constitution: stageInfo.constitution, // 中医体质 (qi_deficiency 等)
      constitutionDesc: stageInfo.desc,     // 体质描述
      susceptibility: finalSusceptibility   // 最终易感权重表
    };
  },

  /**
   * 内部方法：根据树龄划分阶段
   * 依据《中药农业》全周期管理策略
   */
  _getStageByAge(age) {
    // === 阶段 1: 幼苗期 (0-2年) ===
    if (age <= 2.5) {
      return {
        stageKey: 'seedling',
        stageName: '幼苗期',
        constitution: 'qi_deficiency', // 【气虚质】: 稚阴稚阳，根系弱
        desc: '根气未固，不耐寒湿，易受冻害与根腐。',
        susceptibility: {
          cold: 1.5,          // 极怕冷 (寒邪权重 x1.5)
          damp: 1.4,          // 怕涝 (湿邪权重 x1.4)
          root_rot: 1.5,      // 根腐病高发
          nutrient_def: 0.8   // 缺素相对少见 (需求总量小)
        }
      };
    }

    // === 阶段 2: 旺长期 (3-5年) ===
    // 此时树架子刚拉开，长势最猛
    else if (age <= 5.5) {
      return {
        stageKey: 'growing',
        stageName: '旺长期',
        constitution: 'yang_excess', // 【阳亢质】: 阳气过盛，易徒长
        desc: '阳气升发过快，易徒长，枝梢嫩弱易招虫。',
        susceptibility: {
          heat: 1.3,          // 怕热 (易日灼)
          wind: 1.4,          // 怕风/虫 (虫害高发)
          overgrowth: 1.6,    // 极易徒长
          ulcer: 1.2          // 溃疡病 (嫩梢多)
        }
      };
    }

    // === 阶段 3: 盛果期 (6-12年) ===
    // 产量高峰，透支严重
    else if (age <= 12) {
      return {
        stageKey: 'fruiting',
        stageName: '盛果期',
        constitution: 'yin_deficiency', // 【阴虚/气阴两虚】: 消耗大，亏空
        desc: '果实消耗大量阴液，易出现缺素与早衰。',
        susceptibility: {
          nutrient_def: 1.5,  // 缺素高发 (缺镁/锌/硼)
          stagnation: 1.2,    // 易板结 (化肥用多了)
          sunburn: 1.2,       // 日灼 (果实)
          anthracnose: 1.1    // 炭疽 (弱寄生菌)
        }
      };
    }

    // === 阶段 4: 衰老期 (>12年) ===
    else {
      return {
        stageKey: 'aging',
        stageName: '衰老期',
        constitution: 'yang_deficiency', // 【阳虚/淤滞】: 生命力衰退
        desc: '根系老化，气血运行不畅，易发枝干病害。',
        susceptibility: {
          root_rot: 1.4,      // 根腐 (老根抗性差)
          gumming: 1.5,       // 流胶病 (气滞血瘀)
          borer: 1.4,         // 蛀干害虫 (天牛等)
          cold: 1.3           // 怕冷
        }
      };
    }
  },

  /**
   * 内部方法：品种修正 (示例)
   * 即使同龄，不同品种耐受力也不同
   */
  _getVarietyBias(variety) {
    const biasMap = {
      // 砂糖橘：皮薄，更怕冷，更易缺素
      'sugar_orange': {
        cold: 1.2,
        nutrient_def: 1.1
      },
      // 沃柑：长势旺，更易溃疡，更易徒长
      'wo_gan': {
        ulcer: 1.3,
        overgrowth: 1.2,
        cold: 0.9 // 相对耐寒
      },
      // 柚子：根系深，相对耐粗放
      'pomelo': {
        damp: 0.9,
        wind: 0.9
      }
    };

    return biasMap[variety] || {}; // 如果没匹配到，返回空对象(不修正)
  }
};

module.exports = LifeCycleAlgo;