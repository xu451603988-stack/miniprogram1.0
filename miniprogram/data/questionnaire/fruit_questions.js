// miniprogram/data/questionnaire/fruit_questions.js
// 国际标准果实诊断问卷 V5.0
// 对应算法特征：THRIPS, SUNBURN, MELANOSE, CANKER, FRUIT_FLY, HLB_FRUIT

module.exports = [
  {
    id: "fruit_appearance",
    title: "【望诊-果面】果皮表面最明显的瑕疵是什么？（可多选）",
    type: "multiple",
    required: true,
    options: [
      { label: "火山口状开裂病斑（有黄晕，手摸粗糙）", value: "canker_spots" }, // 溃疡
      { label: "密布黑褐色小硬点（像撒了沙子/泪痕）", value: "melanose_spots" }, // 砂皮
      { label: "果蒂周围银白色/灰白色环状疤痕", value: "thrips_ring" }, // 蓟马
      { label: "大块黄褐色干枯斑（主要在向阳面）", value: "sunburn_patch" }, // 日灼
      { label: "果面有针头大小虫孔（或流胶/发臭）", value: "maggot_rot" }, // 实蝇
      { label: "果面干净", value: "surface_clean" }
    ]
  },
  {
    id: "fruit_shape_color",
    title: "【望诊-形色】果实的形状和转色情况？",
    type: "single",
    required: true,
    options: [
      { label: "红鼻子果（果蒂红、果顶青，转色颠倒）", value: "red_nose" }, // 黄龙病铁证
      { label: "果实开裂（裂果）", value: "cracking" }, // 裂果
      { label: "果皮特厚、粗糙，果实偏硬", value: "thick_skin" }, // 缺硼
      { label: "果实偏小或畸形（歪瓜裂枣）", value: "deformed" }, // 缺锌/黄龙病
      { label: "果形色泽正常", value: "normal" }
    ]
  },
  {
    id: "drop_status",
    title: "【问诊-落果】近期是否有落果现象？",
    type: "single",
    required: true,
    options: [
      { label: "大量落果（连带果柄/叶片一起落）", value: "drop_severe" }, // 严重胁迫
      { label: "有落果（果柄处平滑脱落）", value: "drop_smooth" }, // 生理性/炭疽
      { label: "基本不落果", value: "drop_none" }
    ]
  }
];