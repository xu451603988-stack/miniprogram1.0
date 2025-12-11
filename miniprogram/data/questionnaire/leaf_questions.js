// miniprogram/data/questionnaire/leaf_questions.js
// 柑橘叶片问卷（升级版）
// 优化点：区分了黄化细节、增加了红蜘蛛/潜叶蛾等特定描述

module.exports = [
  {
    id: "leaf_age",
    title: "【望诊】主要出问题的叶片是哪种？（必须）",
    type: "single",
    required: true,
    options: [
      { label: "嫩梢/幼叶（刚长出的新叶，颜色较浅）", value: "leaf_age_young" },
      { label: "老熟叶片（枝条中下部的深绿色厚叶）", value: "leaf_age_old" },
      { label: "全树叶片不分老嫩，都有问题", value: "leaf_age_mix" },
      { label: "不确定 / 没注意", value: "uncertain" }
    ]
  },
  {
    id: "symptoms",
    title: "【望诊】叶片表面最明显的症状？（可多选）",
    type: "multiple",
    required: true,
    options: [
      // --- 黄化类 ---
      { label: "叶脉发黄，但叶肉还是绿的（主脉黄化）", value: "vein_chlorosis" },
      { label: "叶脉是绿的，叶肉发黄（网状黄化）", value: "interveinal_chlorosis" },
      { label: "老叶叶基部有个倒'V'字形的黄斑", value: "inverted_v_yellow" },
      { label: "整片叶子均匀发黄，像缺水一样", value: "uniform_yellow" },
      
      // --- 斑点/形态类 ---
      { label: "叶片上有不规则的褐色/黑色斑点", value: "local_spots_lesions" },
      { label: "有灰白色/银灰色的虫道（像画地图一样）", value: "leaf_miner_trails" },
      { label: "叶面布满灰尘状小白点/红点（失去光泽）", value: "red_spider_symptoms" },
      { label: "叶片畸形、扭曲或明显皱缩", value: "leaf_curl" },
      { label: "叶面有黑色煤烟状粉末（煤污）", value: "sooty_mold" },
      
      // --- 坏死类 ---
      { label: "叶尖或叶缘焦枯（像火烧过）", value: "tip_burn" },
      { label: "没有上述明显症状 / 不确定", value: "none_of_above" }
    ]
  },
  {
    id: "distribution",
    title: "【望诊】症状在树上的分布情况？",
    type: "single",
    required: true,
    options: [
      { label: "零星发生，只有少数枝条有", value: "scattered" },
      { label: "局部集中，像扇形一样某一块特别严重", value: "sectoral" },
      { label: "全树普遍发生", value: "uniform" },
      { label: "主要集中在树冠顶部", value: "top_heavy" }
    ]
  },
  {
    id: "recent_events",
    title: "【问诊】近期（10天内）园子里发生过什么？",
    type: "multiple",
    required: false,
    options: [
      { label: "连续阴雨 / 暴雨 / 积水", value: "ev_rain" },
      { label: "高温烈日 / 干旱缺水", value: "ev_hot" },
      { label: "大量施肥 / 撒施化肥", value: "ev_heavy_n" },
      { label: "刚刚喷过农药或叶面肥", value: "ev_recent_spray" },
      { label: "抽发新梢期", value: "ev_new_shoot" },
      { label: "没有特殊情况", value: "none_of_above" }
    ]
  }
];