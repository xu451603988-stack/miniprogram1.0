// miniprogram/data/questionnaire/fruit_questions.js
// 柑橘果实问卷（升级版）
// 优化点：增加了溃疡病、蓟马、日灼等典型果面特征

module.exports = [
  {
    id: "fruit_position",
    title: "【望诊】问题果实主要长在什么位置？",
    type: "single",
    required: true,
    options: [
      { label: "树冠外围（向阳面，容易晒到）", value: "position_outer" },
      { label: "树冠内膛（阴凉处）", value: "position_inner" },
      { label: "离地面较近（下部果）", value: "position_lower" },
      { label: "全树果实都有", value: "position_all" }
    ]
  },
  {
    id: "fruit_symptoms",
    title: "【望诊】果皮表面最明显的异常？（可多选）",
    type: "multiple",
    required: true,
    options: [
      { label: "火山口状开裂的粗糙病斑（手摸挡手）", value: "canker_spots" },
      { label: "黑褐色/深褐色的小斑点（砂皮/黑点）", value: "melanose_spots" },
      { label: "果蒂周围有一圈银白/灰白色的疤痕", value: "thrips_ring" },
      { label: "向阳面有发黄/发白的干枯斑块（日灼）", value: "sunburn_patch" },
      { label: "果皮开裂（裂果）", value: "cracking" },
      { label: "果实明显偏小、畸形或转色不均匀", value: "small_deformed" },
      { label: "有明显的虫眼 / 腐烂发臭", value: "maggot_rot" },
      { label: "没有上述症状", value: "none_of_above" }
    ]
  },
  {
    id: "drop_status",
    title: "【问诊】是否有落果现象？",
    type: "single",
    required: true,
    options: [
      { label: "基本没落果", value: "drop_none" },
      { label: "有少量生理落果（正常）", value: "drop_physiological" },
      { label: "大量异常落果（满地都是）", value: "drop_severe" }
    ]
  },
  {
    id: "recent_events",
    title: "【问诊】近期天气与管理情况？",
    type: "multiple",
    required: false,
    options: [
      { label: "连续雨水多 / 湿度大", value: "ev_rain" },
      { label: "突然高温 / 强光照", value: "ev_hot" },
      { label: "久旱后突降大雨或猛灌水", value: "ev_drought_rain" },
      { label: "近期没有打药防虫", value: "ev_no_spray" }
    ]
  }
];