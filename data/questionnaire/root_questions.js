// miniprogram/data/questionnaire/root_questions.js
// 中医式植保版 · 根系与土壤问卷（望诊 + 闻诊 + 问诊）
// 升级点：
// 1）root_symptoms 保留 no_symptom，并增加“不确定”
// 2）土壤状态、气味增加“不确定”
// 3）recent_events 增加「没有上述情况」「不确定」

module.exports = [
  {
    id: "soil_condition",
    title: "【望诊/切诊】当前根际土壤表层状态（必须）",
    type: "single",
    required: true,
    options: [
      { label: "明显积水或长时间潮湿（踩上去有水印或泥泞）", value: "wet" },
      { label: "适中：手感湿润但不粘脚，抓起能成团、轻捏即散", value: "normal" },
      { label: "偏干：表层发白或开裂，手握不成团", value: "dry" },
      { label: "不确定 / 当前不方便观察土壤", value: "uncertain" }
    ]
  },

  {
    id: "root_symptoms",
    title: "【望诊】挖开后可见的根系表现（可多选）",
    type: "multiple",
    required: true,
    options: [
      { label: "部分根系发黑、糜烂或皮层糊状（疑似烂根/缺氧）", value: "root_rot_black" },
      { label: "细小须根明显偏少，新根较少或不新鲜", value: "few_fine_roots" },
      { label: "轻拉根皮容易整片脱落，木质部裸露", value: "root_peel_off" },
      { label: "根系偏红或红褐色，周围土壤可能偏酸或有铁锈色沉积", value: "red_root" },
      { label: "目前看不到明显异常根系（至少表观正常）", value: "no_symptom" },
      { label: "不方便挖根 / 看不清根系情况", value: "uncertain" }
    ]
  },

  {
    id: "soil_smell",
    title: "【闻诊】靠近根际土壤的气味（必须）",
    type: "single",
    required: true,
    options: [
      { label: "正常土腥味，无明显异味", value: "normal" },
      { label: "明显臭味 / 沼气味，类似臭鸡蛋或污水（缺氧、硫化氢）", value: "sulfide" },
      { label: "霉味或闷味，感觉土壤长时间不透气", value: "mold" },
      { label: "不确定 / 当前不方便闻气味", value: "uncertain" }
    ]
  },

  {
    id: "recent_events",
    title: "【问诊】最近 20 天内，与根区有关的管理事件（可多选）",
    type: "multiple",
    required: false,
    options: [
      { label: "短时间内大量灌水或漫灌（高风险操作）", value: "ev_over_irrigation" },
      { label: "遇到暴雨或田块曾明显积水", value: "ev_rain" },
      { label: "刚刚进行深翻、开沟或大力度整地，可能伤到部分根系", value: "ev_deep_tillage" },
      { label: "新施入有机肥 / 厩肥，腐熟程度不完全确定", value: "ev_organic" },
      { label: "没有以上情况，或影响较小", value: "none_of_above" },
      { label: "不确定 / 记不清具体情况", value: "uncertain" }
    ]
  }
];
