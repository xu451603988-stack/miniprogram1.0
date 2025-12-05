// miniprogram/utils/newDiagnosticEngine.js
// 新诊断引擎（与 result.js 兼容）
// 导出：run(data) -> 返回 analysis 对象
// data = { crop, month, module, answers }

const DEFAULT_ANALYSIS = {
  riskScore: 0,
  riskLevelText: "低风险",
  riskLevelClass: "low",
  mainRisks: [],
  nutrientFindings: [],
  diseaseFindings: [],
  suggestions: []
};

class NewDiagnosticEngineForApp {
  constructor() {
    // 简化映射：key => { label, type: 'disease'|'physio'|'nutrient', baseWeight }
    // 这些 key 会被用于评分与结果展示
    this.catalog = {
      // 叶片相关
      fungal: { label: "真菌性病害（叶斑/霉菌）", type: "disease", base: 3 },
      bacterial: { label: "细菌性病害", type: "disease", base: 2 },
      viral: { label: "病毒性病害（花叶/斑驳）", type: "disease", base: 4 },
      insect: { label: "刺吸式害虫/咀嚼性害虫", type: "disease", base: 4 },
      nutrient: { label: "营养失衡/微量元素缺乏", type: "nutrient", base: 3 },
      fertilizer_burn: { label: "肥害/盐害", type: "physio", base: 4 },
      herbicide_phytotoxic: { label: "药害（农药/混配）", type: "physio", base: 4 },
      sunburn: { label: "日灼/光害", type: "physio", base: 3 },

      // 果实相关
      greasy_spot: { label: "油斑病（果面）", type: "disease", base: 4 },
      melanose_like: { label: "果面真菌性斑点", type: "disease", base: 3 },
      cracking: { label: "裂果（生理性）", type: "physio", base: 3 },
      fruit_insect: { label: "果实害虫（果蝇/蛀果）", type: "disease", base: 4 },
      hlb_like: { label: "黄龙病相关症状（HLB）", type: "disease", base: 4 },

      // 根系相关
      root_rot: { label: "根腐病/根系坏死", type: "disease", base: 5 },
      anaerobic: { label: "土壤缺氧/硫化物毒害", type: "physio", base: 4 },
      nematode: { label: "线虫/根瘤病", type: "disease", base: 4 },
      compaction: { label: "土壤板结/透气差", type: "physio", base: 3 },
      salt_or_alkali: { label: "盐碱/土壤毒化", type: "physio", base: 3 }
    };

    // 关键词到 catalog key 的映射（与问卷 value 直接对应）
    this.keywordMap = {
      // 叶片
      interveinal_chlorosis: ["nutrient"],
      vein_chlorosis: ["nutrient"],
      chlorotic_whole_leaf: ["nutrient"],
      mottling_variegation: ["viral"],
      local_spots_lesions: ["fungal", "bacterial"],
      water_soaked_spots: ["fungal", "bacterial"],
      necrotic_margin: ["fertilizer_burn", "herbicide_phytotoxic"],
      tip_burn: ["fertilizer_burn"],
      leaf_curl: ["insect", "physio"],
      honeydew_sooty: ["insect"],
      insects_visible: ["insect"],
      ev_rain: ["fungal", "root_rot"],
      ev_heavy_n: ["fertilizer_burn", "nutrient"],
      ev_recent_spray: ["herbicide_phytotoxic"],

      // 果实
      surface_spots_pits: ["melanose_like"],
      oily_spots: ["greasy_spot"],
      sunburn_burn: ["sunburn"],
      cracking_split: ["cracking"],
      color_inversion_green_when_ripen: ["hlb_like"],
      premature_drop: ["physio"],
      oviposition_punctures: ["fruit_insect"],
      small_lopsided: ["hlb_like"],

      // 根系
      root_rot_black: ["root_rot"],
      few_fine_roots: ["root_rot"],
      root_peel_off: ["root_rot"],
      red_root: ["nutrient"],
      sulfide: ["anaerobic"],
      ev_over_irrigation: ["anaerobic", "root_rot"],
      ev_rain: ["anaerobic", "root_rot"],
      ev_organic: ["root_rot"],

      // 一些常见通用事件
      rain: ["fungal", "root_rot"],
      hot: ["sunburn"],
      heavy_n: ["fertilizer_burn", "nutrient"],
      sprayHigh: ["herbicide_phytotoxic"]
    };

    // 建议模板（按类型取用）
    this.suggestionTemplates = {
      disease: [
        "尽快拍照或取样送检以明确病原；若为真菌性病害，注意改善通风与排水并按推荐剂量使用杀菌剂。",
        "发现虫害时优先采用诱捕、天敌或低风险药剂进行防治；重度时集中处理受害植株。"
      ],
      physio: [
        "立即调整田间管理（灌溉/施肥/遮阴/排水），以缓解生理性损伤。",
        "针对土壤问题，改良土壤结构或改善排水。"
      ],
      nutrient: [
        "建议做土壤与叶片元素检测，并按检测结果进行针对性追肥或叶面补施微量元素。",
        "短期可进行叶面喷施速效微量元素以缓解症状。"
      ],
      default: [
        "记录症状并拍照，联系当地农技人员做进一步判定。",
        "改善栽培管理、保持田间卫生，减少病原基数。"
      ]
    };

    // 风险等级阈值（0-100）
    this.thresholds = { low: 30, mid: 60 };
  }

