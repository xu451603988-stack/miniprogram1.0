// miniprogram/data/questionnaire/leaf_questions.js
// 中医式植保版 · 叶片问卷（望诊 + 问诊）
// 升级点：
// 1）关键多选题增加「没有上述情况」「不确定」
// 2）单选题增加「不确定」选项，避免被迫乱选
// 3）时间窗口与描述统一

module.exports = [
  {
    id: "leaf_age",
    title: "【望诊】当前出现问题的叶龄（必须）",
    type: "single",
    required: true,
    options: [
      { label: "新梢幼叶（树冠顶端，刚展开或尚未完全展开）", value: "young" },
      { label: "功能叶（中上部，已完全展开、厚实有光泽）", value: "mature" },
      { label: "老叶（靠内或下部，颜色偏暗、较厚硬）", value: "old" },
      { label: "不确定 / 难以区分叶龄", value: "uncertain" }
    ]
  },

  {
    id: "symptoms",
    title: "【望诊】叶片目前最明显的症状（可多选）",
    type: "multiple",
    required: true,
    options: [
      { label: "叶脉间泛黄，叶脉仍为绿色（网状黄化）", value: "interveinal_chlorosis" },
      { label: "叶脉本身发黄或失绿（叶脉颜色变浅）", value: "vein_chlorosis" },
      { label: "叶片呈花叶或斑驳图案，深浅不均", value: "mottling_variegation" },
      { label: "局部出现圆斑 / 不规则坏死斑，边缘较清楚", value: "local_spots_lesions" },
      { label: "雨后或高湿时，叶面有半透明水渍状斑点", value: "water_soaked_spots" },
      { label: "叶缘干枯烧边，严重时向叶片内部发展", value: "necrotic_margin" },
      { label: "叶尖发干、发褐或焦枯", value: "tip_burn" },
      { label: "叶片明显卷曲（上翻或下卷）", value: "leaf_curl" },
      { label: "整片叶子普遍发黄或失绿", value: "chlorotic_whole_leaf" },
      { label: "叶面有黏液、黑灰色煤污或霉层", value: "honeydew_sooty" },
      { label: "可见害虫或虫卵、虫粪、取食痕迹", value: "insects_visible" },
      { label: "没有明显以上症状，仅有轻微色差 / 说不上来", value: "none_of_above" },
      { label: "不确定，难以判断属于哪一类", value: "uncertain" }
    ]
  },

  {
    id: "distribution",
    title: "【望诊】这些症状在整棵树上的分布情况（必须）",
    type: "single",
    required: true,
    options: [
      { label: "局部 / 扇形集中在某一枝条或树冠一侧", value: "sectoral" },
      { label: "整株或多数枝条叶片分布较均匀", value: "uniform" },
      { label: "零星散布在各处，呈点状或片状出现", value: "scattered" },
      { label: "看不太清楚 / 不好判断分布特点", value: "uncertain" }
    ]
  },

  {
    id: "severity",
    title: "【望诊】放眼整棵树，受影响叶片的大致比例（必须）",
    type: "single",
    required: true,
    options: [
      { label: "轻度：受影响叶片 ≤ 全树 20%", value: "light" },
      { label: "中度：约 20%–50% 的叶片受影响", value: "medium" },
      { label: "重度：> 50% 的叶片出现类似症状", value: "heavy" },
      { label: "不确定，大概范围不好估算", value: "uncertain" }
    ]
  },

  {
    id: "onset",
    title: "【问诊】从叶片正常到现在这个程度，大概经历了多久？（必须）",
    type: "single",
    required: true,
    options: [
      { label: "一夜之间或 1 天内明显出现 / 加重（多见药害、日灼、极端水肥）", value: "overnight" },
      { label: "1–2 天内逐渐出现并加重", value: "days" },
      { label: "1–2 周甚至更久，缓慢发展到目前程度", value: "weeks" },
      { label: "不确定，变化时间记不清", value: "uncertain" }
    ]
  },

  {
    id: "recent_events",
    title: "【问诊】最近 7–10 天内，园子里发生过哪些情况？（可多选）",
    type: "multiple",
    required: false,
    options: [
      { label: "连续降雨或湿度偏高（地表长时间湿润）", value: "ev_rain" },
      { label: "高温强光、日照时间明显偏长", value: "ev_hot" },
      { label: "一次性大量追施氮肥或高浓度速效肥", value: "ev_heavy_n" },
      { label: "近期刚刚喷药（含叶面肥、杀虫 / 杀菌剂等）", value: "ev_recent_spray" },
      { label: "频繁灌溉或灌水量较大，土壤长期偏湿", value: "ev_freq_irrig" },
      { label: "没有以上情况，或影响很小", value: "none_of_above" },
      { label: "不确定 / 记不清具体情况", value: "uncertain" }
    ]
  }
];
