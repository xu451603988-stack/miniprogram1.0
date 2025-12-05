// miniprogram/utils/diagnosticEngine.js
// 纯 JS 实现，适用于微信小程序 require
// 输出只包含 safeFields: diagnosis_label, cause_explanation, treatment_recommendation

const fruitWeights = require('./fruit_weights.json');
const leafWeights = require('./leaf_weights.json');
const pheno = require('./phenology_correction.json');
const priorityConfig = require('./priority_rules.json');

class DiagnosticEngine {
  constructor() {
    // threshold ratios (可配置)
    this.FRUIT_RATIO = (fruitWeights.thresholdRatio || 1.3);
    this.LEAF_RATIO = (leafWeights.thresholdRatio || 1.2);
    this.PHENO_MAP = pheno.mapping || {};
    this.PHENO_CORR = pheno.corrections || {};
  }

  // public entrypoints
  diagnose(payload) {
    // payload should contain crop, month, recent_events, leaf or fruit...
    if (payload.fruit) {
      return this._safeOutput(this._diagnoseFruit(payload));
    } else if (payload.leaf) {
      return this._safeOutput(this._diagnoseLeaf(payload));
    } else {
      return this._safeOutput({
        diagnosis_label: "错误：缺少 leaf 或 fruit 数据",
        cause_explanation: "请上传结构化问卷数据（leaf 或 fruit 字段）",
        treatment_recommendation: { acute: [], mid: [], long: [] }
      });
    }
  }

  // ---------- Fruit ----------
  _diagnoseFruit(payload) {
    const month = Number(payload.month) || 1;
    const phenology = this.PHENO_MAP[String(month)] || 'overwinter';
    const features = this._extractFruitFeatures(payload);

    // 1. priority rules
    const pr = this._checkPriority('fruit', payload, features);
    if (pr) return pr;

    // 2. init scores
    const pathogenScores = this._initScores(fruitWeights.pathogen_classes);
    const physioScores = this._initScores(fruitWeights.physio_classes);

    // 3. accumulate
    features.forEach(f => {
      const cfg = (fruitWeights.features && fruitWeights.features[f]);
      if (!cfg) return;
      // pathogen
      if (cfg.pathogen) {
        Object.keys(cfg.pathogen).forEach(k => pathogenScores[k] = (pathogenScores[k]||0) + Number(cfg.pathogen[k]));
      }
      // physio
      if (cfg.physio) {
        Object.keys(cfg.physio).forEach(k => physioScores[k] = (physioScores[k]||0) + Number(cfg.physio[k]));
      }
    });

    // 4. apply phenology correction
    this._applyPhenologyCorrection(pathogenScores, phenology);
    this._applyPhenologyCorrection(physioScores, phenology);

    // 5. decision by ratio
    const maxPathVal = this._maxValue(pathogenScores);
    const maxPhysVal = this._maxValue(physioScores);
    const topPath = this._topKey(pathogenScores);
    const topPhys = this._topKey(physioScores);

    if (maxPathVal >= this.FRUIT_RATIO * maxPhysVal && maxPathVal > 0) {
      return this._formatFruitResult('pathogen', topPath, pathogenScores, physioScores);
    } else if (maxPhysVal >= this.FRUIT_RATIO * maxPathVal && maxPhysVal > 0) {
      return this._formatFruitResult('physio', topPhys, pathogenScores, physioScores);
    } else {
      return {
        diagnosis_label: "可疑：需进一步判定",
        cause_explanation: "当前证据不充分区分病原与生理性原因，建议拍照或送样化验。",
        treatment_recommendation: {
          acute: ["暂停刺激性操作（施肥/大水/剪叶等）", "拍照并上传或联系农技员"],
          mid: ["采样送检测", "按防治经验采取临时保护性措施"],
          long: ["记录发病时间与天气，后续用作权重调整"]
        },
        diagnosis_code: "ambiguous",
        confidence: 0.5
      };
    }
  }