  // 对外接口
  run(data) {
    try {
      if (!data || !data.module || !data.answers) {
        return Object.assign({}, DEFAULT_ANALYSIS);
      }

      const module = data.module;
      const month = data.month || null;
      const answers = this._normalizeAnswers(data.answers);

      // 1) 关键词计数并累加权重
      const rawScores = this._accumulateScores(answers);

      // 2) 物候 / 环境 修正（简单示例）
      const correctedScores = this._applyPhenologyAdjust(rawScores, month);

      // 3) 归一化至 0-100 风险分（按最高可能分做比例）
      const riskScore = this._computeRiskScore(correctedScores);

      // 4) 风险等级判定
      const { levelText, levelClass } = this._riskLevel(riskScore);

      // 5) 主风险项（按权重排序取前3）
      const mainRisks = this._topRiskLabels(correctedScores, 3);

      // 6) 生成营养/病害发现和建议
      const nutrientFindings = this._collectFindingsByType(correctedScores, "nutrient");
      const diseaseFindings = this._collectFindingsByType(correctedScores, "disease");
      const suggestions = this._makeSuggestions(correctedScores, answers);

      // 7) 格式化输出与兼容 result.wxml
      const analysis = {
        riskScore: Math.round(riskScore),
        riskLevelText: levelText,
        riskLevelClass: levelClass,
        mainRisks,
        nutrientFindings,
        diseaseFindings,
        suggestions
      };

      return analysis;
    } catch (e) {
      console.error("[newDiagnosticEngine.run] error:", e);
      return Object.assign({}, DEFAULT_ANALYSIS);
    }
  }

  // 将 answers 中各种形式的答案扁平化为 token 数组
  _normalizeAnswers(answers) {
    const tokens = [];
    try {
      Object.keys(answers).forEach((k) => {
        const v = answers[k];
        if (Array.isArray(v)) {
          v.forEach((it) => {
            if (typeof it === "string") tokens.push(it);
          });
        } else if (typeof v === "string") {
          tokens.push(v);
        } else if (typeof v === "number") {
          tokens.push(String(v));
        }
      });
    } catch (e) {
      // ignore
    }
    return tokens;
  }

  // 根据 token 累加 catalog key 的分数（简单相加）
  _accumulateScores(tokens) {
    const scores = {};
    // 初始化所有 catalog key 为 0
    Object.keys(this.catalog).forEach((k) => (scores[k] = 0));

    // 遍历 tokens，查 map 并累加
    tokens.forEach((tk) => {
      const mapped = this.keywordMap[tk];
      if (mapped && Array.isArray(mapped)) {
        mapped.forEach((key) => {
          if (scores[key] === undefined) scores[key] = 0;
          const base = (this.catalog[key] && this.catalog[key].base) || 1;
          scores[key] += base;
        });
      }
    });

    // 事件类额外规则：特定 token 再加权（示例）
    if (tokens.includes("ev_rain") || tokens.includes("rain")) {
      if (scores["fungal"] !== undefined) scores["fungal"] += 2;
      if (scores["root_rot"] !== undefined) scores["root_rot"] += 1;
    }
    if (tokens.includes("ev_hot") || tokens.includes("hot")) {
      if (scores["sunburn"] !== undefined) scores["sunburn"] += 2;
    }
    if (tokens.includes("ev_heavy_n") || tokens.includes("heavy_n")) {
      if (scores["fertilizer_burn"] !== undefined) scores["fertilizer_burn"] += 3;
      if (scores["nutrient"] !== undefined) scores["nutrient"] += 2;
    }

    return scores;
  }

  // 按 month 简单调整（夏季真菌/根腐增权，果实膨大期裂果增权）
  _applyPhenologyAdjust(scores, month) {
    const corrected = Object.assign({}, scores);
    try {
      const m = Number(month);
      if ([6, 7, 8].includes(m)) {
        if (corrected["fungal"] !== undefined) corrected["fungal"] *= 1.25;
        if (corrected["root_rot"] !== undefined) corrected["root_rot"] *= 1.25;
      }
      if ([9, 10, 11].includes(m)) {
        if (corrected["cracking"] !== undefined) corrected["cracking"] *= 1.2;
      }
    } catch (e) {
      // ignore
    }
    return corrected;
  }

