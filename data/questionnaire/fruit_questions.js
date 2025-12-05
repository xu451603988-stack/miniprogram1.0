// miniprogram/data/questionnaire/fruit_questions.js

module.exports = [
  {
    id: "fruit_position",
    title: "果实在树冠的位置（必须）",
    type: "single",
    required: true,
    options: [
      { label: "外围果（易日灼）", value: "outer" },
      { label: "内膛果（光照弱）", value: "inner" },
      { label: "下部果（湿度高）", value: "lower" },
      { label: "上部果（风大日强）", value: "upper" }
    ]
  },

  {
    id: "fruit_symptoms",
    title: "果实主要症状（可多选）",
    type: "multiple",
    required: true,
    options: [
      { label: "表面斑点/凹陷（病斑）", value: "surface_spots_pits" },
      { label: "油渍状斑点（油斑病）", value: "oily_spots" },
      { label: "日灼烧伤斑（晒伤）", value: "sunburn_burn" },
      { label: "裂果/开裂（生理）", value: "cracking_split" },
      { label: "成熟期返青（黄龙病）", value: "color_inversion_green_when_ripen" },
      { label: "早期落果（营养问题）", value: "premature_drop" },
      { label: "产卵孔/蛀孔（果蝇）", value: "oviposition_punctures" },
      { label: "果小畸形（HLB/营养缺失）", value: "small_lopsided" }
    ]
  },

  {
    id: "fruit_size",
    title: "果实大小评估（必须）",
    type: "single",
    required: true,
    options: [
      { label: "正常大小", value: "normal" },
      { label: "明显偏小", value: "small" },
      { label: "异常偏大", value: "large" }
    ]
  },

  {
    id: "severity",
    title: "受害程度（必须）",
    type: "single",
    required: true,
    options: [
      { label: "轻度（≤10%）", value: "light" },
      { label: "中度（10-30%）", value: "medium" },
      { label: "重度（≥30%）", value: "heavy" }
    ]
  },

  {
    id: "onset",
    title: "症状发展速度（必须）",
    type: "single",
    required: true,
    options: [
      { label: "一夜之间（急性）", value: "overnight" },
      { label: "几天内", value: "days" },
      { label: "几周内", value: "weeks" }
    ]
  },

  {
    id: "recent_events",
    title: "近期田间事件（可多选）",
    type: "multiple",
    required: false,
    options: [
      { label: "连续降雨（病害高发）", value: "ev_rain" },
      { label: "高温强光（日灼）", value: "ev_hot" },
      { label: "大量追施氮肥", value: "ev_heavy_n" },
      { label: "最近喷药", value: "ev_recent_spray" },
      { label: "授粉不良", value: "ev_pollination_issue" }
    ]
  }
];
