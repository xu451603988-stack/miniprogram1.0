// miniprogram/data/questionnaire/leaf_questions.js
// 国际标准叶片诊断问卷 V5.0
// 对应算法特征：CHLOROSIS_NET, CHLOROSIS_VEIN, CANKER, RED_SPIDER, etc.

module.exports = [
  {
    id: "tree_vigor",
    title: "【整体】这棵树目前的整体长势如何？",
    type: "single",
    required: true,
    options: [
      { label: "树势衰退（枝梢稀疏，叶片无光泽，枯枝多）", value: "TREE_WEAK" },
      { label: "树势中庸（生长正常，但这几天出现异常）", value: "TREE_NORMAL" },
      { label: "树势旺长（枝条徒长，叶色浓绿巨大）", value: "TREE_VIGOROUS" },
      { label: "幼树 / 苗期", value: "TREE_YOUNG" }
    ]
  },
  {
    id: "leaf_color",
    title: "【望诊-颜色】叶片颜色出现了什么异常？（可多选）",
    type: "multiple",
    required: true,
    options: [
      { label: "网状黄化（叶脉是绿的，叶肉发黄/发白）", value: "interveinal_chlorosis" }, // 对应缺铁/锌
      { label: "斑驳黄化（黄绿相间，不对称，这就是'花叶'）", value: "mottling_yellow" }, // 对应黄龙病/病毒
      { label: "倒V字黄斑（仅老叶基部发黄，叶尖还是绿的）", value: "inverted_v_yellow" }, // 对应缺镁
      { label: "脉肿黄化（叶脉肿大、木栓化或发黄）", value: "vein_chlorosis" }, // 对应缺硼/衰退病
      { label: "均匀黄化（整片叶子枯黄，无明显纹路）", value: "uniform_yellow" }, // 对应缺氮/根腐
      { label: "灰白失绿（叶面布满灰白色针尖状小点）", value: "red_spider_symptoms" }, // 对应红蜘蛛
      { label: "颜色正常", value: "color_normal" }
    ]
  },
  {
    id: "leaf_shape",
    title: "【望诊-形态】叶片形状有什么变化？",
    type: "multiple",
    required: false,
    options: [
      { label: "向叶背反卷（像扣过来的船）", value: "curl_down" }, // 根系问题/蚜虫
      { label: "向叶面正卷（U形卷曲）", value: "curl_up" }, // 干旱/与根系有关
      { label: "畸形/狭小/直立（像辣椒叶或兔子耳朵）", value: "small_stiff" }, // 缺锌
      { label: "叶缘焦枯（像火烧过一样）", value: "tip_burn" }, // 肥害
      { label: "形态正常", value: "shape_normal" }
    ]
  },
  {
    id: "leaf_lesion",
    title: "【查体-病灶】叶片表面是否有斑点或附着物？",
    type: "multiple",
    required: false,
    options: [
      { label: "银白色弯曲虫道（鬼画符）", value: "leaf_miner_trails" }, // 潜叶蛾
      { label: "火山口状开裂病斑（摸起来粗糙挡手）", value: "canker_spots" }, // 溃疡病
      { label: "褐色轮纹斑/腐烂斑", value: "anthracnose_spots" }, // 炭疽病
      { label: "黑色煤烟状粉末（煤污）", value: "sooty_mold" }, // 煤污病
      { label: "表面干净", value: "clean" }
    ]
  }
];