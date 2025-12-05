// miniprogram/utils/newDiagnosticEngine.js
// New Diagnostic Engine v2.0
// Supports: leaf / fruit / root modules
// Exports: diagnose(data) -> returns an object with diagnosis_label, cause_explanation, treatment_recommendation, scores, correctedScores, month

class NewDiagnosticEngineV2 {
  constructor() {
    // 基础映射：把常见症状关键词映射到病害/生理原因类别及基础权重
    // 权重用于累加评分，后续按阈值判定
    this.mappings = {
      leaf: {
        fungal: {
          keywords: ['water_soaked', 'mildew', 'ring', 'brownHalo', 'waterSpot'],
          baseWeight: 3,
          label: '真菌性叶斑病'
        },
        bacterial: {
          keywords: ['local_spots', 'pinSpot'],
          baseWeight: 2,
          label: '细菌性病害'
        },
        viral: {
          keywords: ['mottling', 'mosaic'],
          baseWeight: 4,
          label: '病毒病（花叶斑驳）'
        },
        insect: {
          keywords: ['honeydew', 'insects_visible', 'silver'],
          baseWeight: 4,
          label: '刺吸式害虫（如蚜虫、蓟马）'
        },
        nutrient: {
          keywords: ['interveinal_chlorosis', 'vein_chlorosis', 'whole_yellow', 'baseYellow', 'tipWhite'],
          baseWeight: 3,
          label: '营养缺失/失衡'
        },
        herbicide_phytotoxic: {
          keywords: ['tip_burn'],
          baseWeight: 4,
          label: '药害/药剂烧伤'
        },
        fertilizer_burn: {
          keywords: ['heavy_n', 'tip_burn', 'edgeBurn'],
          baseWeight: 4,
          label: '肥害（氮/盐害）'
        },
        abiotic: {
          keywords: ['cold', 'hot', 'freq_irrig'],
          baseWeight: 1,
          label: '环境/生理性应激'
        }
      },
      fruit: {
        melanose_like: {
          keywords: ['surface_spots', 'concave', 'brownSpot'],
          baseWeight: 3,
          label: '果面病斑（真菌性：黑点/褐斑）'
        },
        greasy_spot: {
          keywords: ['oily_spots'],
          baseWeight: 4,
          label: '油斑病（Greasy spot）'
        },
        sunburn: {
          keywords: ['sunburn'],
          baseWeight: 3,
          label: '日灼/光害'
        },
        cracking: {
          keywords: ['cracking', 'waterCore'],
          baseWeight: 3,
          label: '裂果（生理性：水分冲击或供钙不足）'
        },
        insect_fly: {
          keywords: ['insect_holes', 'flyHole', 'borer'],
          baseWeight: 4,
          label: '果实害虫（果蝇/蛀果）'
        },
        hlb_like: {
          keywords: ['greenBack', 'small_lopsided'],
          baseWeight: 4,
          label: '黄龙病（HLB）相关症状'
        },
        physiological: {
          keywords: ['small', 'big', 'rough'],
          baseWeight: 1,
          label: '生理性/营养性问题'
        }
      },
      root: {
        root_rot: {
          keywords: ['brown_rot', 'black_rot', 'rotting', 'brown'],
          baseWeight: 5,
          label: '根腐病/根系严重坏死'
        },
        anaerobic: {
          keywords: ['flood', 'waterlogged', 'sulfide'],
          baseWeight: 4,
          label: '缺氧/硫化物毒害（积水相关）'
        },
        nematode: {
          keywords: ['nodules'],
          baseWeight: 4,
          label: '线虫/瘤状根病'
        },
        salt_or_alkali: {
          keywords: ['salt', 'soil_white'],
          baseWeight: 3,
          label: '盐碱伤根'
        },
        compaction: {
          keywords: ['compaction', '板结', 'compacted'],
          baseWeight: 3,
          label: '土壤板结/透气差'
        },
        chemical_phytotoxin: {
          keywords: ['soil_drench', 'soil_spray', 'high_conc'],
          baseWeight: 4,
          label: '药剂/土壤毒害'
        }
      }
    };

    // 一些优先规则（强证据）——当满足时直接返回优先诊断
    // 每一项为函数，接收 diagnosticData（含 module、answers、month）
    this.priorityRules = [
      // 叶：花叶 + 扇形分布 -> 病毒
      (d) => {
        if (d.module === 'leaf') {
          const s = d.answers.symptoms || [];
          const dist = d.answers.distribution;
          if (s.includes('mottling') && (dist === 'sectoral' || dist === 'side')) {
            return {
              diagnosis_code: 'viral',
              diagnosis_label: '病害：病毒病（强证据）',
              explanation: '叶片出现花叶斑驳并呈扇形/一侧分布，疑似病毒性病害，建议采样送检并隔离病株。',
              recommendation: {
                acute: ['隔离病株并停止移栽、修剪传播可能部位', '封存疑似传播工具并消毒'],
                mid: ['加强虫害防治，尤其刺吸式害虫', '销毁严重病株，避免萌发感染源'],
                long: ['选用无病苗木并做好苗木检疫', '种植抗病品种并长期监测']
              }
            };
          }
        }
        return null;
      },

      // 果：果面有产卵孔或可见幼虫 -> 果蝇/害虫优先
      (d) => {
        if (d.module === 'fruit') {
          const s = d.answers.fruit_symptoms || [];
          if (s.includes('insect_holes') || s.includes('flyHole')) {
            return {
              diagnosis_code: 'fruit_fly',
              diagnosis_label: '虫害：果蝇/蛀果（强证据）',
              explanation: '果面存在产卵孔或蛀孔，强烈指示实蝇或蛀果昆虫危害。',
              recommendation: {
                acute: ['采收受害果并集中销毁', '使用诱捕器或低毒杀虫剂急防'],
                mid: ['果园卫生管理、清除落果', '释放天敌或使用生物防治'],
                long: ['建立定期诱捕与监测制度']
              }
            };
          }
        }
        return null;
      },

      // 根：根系褐变或黑腐 -> 根腐优先
      (d) => {
        if (d.module === 'root') {
          const rc = d.answers.root_condition || [];
          if (rc.includes('brown_rot') || rc.includes('black_root')) {
            return {
              diagnosis_code: 'root_rot',
              diagnosis_label: '根部：根腐病（强证据）',
              explanation: '根系褐变或黑腐，根腐病几率极高。需立即改善排水并处理根系。',
              recommendation: {
                acute: ['立即排水并切除病根', '撒干土或石灰吸湿并晾晒'],
                mid: ['施用好氧有益微生物修复根际', '补钙、补镁提升根系恢复力'],
                long: ['优化排水系统并改善土壤团粒结构']
              }
            };
          }
        }
        return null;
      }
    ];

    // 默认治疗建议模板（按类别填充）
    this.treatmentTemplates = {
      fungal: {
        acute: ['去除病叶并集中焚烧/深埋', '改善通风降低湿度', '按推荐剂量喷施广谱杀菌剂'],
        mid: ['加强树势恢复，补钙/有机质', '轮换药剂避免抗性'],
        long: ['建立病情监测并优化排水及种植结构']
      },
      bacterial: {
        acute: ['修剪并消毒切口', '按推荐喷施杀菌剂'],
        mid: ['加强树体营养', '清洁果园减少病原库'],
        long: ['苗木检疫与管理']
      },
      viral: {
        acute: ['隔离病株并尽快送检', '清除传播媒介（蚜虫等）'],
        mid: ['更换健康苗木', '加强病害监测'],
        long: ['选育抗病品种与严格检疫']
      },
      insect: {
        acute: ['使用低毒快速见效药剂或诱杀', '清除高密度害虫区域'],
        mid: ['释放天敌/实施物理诱捕', '优化栽培措施降低虫害发生'],
        long: ['实施种植-天敌协同管理']
      },
      nutrient: {
        acute: ['叶面喷施速效微量元素'],
        mid: ['做土壤与叶片检测并按结果调配施肥'],
        long: ['建立长期平衡施肥制度']
      },
      fertilizer_burn: {
        acute: ['立即大量灌水冲淡盐分', '暂停施肥'],
        mid: ['土壤修复（撒石灰/有机质）'],
        long: ['优化施肥方式及频率']
      },
      sunburn: {
        acute: ['遮阳/临时套袋', '避免正午喷药'],
        mid: ['补钙/补水', '合理疏果减轻暴晒'],
        long: ['调整冠形与遮荫措施']
      },
      root_rot: {
        acute: ['及时排水、切除坏根并用消毒剂处理', '撒干土/石灰吸湿'],
        mid: ['施用好氧有益微生物', '补充钙镁、提高根系抗性'],
        long: ['改善排水、增加有机质、避免连作']
      },
      default: {
        acute: ['拍照记录并咨询当地农技人员'],
        mid: ['加强田间管理与施肥调控'],
        long: ['建立监测档案与长期改良计划']
      }
    };

    // 阈值：当某类得分 >= threshold * 总分时判定为主因（0.35）
    this.thresholdRatio = 0.35;
  }

