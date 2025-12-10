// miniprogram/data/questionnaire/fruit_questions.js
// 中医式植保版 · 果实问卷（望诊 + 问诊）
// 升级点：
// 1）多选题增加「没有上述情况」「不确定」
// 2）单选题增加「不确定」
// 3）时间窗口统一

module.exports = [
  {
    id: "fruit_position",
    title: "【望诊】当前问题果实在树冠中的位置（必须）",
    type: "single",
    required: true,
    options: [
      { label: "外围果：外层、直接受光果（更易日灼、风吹）", value: "outer" },
      { label: "内膛果：树冠内部、光照相对较弱", value: "inner" },
      { label: "下部果：靠近树冠下部或靠近地面（湿度偏高）", value: "lower" },
      { label: "上部果：树冠上层（风力大、光照强）", value: "upper" },
      { label: "不确定 / 难以归类", value: "uncertain" }
    ]
  },

  {
    id: "fruit_symptoms",
    title: "【望诊】果实目前最明显的症状（可多选）",
    type: "multiple",
    required: true,
    options: [
      { label: "果面有斑点 / 凹陷，局部粗糙或坏死", value: "surface_spots_pits" },
      { label: "果面油腻、油渍状小斑点，颜色较深", value: "oily_spots" },
      { label: "靠日照面出现浅褐色至灰白色烧伤斑", value: "sunburn_burn" },
      { label: "果实开裂 / 裂缝，可能沿着果瓣或果脐", value: "cracking_split" },
      { label: "果实成熟期仍有部分区域保持绿色或返青", value: "color_inversion_green_when_ripen" },
      { label: "果实提前变黄、变软并脱落", value: "premature_drop" },
      { label: "表面有产卵孔 / 蛀孔或明显蛀食痕迹", value: "oviposition_punctures" },
      { label: "果实明显偏小、畸形或一侧发育不足", value: "small_lopsided" },
      { label: "没有明显以上症状，仅有轻微色差 / 轻度瑕疵", value: "none_of_above" },
      { label: "不确定，难以判断属于哪一类", value: "uncertain" }
    ]
  },

  {
    id: "fruit_size",
    title: "【望诊】与园内正常果相比的大小（必须）",
    type: "single",
    required: true,
    options: [
      { label: "大小基本正常", value: "normal" },
      { label: "明显偏小（普遍个头偏小）", value: "small" },
      { label: "明显偏大或异常膨大", value: "large" },
      { label: "不确定 / 果大小差异较乱", value: "uncertain" }
    ]
  },

  {
    id: "severity",
    title: "【望诊】整棵树中受影响果实的大致比例（必须）",
    type: "single",
    required: true,
    options: [
      { label: "轻度：问题果占全树果实的 ≤20%", value: "light" },
      { label: "中度：约 20%–50% 的果实受影响", value: "medium" },
      { label: "重度：> 50% 的果实有类似问题", value: "heavy" },
      { label: "不确定，大概范围不好估算", value: "uncertain" }
    ]
  },

  {
    id: "onset",
    title: "【问诊】从果实看起来正常到目前症状，大约用了多久？（必须）",
    type: "single",
    required: true,
    options: [
      { label: "一夜之间或 1 天内突然出现 / 明显加重（多见急性生理问题）", value: "overnight" },
      { label: "几天内逐步出现并加重", value: "days" },
      { label: "几周甚至更长时间缓慢发展", value: "weeks" },
      { label: "不确定，变化时间记不清", value: "uncertain" }
    ]
  },

  {
    id: "recent_events",
    title: "【问诊】最近 7–10 天内，与果实有关的关键情况（可多选）",
    type: "multiple",
    required: false,
    options: [
      { label: "连续降雨或空气湿度长期偏高", value: "ev_rain" },
      { label: "高温强光、果面曝晒时间明显增加", value: "ev_hot" },
      { label: "一次性大量追施氮肥或偏施速效肥", value: "ev_heavy_n" },
      { label: "刚进行过药剂或叶面肥喷施", value: "ev_recent_spray" },
      { label: "花期或幼果期授粉不理想，或遇到恶劣天气", value: "ev_pollination_issue" },
      { label: "没有以上情况，或影响很小", value: "none_of_above" },
      { label: "不确定 / 记不清具体情况", value: "uncertain" }
    ]
  }
];
