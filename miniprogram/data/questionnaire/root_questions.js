// miniprogram/data/questionnaire/root_questions.js
// 柑橘根系问卷（深度优化版）
// 优化点：引入线虫排查、肥害特征及土壤质地评估

module.exports = [
  {
    id: "soil_texture",
    title: "【切诊】脚踩或手捏土壤，感觉土质如何？",
    type: "single",
    required: true,
    options: [
      { label: "粘重板结（像胶泥，干了硬邦邦，湿了粘脚）", value: "soil_clay_hard" },
      { label: "沙性太大（抓不住水，容易漏肥）", value: "soil_sandy" },
      { label: "疏松透气（团粒结构好，松软）", value: "soil_good" },
      { label: "地表发白 / 有白色盐霜（盐渍化）", value: "soil_salty" }
    ]
  },
  {
    id: "soil_moisture",
    title: "【望诊】当前根区土壤的干湿情况？",
    type: "single",
    required: true,
    options: [
      { label: "积水严重（甚至有青苔/藻类）", value: "waterlogged" },
      { label: "长期潮湿，捏起来出水", value: "wet_heavy" },
      { label: "干湿适中（润而不湿）", value: "moisture_good" },
      { label: "干燥发白 / 开裂", value: "dry_crack" }
    ]
  },
  {
    id: "root_symptoms",
    title: "【望诊】挖开表层土，观察须根/细根表现？（可多选）",
    type: "multiple",
    required: true,
    options: [
      { label: "根系发黑、腐烂、有臭味（皮层容易脱落）", value: "root_rot_smell" },
      { label: "根尖发黑、干枯、脆断（像被烧焦）", value: "root_burn_dry" },
      { label: "根上长有许多像“肿瘤/结节”一样的小疙瘩", value: "root_knots" },
      { label: "根系偏红/红褐色（不长新根）", value: "root_red_stagnant" },
      { label: "白根很少，几乎看不到新长出的嫩根", value: "few_white_roots" },
      { label: "根系正常（黄白色/健壮）", value: "root_healthy" },
      { label: "不方便挖根 / 看不清楚", value: "uncertain" }
    ]
  },
  {
    id: "recent_events",
    title: "【问诊】最近根部有过什么操作？",
    type: "multiple",
    required: false,
    options: [
      { label: "最近埋施了大量化肥或未腐熟有机肥", value: "ev_heavy_fertilizer" },
      { label: "大水漫灌 / 连续暴雨", value: "ev_flood" },
      { label: "使用了除草剂（特别是草甘膦等）", value: "ev_herbicide" },
      { label: "深翻扩穴 / 动过土", value: "ev_tillage" },
      { label: "没有特殊操作", value: "none_of_above" }
    ]
  }
];