  // 主入口：diagnose(data)
  // data = { crop, month, module, answers }
  diagnose(data) {
    try {
      if (!data || !data.module) {
        return this._getDefaultResult('无效输入：缺少 module 参数');
      }

      const module = data.module;
      const answers = data.answers || {};
      const month = data.month || null;

      // 首先检查优先规则
      for (const rule of this.priorityRules) {
        try {
          const r = rule(data);
          if (r) {
            return this._formatPriorityResult(r, month);
          }
        } catch (e) {
          // 忽略单条规则错误，继续
          console.error('[priorityRule error]', e);
        }
      }

      // 普通规则评分
      const rawScores = this._scoreByMappings(module, answers);

      // 可能的物候/环境校正（这里简单按 month 对 fungal 增减权重，便于扩展）
      const correctedScores = this._applyPhenologyAdjust(module, rawScores, month);

      // 决策：根据 correctedScores 判定最可能原因
      const decision = this._decideFromScores(module, correctedScores);

      // 生成人可读的解释和治疗建议
      const result = this._formatDecisionResult(decision, correctedScores, month);

      return result;
    } catch (err) {
      console.error('[diagnose error]', err);
      return this._getDefaultResult('诊断引擎执行异常');
    }
  }

  // 给定 module, answers -> 返回每个类别的原始分
  _scoreByMappings(module, answers) {
    const moduleMap = this.mappings[module] || {};
    const scores = {};
    // 初始化
    Object.keys(moduleMap).forEach((k) => (scores[k] = 0));

    // 采集所有答案文本（扁平化为数组 of strings）
    const tokens = this._flattenAnswersToTokens(answers);

    // 对每一种映射项加权
    Object.keys(moduleMap).forEach((k) => {
      const cfg = moduleMap[k];
      cfg.keywords.forEach((kw) => {
        if (tokens.includes(kw)) {
          scores[k] += cfg.baseWeight;
        }
      });
    });

    // 事件类额外加权（环境、施肥等）
    // 简单规则示例：heavy_n -> boost fertilizer_burn & nutrient
    if (tokens.includes('heavy_n')) {
      if (scores['fertilizer_burn'] !== undefined) scores['fertilizer_burn'] += 3;
      if (scores['nutrient'] !== undefined) scores['nutrient'] += 2;
    }
    if (tokens.includes('rain')) {
      // 雨后更利于真菌
      if (scores['fungal'] !== undefined) scores['fungal'] += 2;
      if (scores['root_rot'] !== undefined) scores['root_rot'] += 1;
    }
    if (tokens.includes('hot') || tokens.includes('sunnyHot')) {
      if (scores['sunburn'] !== undefined) scores['sunburn'] += 2;
    }
    if (tokens.includes('insect_holes') || tokens.includes('flyHole')) {
      if (scores['insect_fly'] !== undefined) scores['insect_fly'] += 3;
      if (scores['insect'] !== undefined) scores['insect'] += 3;
    }

    return scores;
  }

