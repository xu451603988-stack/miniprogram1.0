// miniprogram/data/questionnaire/leaf_questions.js
// 柑橘叶片问卷（最终完善版）
// 新增：树势背景调查，辅助判断内因

module.exports = [
  {
    id: "tree_vigor",
    title: "【望诊】当前这棵树的整体长势如何？（重要）",
    type: "single",
    required: true,
    options: [
      { label: "树势衰弱（枝条稀疏、无新梢、叶片无光泽）", value: "TREE_WEAK" },
      { label: "树势中庸（正常生长，但这几天有点不对劲）", value: "TREE_NORMAL" },
      { label: "树势旺长（枝条徒长、叶片浓绿巨大）", value: "TREE_VIGOROUS" },
      { label: "幼树 / 刚种下不久的小苗", value: "TREE_YOUNG" }
    ]
  },
  {
    id: "leaf_age",
    title: "【望诊】主要出问题的叶片是哪种？",
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
      { label: "有灰白色/银灰色的虫道（鬼画符）", value: "leaf_miner_trails" },
      { label: "叶面布满灰尘状小白点/红点", value: "red_spider_symptoms" },
      { label: "叶片畸形、扭曲或明显皱缩", value: "leaf_curl" },
      { label: "叶面有黑色煤烟状粉末（煤污）", value: "sooty_mold" },
      
      // --- 坏死类 ---
      { label: "叶尖或叶缘焦枯（像火烧过）", value: "tip_burn" },
      { label: "没有上述明显症状", value: "none_of_above" }
    ]
  },
  {
    id: "leaf_curl_direction",
    title: "【望诊】如果是卷叶，是向哪边卷？",
    type: "single",
    required: false, // 只有选了卷叶才需要关心这个，设为非必填或通过逻辑控制
    options: [
      { label: "向叶背卷曲（反卷/下卷）- 像扣过来的船", value: "curl_down" },
      { label: "向叶面卷曲（正卷/上卷）- 像这种 U 形", value: "curl_up" },
      { label: "没卷叶 / 不确定", value: "curl_none" }
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