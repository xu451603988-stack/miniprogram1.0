// utils/diagnosticAlgorithm.js

// 算法配置
const DIAGNOSTICS_CONFIG = {
  // 复制您现有的完整配置（phenology_map, dynamic_questions, phenology_correction, weights, diagnosis_templates, priority_rules）
  // 为了简洁，这里只保留结构，您需要粘贴完整配置
  "version": "2.0.0",
  "diagnosis_codes": ["R1","R2","R3","R4","R5","R6","R7","R8","R9","R10","R11","R12"],
  "phenology_map": { /* 您的配置 */ },
  "dynamic_questions": { /* 您的配置 */ },
  "phenology_correction": { /* 您的配置 */ },
  "weights": { /* 您的完整权重矩阵 */ },
  "diagnosis_templates": { /* 您的诊断模板 */ },
  "priority_rules": { /* 您的优先规则 */ }
};

// 算法核心类
class DiagnosticAlgorithm {
  constructor() {
    this.config = DIAGNOSTICS_CONFIG;
  }

  // 获取某月份的问题列表
  getQuestionsForMonth(month) {
    const phenology = this.config.phenology_map[month];
    return this.config.dynamic_questions[phenology] || [];
  }

  // 执行诊断（核心算法）
  diagnose(formData, phenology) {
    const scores = {};
    this.config.diagnosis_codes.forEach(code => scores[code] = 0);
    const weights = this.config.weights;

    // 累加权重（与之前相同的逻辑）
    for (let field in formData) {
      const value = formData[field];
      if (!value || (Array.isArray(value) && value.length === 0)) continue;
      
      if (field === 'recent_event') {
        value.forEach(ev => {
          for (let diag in scores) scores[diag] += weights[field][ev][diag];
        });
      } else {
        for (let diag in scores) scores[diag] += weights[field][value][diag];
      }
    }

    // 物候校正
    const correction = this.config.phenology_correction[phenology];
    const correctedScores = {};
    for (let diag in scores) {
      correctedScores[diag] = Math.round(scores[diag] * correction[diag]);
    }

    // 找出最高分候选
    let maxScore = -1, candidates = [];
    for (let diag in correctedScores) {
      if (correctedScores[diag] > maxScore) {
        maxScore = correctedScores[diag];
        candidates = [diag];
      } else if (correctedScores[diag] === maxScore) {
        candidates.push(diag);
      }
    }

    // 应用优先规则
    if (candidates.length === 1) {
      return { diagnosis: candidates[0], scores, correctedScores };
    }

    // 应用破平规则（与之前相同的逻辑）
    const finalDiagnosis = this.applyPriorityRules(formData, candidates, correctedScores);
    return { diagnosis: finalDiagnosis, scores, correctedScores };
  }

  // 应用优先规则（提取为独立方法）
  applyPriorityRules(formData, candidates, scores) {
    const rules = this.config.priority_rules;
    
    // 规则1：根损伤
    if (formData.root_smell === 'root_rotten' || formData.root_appearance === 'root_black') {
      return scores.R1 >= scores.R2 ? 'R1' : 'R2';
    }
    
    // 规则2：硫化/灰色土
    if (formData.soil_smell === 'soil_sulfur' || formData.soil_texture_touch === 'touch_gray') {
      return 'R2';
    }
    
    // 规则3：农药
    if (formData.recent_event && formData.recent_event.some(ev => 
        ['ev_mixed_pesticide', 'ev_recent_spray'].includes(ev))) {
      return 'R4';
    }
    
    // 规则4：病毒
    if (formData.leaf_symptom === 'variegation') return 'R5';
    
    // 规则5：盐害
    if (formData.soil_texture_touch === 'touch_saltty') return 'R11';
    
    // 规则6：氮肥
    if (candidates.includes('R3') && formData.recent_event && 
        formData.recent_event.includes('ev_heavy_n')) {
      return 'R3';
    }
    
    // 规则7：高温+日灼
    if (formData.recent_event && formData.recent_event.includes('ev_hot') && 
        formData.fruit_symptom === 'fruit_sunburn') {
      return 'R7';
    }
    
    // 规则8：渐进式
    if (formData.onset_speed === 'onset_gradual') {
      const prefer = ["R10","R12","R9"];
      for (let code of prefer) {
        if (candidates.includes(code)) return code;
      }
    }
    
    // 最终破平
    return this.applyTieBreaker(candidates, scores, formData);
  }

  // 最终破平
  applyTieBreaker(candidates, scores, formData) {
    let bestCode = candidates[0];
    let bestWeight = -1;
    
    candidates.forEach(code => {
      let maxFieldWeight = 0;
      for (let field in formData) {
        const value = formData[field];
        if (!value || (Array.isArray(value) && value.length === 0)) continue;
        
        if (field === 'recent_event') {
          value.forEach(ev => {
            maxFieldWeight = Math.max(maxFieldWeight, this.config.weights[field][ev][code]);
          });
        } else {
          maxFieldWeight = Math.max(maxFieldWeight, this.config.weights[field][value][code]);
        }
      }
      if (maxFieldWeight > bestWeight) {
        bestWeight = maxFieldWeight;
        bestCode = code;
      }
    });
    
    const finalPriority = ["R1","R2","R4","R3","R11","R5","R7","R8","R10","R6","R12","R9"];
    for (let code of finalPriority) {
      if (candidates.includes(code)) return code;
    }
    
    return bestCode;
  }

  // 获取问题标题
  getQuestionTitle(field) {
    const titles = {
      leaf_symptom: '叶片主要症状', shoot_status: '梢势表现', fruit_symptom: '果实主要症状',
      soil_smell: '土壤气味（闻诊）', root_smell: '根系气味（切诊）', recent_event: '最近7-14天发生的事件？（可多选）',
      onset_speed: '症状出现速度', field_type: '地块土壤类型', root_appearance: '根系外观（切诊）',
      soil_texture_touch: '土壤触感（切/土证）'
    };
    return titles[field] || field;
  }

  // 获取物候期中文名
  getPhenologyName(phenology) {
    const names = {
      overwinter: '越冬期', budding: '萌芽期', budding_flowering: '春梢+初花期',
      flowering_fruit_drop: '盛花+生理落果期', fruit_drop_summer_rain: '落果+雨季开始',
      summer_rain: '高温多雨疫霉期', flower_induction: '花芽分化期',
      autumn_flush: '秋梢期', fruit_expansion: '果实膨大&转色期'
    };
    return names[phenology] || phenology;
  }
}

// 导出实例
module.exports = new DiagnosticAlgorithm();