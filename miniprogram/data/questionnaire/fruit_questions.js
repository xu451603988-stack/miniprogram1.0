/**
 * miniprogram/data/questionnaire/fruit_questions.js
 * 果实诊断题库 - 适配权重融合算法 (对象结构版)
 */

module.exports = {
  // 1. 核心入口节点 (ID必须是 start)
  "start": {
    id: "start",
    title: "【果实整体】请观察果实，最明显的异常出现在哪里？",
    type: "single",
    required: true,
    options: [
      { label: "果皮表面有斑点或疤痕", value: "symptom_spots", next: "fruit_spots_detail" },
      { label: "果实颜色不正常 (转色慢/不均)", value: "symptom_color", next: "fruit_color_detail" },
      { label: "果实形状或大小异常", value: "symptom_shape", next: "fruit_shape_detail" },
      { label: "果实腐烂或脱落", value: "symptom_rot", next: "fruit_rot_detail" }
    ]
  },

  // 2. 斑点/疤痕 细分
  "fruit_spots_detail": {
    id: "fruit_spots_detail",
    title: "【望诊-表皮】请仔细观察斑点的形态：",
    type: "single",
    required: true,
    options: [
      { label: "火山状凸起的褐色病斑 (摸起来粗糙)", value: "canker_fruit", isEnd: true }, // 溃疡病
      { label: "泪痕状或泥块状黑色附着物", value: "melanose_fruit", isEnd: true }, // 砂皮病
      { label: "灰白色圈状/环状疤痕 (像眼镜框)", value: "thrips_scar", isEnd: true }, // 蓟马
      { label: "凹陷的褐色腐烂斑", value: "anthracnose_fruit", isEnd: true }, // 炭疽病
      { label: "其他不规则斑点", value: "unknown_spots", isEnd: true }
    ]
  },

  // 3. 颜色异常 细分
  "fruit_color_detail": {
    id: "fruit_color_detail",
    title: "【望诊-着色】颜色的具体异常表现是？",
    type: "single",
    required: true,
    options: [
      { label: "红鼻子果 (果蒂红，果身青)", value: "hlb_red_nose", isEnd: true }, // 黄龙病典型
      { label: "向阳面出现黄白色灼伤斑", value: "sunburn_fruit", isEnd: true }, // 日灼
      { label: "果实偏小且一直不转色 (青僵果)", value: "green_stiff_fruit", isEnd: true }, // 缺素或根系差
      { label: "转色不均匀 (花斑果)", value: "color_uneven", isEnd: true }
    ]
  },

  // 4. 形状/大小 细分
  "fruit_shape_detail": {
    id: "fruit_shape_detail",
    title: "【望诊-形态】果实形状发生了什么变化？",
    type: "single",
    required: true,
    options: [
      { label: "果实开裂 (裂果)", value: "fruit_cracking", isEnd: true }, // 缺钙/水分剧变
      { label: "果实畸形/歪斜", value: "deformed_fruit", isEnd: true }, // 缺硼/授粉不良
      { label: "果皮异常增厚/浮皮", value: "thick_skin", isEnd: true }, // 氮肥过多
      { label: "果实个头明显偏小", value: "small_fruit", isEnd: true }
    ]
  },

  // 5. 腐烂/脱落 细分
  "fruit_rot_detail": {
    id: "fruit_rot_detail",
    title: "【查体-落果】落果或腐烂时的特征？",
    type: "single",
    required: true,
    options: [
      { label: "蒂部褐色腐烂 (蒂腐)", value: "stem_end_rot", isEnd: true },
      { label: "果实发霉 (青霉/绿霉)", value: "mold_rot", isEnd: true },
      { label: "大量生理性落果 (无明显病斑)", value: "physiological_drop", isEnd: true },
      { label: "虫蛀导致的落果 (有虫眼)", value: "insect_drop", isEnd: true }
    ]
  }
};