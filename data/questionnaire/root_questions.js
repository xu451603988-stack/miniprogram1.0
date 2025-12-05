// miniprogram/data/questionnaire/root_questions.js

module.exports = [
  {
    id: "soil_condition",
    title: "土壤当前状态（必须）",
    type: "single",
    required: true,
    options: [
      { label: "积水/潮湿（缺氧高风险）", value: "wet" },
      { label: "适中", value: "normal" },
      { label: "偏干", value: "dry" }
    ]
  },

  {
    id: "root_symptoms",
    title: "根系症状表现（可多选）",
    type: "multiple",
    required: true,
    options: [
      { label: "烂根/变黑（疫霉/缺氧）", value: "root_rot_black" },
      { label: "须根减少", value: "few_fine_roots" },
      { label: "根皮易脱落（溃疡风险）", value: "root_peel_off" },
      { label: "根系发红（铁毒/酸性）", value: "red_root" },
      { label: "无明显症状", value: "no_symptom" }
    ]
  },

  {
    id: "soil_smell",
    title: "土壤气味（必须）",
    type: "single",
    required: true,
    options: [
      { label: "正常土腥味", value: "normal" },
      { label: "臭味/沼气味（缺氧硫化）", value: "sulfide" },
      { label: "霉味（积水时间长）", value: "mold" }
    ]
  },

  {
    id: "recent_events",
    title: "近期管理事件（可多选）",
    type: "multiple",
    required: false,
    options: [
      { label: "大量灌水（高风险）", value: "ev_over_irrigation" },
      { label: "暴雨/积水", value: "ev_rain" },
      { label: "深翻扰动根系", value: "ev_deep_tillage" },
      { label: "新施有机肥（腐熟不完全）", value: "ev_organic" }
    ]
  }
];