  // 把 answers 对象扁平化为 tokens 数组（仅存字符串 key/option value）
  _flattenAnswersToTokens(answers) {
    const tokens = [];
    try {
      Object.keys(answers || {}).forEach((k) => {
        const v = answers[k];
        if (Array.isArray(v)) {
          v.forEach((it) => {
            if (typeof it === 'string') tokens.push(it);
          });
        } else if (typeof v === 'string') {
          tokens.push(v);
        } else if (typeof v === 'number') {
          tokens.push(String(v));
        }
      });
    } catch (e) {
      // ignore
    }
    return tokens;
  }

  // 简单按物候 month 调整（示例逻辑，可扩展）
  _applyPhenologyAdjust(module, scores, month) {
    const corrected = Object.assign({}, scores);
    try {
      // 若是夏季高湿（6,7,8），提高真菌 / 根腐权重
      if ([6, 7, 8].includes(Number(month))) {
        if (corrected['fungal'] !== undefined) corrected['fungal'] *= 1.3;
        if (corrected['root_rot'] !== undefined) corrected['root_rot'] *= 1.3;
      }
      // 果实膨大期（9-11）提升裂果、生理问题敏感度
      if ([9, 10, 11].includes(Number(month))) {
        if (corrected['cracking'] !== undefined) corrected['cracking'] *= 1.2;
      }
    } catch (e) {
      // ignore
    }
    return corrected;
  }

