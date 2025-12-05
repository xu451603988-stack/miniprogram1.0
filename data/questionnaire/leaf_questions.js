// miniprogram/data/questionnaire/leaf_questions.js

module.exports = [
  {
    id: "leaf_age",
    title: "请选择叶龄（必须）",
    type: "single",
    required: true,
    options: [
      { label: "新梢幼叶（顶端）", value: "young" },
      { label: "功能叶（中部）", value: "mature" },
      { label: "老叶（基部）", value: "old" }
    ]
  },

  {
    id: "symptoms",
    title: "叶片主要症状（可多选）",
    type: "multiple",
    required: true,
    options: [
      { label: "叶脉间黄化（缺铁/锌）", value: "interveinal_chlorosis" },
      { label: "叶脉黄化（失绿）", value: "vein_chlorosis" },
      { label: "花叶斑驳（病毒）", value: "mottling_variegation" },
      { label: "局部病斑（真菌/溃疡）", value: "local_spots_lesions" },
      { label: "水渍状斑（雨后）", value: "water_soaked_spots" },
      { label: "叶缘焦枯（盐害/药害）", value: "necrotic_margin" },
      { label: "叶尖灼伤（肥害）", value: "tip_burn" },
      { label: "叶片卷曲（干旱/虫害）", value: "leaf_curl" },
      { label: "全叶黄化（系统性问题）", value: "chlorotic_whole_leaf" },
      { label: "蜜露/煤污（虫害）", value: "honeydew_sooty" },
      { label: "可见害虫（蚜虫/蓟马等）", value: "insects_visible" }
    ]
  },

  {
    id: "distribution",
    title: "症状分布模式（必须）",
    type: "single",
    required: true,
    options: [
      { label: "局部/扇形（病毒）", value: "sectoral" },
      { label: "全株均匀（营养）", value: "uniform" },
      { label: "零散分布（真菌）", value: "scattered" }
    ]
  },

  {
    id: "severity",
    title: "整体受害程度（必须）",
    type: "single",
    required: true,
    options: [
      { label: "轻度（≤20%）", value: "light" },
      { label: "中度（20-50%）", value: "medium" },
      { label: "重度（≥50%）", value: "heavy" }
    ]
  },

  {
    id: "onset",
    title: "发病速度（必须）",
    type: "single",
    required: true,
    options: [
      { label: "一夜之间（药害/日灼）", value: "overnight" },
      { label: "1-2天内", value: "days" },
      { label: "1-2周内", value: "weeks" }
    ]
  },

  {
    id: "recent_events",
    title: "近期田间事件（可多选）",
    type: "multiple",
    required: false,
    options: [
      { label: "连续降雨（真菌高发）", value: "ev_rain" },
      { label: "高温强光（日灼）", value: "ev_hot" },
      { label: "大量追施氮肥（肥害）", value: "ev_heavy_n" },
      { label: "最近喷药（药害）", value: "ev_recent_spray" },
      { label: "频繁灌溉（根系缺氧）", value: "ev_freq_irrig" }
    ]
  }
];
