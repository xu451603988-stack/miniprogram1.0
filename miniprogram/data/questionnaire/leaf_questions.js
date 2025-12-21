/**
 * miniprogram/data/questionnaire/leaf_questions.js
 * 权重融合算法适配版问卷数据
 * 结构已修复：由数组改为对象格式，并确保包含 'start' 节点入口
 */

module.exports = {
  // 1. 入口节点：ID 必须为 'start'，确保 question.js 加载 loadNode('start') 成功
  "start": {
    id: "start",
    title: "【整体】这棵树目前的整体长势如何？",
    type: "single",
    required: true,
    options: [
      { label: "树势衰退（枝梢稀疏，叶片无光泽，枯枝多）", value: "tree_weak", next: "leaf_color" },
      { label: "树势中庸（生长正常，但这几天出现异常）", value: "tree_normal", next: "leaf_color" },
      { label: "树势旺长（枝条徒长，叶色浓绿巨大）", value: "tree_vigorous", next: "leaf_color" },
      { label: "幼树 / 苗期", value: "tree_young", next: "leaf_color" }
    ]
  },

  // 2. 颜色诊断节点：value 对应 symptomMap.js 中的标准化 Key
  "leaf_color": {
    id: "leaf_color",
    title: "【望诊-颜色】叶片颜色出现了什么异常？（可多选）",
    type: "multiple",
    required: true,
    options: [
      { label: "网状黄化（叶脉是绿的，叶肉发黄/发白）", value: "vein_green_leaf_yellow", next: "leaf_shape" },
      { label: "斑驳黄化（黄绿相间，不对称，即'花叶'）", value: "leaf_mottled", next: "leaf_shape" },
      { label: "倒V字黄斑（老叶基部发黄，叶尖还是绿的）", value: "inverted_v_yellow", next: "leaf_shape" },
      { label: "均匀黄化（整片叶子枯黄，无明显纹路）", value: "old_leaf_yellow", next: "leaf_shape" },
      { label: "灰白失绿（叶面布满灰白色针尖状小点）", value: "red_spider_symptoms", next: "leaf_shape" },
      { label: "颜色正常", value: "color_normal", next: "leaf_shape" }
    ]
  },

  // 3. 形态诊断节点：设置 isEnd: true 标识流程结束并触发算法计算
  "leaf_shape": {
    id: "leaf_shape",
    title: "【望诊-形态】叶片形状有什么变化？",
    type: "multiple",
    required: false,
    options: [
      { label: "向叶背反卷", value: "leaf_curled_back", isEnd: true },
      { label: "畸形/窄小", value: "leaf_small_deformed", isEnd: true },
      { label: "形态正常", value: "shape_normal", isEnd: true }
    ]
  }
};