  // 根据 correctedScores 做决策
  _decideFromScores(module, correctedScores) {
    // 计算总分（避免数值错误逐位相加）
    let total = 0;
    Object.keys(correctedScores).forEach((k) => {
      const v = Number(correctedScores[k]) || 0;
      total += v;
    });

    // 找到最高项
    let topKey = null;
    let topVal = -Infinity;
    Object.keys(correctedScores).forEach((k) => {
      const v = Number(correctedScores[k]) || 0;
      if (v > topVal) {
        topVal = v;
        topKey = k;
      }
    });

    // 如果总分为0，返回未定
    if (total <= 0 || topVal <= 0) {
      return { decision: 'undetermined', topKey: null, topVal: 0, total };
    }

    // 如果 topVal 占比很大，判定为主因
    const ratio = total === 0 ? 0 : topVal / total;
    if (ratio >= this.thresholdRatio) {
      return { decision: 'single', topKey, topVal, total, ratio };
    }

    // 否则尝试找出前两位，可能为复合因素
    // 找出第二高
    let secondKey = null;
    let secondVal = -Infinity;
    Object.keys(correctedScores).forEach((k) => {
      if (k === topKey) return;
      const v = Number(correctedScores[k]) || 0;
      if (v > secondVal) {
        secondVal = v;
        secondKey = k;
      }
    });

    // 如果前两项之和占比较高，返回 combo
    const topSum = topVal + (secondVal > 0 ? secondVal : 0);
    const topRatio = total === 0 ? 0 : topSum / total;
    if (topRatio >= this.thresholdRatio) {
      return { decision: 'combo', topKey, topVal, secondKey, secondVal, total, ratio: topRatio };
    }

    // 否则返回可疑
    return { decision: 'suspect', topKey, topVal, total, ratio };
  }