  // 将 correctedScores -> 0-100 风险分
  _computeRiskScore(correctedScores) {
    // 计算当前分与可能最大分的比例
    // 假设最大可能分 = sum of (catalog base * 3) for keys present (粗略估算)
    let current = 0;
    let potential = 0;
    Object.keys(correctedScores).forEach((k) => {
      const v = Number(correctedScores[k]) || 0;
      current += v;
      const base = (this.catalog[k] && this.catalog[k].base) || 1;
      potential += base * 3; // 假设一个症状可重复叠加最多 3 倍影响
    });

    // 防止除0
    if (potential <= 0) return 0;

    let score = (current / potential) * 100;

    // 限制 0-100
    if (!isFinite(score)) score = 0;
    if (score < 0) score = 0;
    if (score > 100) score = 100;

    return score;
  }

  // 风险等级文本/样式
  _riskLevel(score) {
    if (score <= this.thresholds.low) return { levelText: "低风险", levelClass: "low" };
    if (score <= this.thresholds.mid) return { levelText: "中等风险", levelClass: "mid" };
    return { levelText: "高风险", levelClass: "high" };
  }

  // 返回主风险标签（按分值排序，取前 n）
  _topRiskLabels(scores, n = 3) {
    const arr = Object.keys(scores)
      .map((k) => ({ key: k, val: Number(scores[k]) || 0 }))
      .filter((item) => item.val > 0)
      .sort((a, b) => b.val - a.val)
      .slice(0, n);

    if (arr.length === 0) return ["未发现明显高风险因素"];

    return arr.map((it) => {
      const meta = this.catalog[it.key];
      return meta ? `${meta.label}（得分 ${it.val}）` : `${it.key}（${it.val}）`;
    });
  }

  // 按类型收集发现（nutrient / disease / physio）
  _collectFindingsByType(scores, type) {
    const res = [];
    Object.keys(scores).forEach((k) => {
      const meta = this.catalog[k];
      if (!meta) return;
      if (meta.type === type && (scores[k] || 0) > 0) {
        res.push(`${meta.label}（评分 ${Math.round(scores[k])}）`);
      }
    });
    return res;
  }

  // 综合生成建议（选取前三个高分项并根据类型拼接模板）
  _makeSuggestions(scores, tokens) {
    // 找到按分排序的前三项
    const ranked = Object.keys(scores)
      .map((k) => ({ key: k, val: Number(scores[k]) || 0 }))
      .filter((it) => it.val > 0)
      .sort((a, b) => b.val - a.val);

    const suggestions = new Set();

    if (ranked.length === 0) {
      this.suggestionTemplates.default.forEach((s) => suggestions.add(s));
      return Array.from(suggestions);
    }

    // 针对 top3 给出合并建议
    const top = ranked.slice(0, 3);
    top.forEach((it) => {
      const meta = this.catalog[it.key];
      if (!meta) return;
      const t = meta.type;
      if (t && this.suggestionTemplates[t]) {
        this.suggestionTemplates[t].forEach((s) => suggestions.add(s));
      }
      // 类型细化提示
      if (it.key === "root_rot") {
        suggestions.add("发现根系问题，建议立即排水、切除腐烂根并施用好氧微生物改良剂。");
      }
      if (it.key === "viral") {
        suggestions.add("疑似病毒病，优先隔离并送检，不建议修剪传播期枝条。");
      }
      if (it.key === "fruit_insect" || it.key === "insect") {
        suggestions.add("发现虫害痕迹，优先采用诱捕与生物防治，必要时局部用药。");
      }
    });

    // 若 answers 中包含某些高危事件，补充即时措施
    if (tokens.includes("ev_rain") || tokens.includes("rain")) {
      suggestions.add("连续降雨后注意通风与叶面干燥，适时喷施防霉剂。");
    }
    if (tokens.includes("ev_hot") || tokens.includes("hot")) {
      suggestions.add("高温期注意遮阴与补水，防止日灼。");
    }
    if (tokens.includes("ev_heavy_n") || tokens.includes("heavy_n")) {
      suggestions.add("避免短期内大量施氮，改为少量多次并监测反应。");
    }

    // 最后补充默认建议（若不足则补齐）
    this.suggestionTemplates.default.forEach((s) => suggestions.add(s));

    return Array.from(suggestions);
  }
}

// 导出单例
module.exports = new NewDiagnosticEngineForApp();