  // ---------- Leaf ----------
  _diagnoseLeaf(payload) {
    const month = Number(payload.month) || 1;
    const phenology = this.PHENO_MAP[String(month)] || 'overwinter';
    const features = this._extractLeafFeatures(payload);

    // 1. priority rules
    const pr = this._checkPriority('leaf', payload, features);
    if (pr) return pr;

    // 2. init scores
    const nutritionScores = this._initScores(leafWeights.nutrition_classes);
    const pathogenScores = this._initScores(leafWeights.pathogen_classes);

    // 3. accumulate
    features.forEach(f => {
      const cfg = (leafWeights.features && leafWeights.features[f]);
      if (!cfg) return;
      if (cfg.nutrition) {
        Object.keys(cfg.nutrition).forEach(k => nutritionScores[k] = (nutritionScores[k]||0) + Number(cfg.nutrition[k]));
      }
      if (cfg.pathogen) {
        Object.keys(cfg.pathogen).forEach(k => pathogenScores[k] = (pathogenScores[k]||0) + Number(cfg.pathogen[k]));
      }
    });

    // 4. apply phenology correction
    this._applyPhenologyCorrection(nutritionScores, phenology);
    this._applyPhenologyCorrection(pathogenScores, phenology);

    // 5. priority rules already checked; now decision
    const totalNut = this._sumValues(nutritionScores);
    const maxPath = this._maxValue(pathogenScores);
    const topNut = this._topKey(nutritionScores);
    const topPath = this._topKey(pathogenScores);

    if (maxPath >= this.LEAF_RATIO * totalNut && maxPath > 0) {
      return this._formatLeafResult('pathogen', topPath, nutritionScores, pathogenScores);
    } else if (totalNut >= this.LEAF_RATIO * maxPath && totalNut > 0) {
      return this._formatLeafResult('nutrition', topNut, nutritionScores, pathogenScores);
    } else {
      return {
        diagnosis_label: "可疑：病害或营养均可能",
        cause_explanation: "叶片症状既含营养失衡又含病原因素，建议采样/送检或人工复核。",
        treatment_recommendation: {
          acute: ["做叶/土检测并停止怀疑操作（如继续施肥/喷药）"],
          mid: ["根据检测结果对症处理"],
          long: ["建立样本库用于权重迭代"]
        },
        diagnosis_code: "ambiguous",
        confidence: 0.55
      };
    }
  }

  // ---------- helpers ----------
  _extractFruitFeatures(payload) {
    const f = payload.fruit || {};
    const features = [];
    if (f.position) features.push(`position_${f.position}`); // e.g. position_outer
    if (f.size) features.push(`size_${f.size}`);
    (f.symptoms || []).forEach(s => features.push(s));
    if (f.visible_holes_or_larvae) features.push('visible_holes_or_larvae');
    (payload.recent_events || []).forEach(ev => features.push(ev));
    if (f.onset) features.push(`onset_${f.onset}`);
    return features;
  }

  _extractLeafFeatures(payload) {
    const l = payload.leaf || {};
    const features = [];
    if (l.age) features.push(`leaf_age_${l.age}`); // young/mature/old
    (l.symptoms || []).forEach(s => features.push(s));
    if (l.distribution) features.push(`distribution_${l.distribution}`); // sectoral/uniform/one_side...
    if (l.onset) features.push(`onset_${l.onset}`);
    (payload.recent_events || []).forEach(ev => features.push(ev));
    if (l.honeydew_sooty) features.push('honeydew_sooty');
    if (l.insects_visible) features.push('insects_visible');
    return features;
  }

  _checkPriority(module, payload, features) {
    // priorityConfig is array of rules
    for (let r of (priorityConfig || [])) {
      if (r.module && r.module !== module) continue;
      // condition expressed as simple feature presence OR custom key presence
      const cond = r.condition || {};
      let ok = true;
      if (cond.features && cond.features.length) {
        ok = cond.features.every(f => features.includes(f));
      }
      if (!ok) continue;
      // additional payload checks
      if (r.extra_checks) {
        for (let chk of r.extra_checks) {
          // simple checks: payload.path.exists equals value
          const val = this._deepGet(payload, chk.path);
          if (chk.equals !== undefined) {
            if (val !== chk.equals) { ok = false; break; }
          }
        }
      }
      if (!ok) continue;
      // matched rule -> return its template
      return {
        diagnosis_label: r.result.diagnosis_label,
        cause_explanation: r.result.cause_explanation,
        treatment_recommendation: r.result.treatment_recommendation,
        diagnosis_code: r.result.diagnosis_code || r.name,
        confidence: r.result.confidence || 0.98
      };
    }
    return null;
  }