  // 将 decision -> 最终结果对象（人可读）
  _formatDecisionResult(decision, correctedScores, month) {
    const res = {
      diagnosis_label: '',
      diagnosis_code: '',
      cause_explanation: '',
      treatment_recommendation: {},
      scores: correctedScores,
      correctedScores: correctedScores,
      month: month || ''
    };

    if (!decision || decision.decision === 'undetermined') {
      res.diagnosis_label = '可疑：无法确定主因';
      res.cause_explanation = '当前提交的症状信息不足以作出明确诊断。建议补充根系、果实或管理历史信息，或拍照咨询专家。';
      res.treatment_recommendation = this.treatmentTemplates.default;
      return res;
    }

    // helper to map key -> human label & choose template
    const pickTemplateByKey = (key) => {
      const moduleMap = this.mappings;
      // traverse modules to find which mapping contains key
      for (const m in moduleMap) {
        if (moduleMap[m][key]) {
          return {
            label: moduleMap[m][key].label || key,
            template: this.treatmentTemplates[key] || this._findTemplateByLabel(moduleMap[m][key].label)
          };
        }
      }
      // fallback
      return { label: key, template: this.treatmentTemplates.default };
    };

    if (decision.decision === 'single') {
      const pick = pickTemplateByKey(decision.topKey);
      res.diagnosis_code = decision.topKey;
      res.diagnosis_label = `主要原因：${pick.label}`;
      res.cause_explanation = `根据症状匹配与权重计算，推断主要原因是 ${pick.label}（评分 ${decision.topVal}，占比 ${(decision.ratio * 100).toFixed(0)}%）。`;
      res.treatment_recommendation = pick.template || this.treatmentTemplates.default;
      return res;
    }

    if (decision.decision === 'combo') {
      const pick1 = pickTemplateByKey(decision.topKey);
      const pick2 = pickTemplateByKey(decision.secondKey);
      res.diagnosis_code = `${decision.topKey}+${decision.secondKey}`;
      res.diagnosis_label = `可能的复合原因：${pick1.label} + ${pick2.label}`;
      res.cause_explanation = `当前症状可能由两种因素叠加引起：${pick1.label}（评分 ${decision.topVal}）与 ${pick2.label}（评分 ${decision.secondVal}）。建议先应急处理高评分原因，再有针对性处理第二原因。`;
      // 合并建议：acute 取两者 acute 合并去重；mid/long 同理
      const mergeLists = (a = [], b = []) => {
        const set = new Set([...(a || []), ...(b || [])]);
        return Array.from(set);
      };
      const t1 = pick1.template || this.treatmentTemplates.default;
      const t2 = pick2.template || this.treatmentTemplates.default;
      res.treatment_recommendation = {
        acute: mergeLists(t1.acute, t2.acute),
        mid: mergeLists(t1.mid, t2.mid),
        long: mergeLists(t1.long, t2.long)
      };
      return res;
    }

    // suspect
    if (decision.decision === 'suspect') {
      const pick = pickTemplateByKey(decision.topKey);
      res.diagnosis_code = decision.topKey || 'suspect';
      res.diagnosis_label = `可疑原因：${pick.label}`;
      res.cause_explanation = `可能与 ${pick.label} 相关，但证据不足（占比 ${(decision.ratio * 100).toFixed(0)}%）。建议拍照或补充问诊信息以明确诊断。`;
      res.treatment_recommendation = pick.template || this.treatmentTemplates.default;
      return res;
    }

    // fallback
    res.diagnosis_label = '未能判断';
    res.cause_explanation = '系统未能基于现有信息判定病因。';
    res.treatment_recommendation = this.treatmentTemplates.default;
    return res;
  }

  // 辅助：按 label 找 template（当 key 不在 template map 中时）
  _findTemplateByLabel(label) {
    // try to find a template that likely matches label keywords
    if (!label) return this.treatmentTemplates.default;
    const low = label.toLowerCase();
    if (low.includes('真菌') || low.includes('菌')) return this.treatmentTemplates.fungal;
    if (low.includes('根腐')) return this.treatmentTemplates.root_rot;
    if (low.includes('虫')) return this.treatmentTemplates.insect;
    if (low.includes('药害') || low.includes('药')) return this.treatmentTemplates.chemical_phytotoxin || this.treatmentTemplates.default;
    if (low.includes('日灼') || low.includes('光')) return this.treatmentTemplates.sunburn;
    if (low.includes('营养') || low.includes('缺')) return this.treatmentTemplates.nutrient;
    return this.treatmentTemplates.default;
  }

  // 优先规则返回的结果格式化
  _formatPriorityResult(ruleResult, month) {
    return {
      diagnosis_label: ruleResult.diagnosis_label || '优先规则诊断',
      diagnosis_code: ruleResult.diagnosis_code || 'priority',
      cause_explanation: ruleResult.explanation || '',
      treatment_recommendation: ruleResult.recommendation || this.treatmentTemplates.default,
      scores: {},
      correctedScores: {},
      month: month || ''
    };
  }

  // 出错或默认返回
  _getDefaultResult(reason) {
    return {
      diagnosis_label: '诊断失败或信息不足',
      diagnosis_code: 'unknown',
      cause_explanation: reason || '系统无法基于当前输入给出诊断结果。',
      treatment_recommendation: this.treatmentTemplates.default,
      scores: {},
      correctedScores: {},
      month: ''
    };
  }
}

// 导出单例
module.exports = new NewDiagnosticEngineV2();
