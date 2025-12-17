// miniprogram/data/questionnaire/root_questions.js
// 国际标准根系诊断问卷 V5.0
// 对应算法特征：ROOT_KNOT, ROOT_ROT, ROOT_BURN, WEAK_ROOT

module.exports = [
  {
    id: "soil_texture",
    title: "【切诊-土壤】用脚踩或手捏根际土壤，质地如何？",
    type: "single",
    required: true,
    options: [
      { label: "粘重板结（像胶泥，干了硬邦邦，湿了不透气）", value: "soil_clay" }, // 易导致缺氧
      { label: "潮湿泥泞（长期积水，甚至有青苔/酸臭味）", value: "soil_wet_rot" }, // 易导致根腐
      { label: "过于干旱（土壤发白，甚至开裂）", value: "soil_dry" }, // 易导致干旱胁迫
      { label: "疏松透气（团粒结构好，润而不湿）", value: "soil_good" }
    ]
  },
  {
    id: "root_symptoms",
    title: "【切诊-根系】挖开表土，观察须根/细根的手感与形态？（关键）",
    type: "multiple",
    required: true,
    options: [
      { label: "根上长有许多像“肿瘤/结节”的小疙瘩", value: "root_knots" }, // 线虫铁证
      { label: "根皮腐烂，手捏软烂脱皮（伴有酸臭味）", value: "root_rot_smell" }, // 根腐/疫霉
      { label: "根尖发黑、干枯、发脆（像被火烧焦，一折即断）", value: "root_burn_dry" }, // 肥害/药害
      { label: "根系发红/褐色，僵硬老化（几乎无新白根）", value: "few_white_roots" }, // 根系衰退/僵苗
      { label: "根系健康（黄白色，新鲜有弹性）", value: "root_healthy" },
      { label: "不方便查看", value: "uncertain" }
    ]
  },
  {
    id: "recent_root_event",
    title: "【问诊-历史】最近根部有过什么特殊操作？",
    type: "multiple",
    required: false,
    options: [
      { label: "埋施了大量化肥或未腐熟有机肥（鸡粪/花生麸等）", value: "ev_heavy_fertilizer" },
      { label: "大水漫灌 / 遭受连续暴雨水浸", value: "ev_flood" },
      { label: "使用了除草剂（特别是草甘膦）", value: "ev_herbicide" },
      { label: "无特殊操作", value: "none" }
    ]
  }
];