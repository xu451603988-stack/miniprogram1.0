/**
 * 🍂 SymptomMatcher.js - 表象与病害匹配算法 (V6.1)
 * 核心逻辑：基于“症状-病因”映射与“环境-体质”动态加权
 * * 职责：
 * 1. 症状映射 (Mapping)：将问卷选项映射到具体病害。
 * 2. 风险加权 (Weighting)：结合 LifeCycle(易感) 和 Environment(邪气) 调整得分。
 * 3. 排序输出 (Ranking)：输出疑似病害列表。
 */

const SymptomMatcher = {

  /**
   * 运行匹配逻辑
   * @param {Object} answers - 用户问卷答案
   * @param {Object} riskProfile - 综合风险画像 (包含易感权重、环境邪气)
   * 结构示例: { susceptibility: { cold: 1.5, ... }, envEvils: { damp: 80 } }
   */
  match(answers, riskProfile) {
    console.log("🍂 [表象算法] 开始匹配病害...", riskProfile);
    
    // 1. 获取病害规则库 (可按作物动态加载，这里以柑橘为例)
    const rules = this._getDiseaseRules();
    
    const results = [];

    // 2. 遍历规则进行打分
    rules.forEach(rule => {
      let score = 0;
      let hitReasons = []; // 命中原因记录

      // --- A. 基础症状匹配 (Base Matching) ---
      // 遍历该病害的所有特征，看用户中了几个
      rule.features.forEach(feat => {
        const userVal = answers[feat.key]; // 用户填的答案
        if (userVal && feat.values.includes(userVal)) {
          score += feat.weight;
          hitReasons.push(feat.desc || userVal);
        }
      });

      // 如果连一个基础症状都没中，直接跳过
      if (score === 0) return;

      // --- B. 风险动态加权 (Dynamic Weighting) ---
      // 核心逻辑：如果环境或体质适合该病发生，分数乘系数
      
      // 1. 环境邪气加成 (如：湿气重 -> 炭疽病加分)
      if (rule.envFactor && riskProfile.envEvils) {
        const envScore = riskProfile.envEvils[rule.envFactor] || 0;
        if (envScore > 40) { // 邪气值门槛
          const boost = 1 + (envScore / 200); // 比如 80分 -> 1.4倍
          score *= boost;
          hitReasons.push(`环境${this._getEvilName(rule.envFactor)}助长`);
        }
      }

      // 2. 体质易感加成 (如：幼苗 -> 冻害加分)
      if (rule.susceptFactor && riskProfile.susceptibility) {
        const susWeight = riskProfile.susceptibility[rule.susceptFactor] || 1;
        if (susWeight > 1) {
          score *= susWeight;
          hitReasons.push(`处于${this._getSusceptName(rule.susceptFactor)}易感期`);
        }
      }

      // --- C. 互斥逻辑 (Veto) ---
      // 如果用户明确说"没看到虫"，那么虫害分直接归零
      if (rule.vetoKey && answers[rule.vetoKey]) {
         const userVetoVal = answers[rule.vetoKey];
         if (rule.vetoValues.includes(userVetoVal)) {
           score = 0; // 一票否决
         }
      }

      if (score > 10) { // 最低阈值
        results.push({
          code: rule.code,
          name: rule.name,
          score: Math.round(score),
          prob: this._calculateProb(score), // 转为百分比
          reasons: hitReasons
        });
      }
    });

    // 3. 排序返回
    return results.sort((a, b) => b.score - a.score);
  },

  // === 内部方法：病害规则库 (配置中心) ===
  // 以后新增病害只需改这里
  _getDiseaseRules() {
    return [
      {
        code: 'anthracnose',
        name: '炭疽病',
        envFactor: 'damp', // 喜湿
        susceptFactor: 'anthracnose', // 易感期：盛果/转色
        features: [
          { key: 'leaf_symptom', values: ['scorch', 'spot_red'], weight: 30, desc: '叶片病斑' },
          { key: 'leaf_color', values: ['pale_yellow'], weight: 10 },
          { key: 'distribution', values: ['patchy_low', 'universal'], weight: 15 } // 低洼易发
        ]
      },
      {
        code: 'red_spider',
        name: '红蜘蛛',
        envFactor: 'heat', // 喜热干
        susceptFactor: 'wind', // 怕风/虫
        vetoKey: 'pest_sight', // 互斥：如果没看到虫
        vetoValues: ['none'],  // 值为 none 时否决
        features: [
          { key: 'leaf_color', values: ['pale_yellow', 'grey'], weight: 25, desc: '叶色失绿灰白' },
          { key: 'pest_sight', values: ['swarm'], weight: 60, desc: '目击虫体' }, // 铁证
          { key: 'leaf_thickness', values: ['deformed'], weight: 20 }
        ]
      },
      {
        code: 'root_rot',
        name: '根腐病',
        envFactor: 'damp', // 喜湿
        susceptFactor: 'root_rot', // 易感期：幼苗/衰老
        features: [
          { key: 'root_smell', values: ['sour', 'rotten'], weight: 80, desc: '根部异味' }, // 铁证
          { key: 'leaf_color', values: ['pale_yellow'], weight: 15 }, // 地上黄化
          { key: 'soil_texture', values: ['sticky'], weight: 20 } // 粘土
        ]
      },
      {
        code: 'freeze_injury',
        name: '低温冻害',
        envFactor: 'cold', // 喜冷
        susceptFactor: 'cold', // 易感期：幼苗
        features: [
          { key: 'leaf_color', values: ['reddish', 'withered'], weight: 40, desc: '叶片紫红/干枯' },
          { key: 'growth_status', values: ['stagnant'], weight: 30, desc: '停止生长' },
          { key: 'root_color', values: ['reddish'], weight: 20 }
        ]
      },
      {
        code: 'magnesium_def',
        name: '缺镁症',
        // 缺素通常与环境短期关系不大，主要看树龄
        susceptFactor: 'nutrient_def', // 易感期：盛果期
        features: [
          { key: 'leaf_color', values: ['pale_yellow', 'v_shape'], weight: 50, desc: '老叶V型黄化' },
          { key: 'leaf_thickness', values: ['thin'], weight: 10 }
        ]
      }
    ];
  },

  // 辅助：Sigmoid 分数转概率
  _calculateProb(score) {
    // 简单线性转换或 S 曲线，这里用简单版
    return Math.min(99, Math.round(score > 100 ? 99 : score)); 
  },

  _getEvilName(key) {
    const map = { damp: '湿邪', heat: '热邪', cold: '寒邪', wind: '风邪' };
    return map[key] || '';
  },

  _getSusceptName(key) {
    const map = { cold: '怕冷', root_rot: '根系脆弱', nutrient_def: '养分透支', wind: '嫩梢' };
    return map[key] || '敏感';
  }
};

module.exports = SymptomMatcher;