  _applyPhenologyCorrection(scoresObj, phenology) {
    const corr = this.PHENO_CORR[phenology] || {};
    Object.keys(scoresObj).forEach(k => {
      const factor = Number(corr[k] || 1.0);
      scoresObj[k] = (scoresObj[k] || 0) * factor;
    });
  }

  _initScores(keys) {
    const out = {};
    (keys || []).forEach(k => out[k] = 0);
    return out;
  }

  _sumValues(obj) {
    return Object.keys(obj).reduce((s,k)=> s + (Number(obj[k])||0), 0);
  }

  _maxValue(obj) {
    const vals = Object.values(obj).map(v=>Number(v)||0);
    if (!vals.length) return 0;
    return Math.max(...vals);
  }

  _topKey(obj) {
    const entries = Object.entries(obj);
    if (!entries.length) return null;
    entries.sort((a,b)=> (Number(b[1])||0) - (Number(a[1])||0));
    return entries[0][0];
  }

  _formatFruitResult(type, name, pathogenScores, physioScores) {
    if (type === 'pathogen') {
      const label = `病害：${name}`;
      return {
        diagnosis_label: label,
        cause_explanation: `症状与 ${name} 的典型表现最为一致。建议按病原处方处置并采样化验。`,
        treatment_recommendation: {
          acute: ["摘除严重病果并集中处理", "提高通风并降低树下湿度", "必要时快速防治（按标签）"],
          mid: ["有针对性药剂轮换防治", "恢复树体营养与树势"],
          long: ["季节性防治计划与田间记录"]
        },
        diagnosis_code: `PATH_${name}`,
        confidence: 0.88
      };
    } else {
      // physio
      const label = `生理/营养：${name}`;
      return {
        diagnosis_label: label,
        cause_explanation: `果实特征指向 ${name}（生理或营养相关）。建议调整灌溉/施肥/栽培管理。`,
        treatment_recommendation: {
          acute: ["停止可能诱因（过量灌水/剧烈灌溉/施肥等）", "对受害果分级处理"],
          mid: ["调整灌溉制度与施肥配方", "叶面/土壤检测并按结果施治"],
          long: ["栽培制度优化与品种/环控选择"]
        },
        diagnosis_code: `PHYSIO_${name}`,
        confidence: 0.84
      };
    }
  }

  _formatLeafResult(type, name, nutritionScores, pathogenScores) {
    if (type === 'nutrition') {
      return {
        diagnosis_label: `营养缺失：${name}`,
        cause_explanation: `叶片特征与 ${name} 缺乏高度一致。建议做叶/土检测并补施对应元素。`,
        treatment_recommendation: {
          acute: [`叶面速效补充 ${name}（按推荐剂量）`, "暂停刺激操作"],
          mid: ["土壤/叶片检测并对症追肥"],
          long: ["建立营养监测计划"]
        },
        diagnosis_code: `NUT_${name}`,
        confidence: 0.86
      };
    } else {
      const map = { fungal: '真菌性病害', bacterial: '细菌性病害', viral: '病毒病', insect: '虫害', fertilizer_burn:'肥害', herbicide_phytotoxic:'药害', abiotic_water:'水分胁迫' };
      return {
        diagnosis_label: `病害：${map[name]||name}`,
        cause_explanation: `叶片症状与 ${map[name]||name} 特征匹配，建议按病害流程处理并送检。`,
        treatment_recommendation: {
          acute: ["隔离病株并减少传播路径", "按标签选用低毒药剂或机械防治"],
          mid: ["恢复树体营养与防治传播媒介"],
          long: ["建立无病苗圃与防治记录"]
        },
        diagnosis_code: `PATH_${name}`,
        confidence: 0.9
      };
    }
  }

  _deepGet(obj, path) {
    // path like 'fruit.size' => get obj.fruit.size
    if (!obj || !path) return undefined;
    const parts = path.split('.');
    let cur = obj;
    for (let p of parts) {
      if (!cur) return undefined;
      cur = cur[p];
    }
    return cur;
  }

  _safeOutput(out) {
    // ensure only the safe fields returned to front-end
    return {
      diagnosis_label: out.diagnosis_label,
      cause_explanation: out.cause_explanation,
      treatment_recommendation: out.treatment_recommendation,
      // optional: internal fields present only if dev mode (but front-end should ignore)
      diagnosis_code: out.diagnosis_code,
      confidence: out.confidence
    };
  }
}

module.exports = new DiagnosticEngine();
