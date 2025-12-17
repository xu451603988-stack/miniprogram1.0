// miniprogram/data/decision_trees/citrus_fruit.js
// 柑橘果实决策树 V5.1 (国际植保标准版)

module.exports = {
  // ================= 第一阶段：果实望诊 =================
  "start": {
    id: "start",
    title: "【望诊】果实最主要的异常出现在哪里？",
    type: "single",
    options: [
      { label: "果皮表面 (斑点/疤痕)", value: "skin_issue", next: "q_fruit_appearance" },
      { label: "果形与颜色 (畸形/异常色)", value: "shape_issue", next: "q_fruit_shape" },
      { label: "果实腐烂/落果", value: "rot_issue", next: "q_drop_check" }
    ]
  },

  // --- 分支 A：果面辨证 ---
  "q_fruit_appearance": {
    id: "q_fruit_appearance",
    title: "【望诊】请描述果皮瑕疵的具体形态？",
    type: "single",
    options: [
      { 
        label: "火山口状开裂病斑 (有黄晕，手摸粗糙)", 
        value: "canker_spots", 
        tempDiagnosis: "canker", 
        next: "q_system_check_entry" 
      },
      { 
        label: "密布黑褐色小硬点 (像撒了沙子/泪痕)", 
        value: "melanose_spots", 
        tempDiagnosis: "melanose", 
        next: "q_system_check_entry" 
      },
      { 
        label: "果蒂周围银白色/灰白色环状疤痕", 
        value: "thrips_ring", 
        tempDiagnosis: "thrips", 
        next: "q_system_check_entry" 
      },
      { 
        label: "向阳面有大块黄褐色干枯斑 (日灼)", 
        value: "sunburn_patch", 
        tempDiagnosis: "sunburn", 
        next: "q_system_check_entry" 
      },
      { 
        label: "针头大小虫孔 (或流胶/内部有蛆)", 
        value: "maggot_rot", 
        tempDiagnosis: "fruit_fly", 
        next: "q_system_check_entry" 
      }
    ]
  },

  // --- 分支 B：形色辨证 ---
  "q_fruit_shape": {
    id: "q_fruit_shape",
    title: "【望诊】果实的形状或转色有什么异常？",
    type: "single",
    options: [
      { 
        label: "红鼻子果 (果蒂红、果顶青，转色颠倒)", 
        value: "red_nose", 
        tempDiagnosis: "hlb", // 强特征
        next: "q_system_check_entry" 
      },
      { 
        label: "果皮开裂 (裂果)", 
        value: "cracking", 
        tempDiagnosis: "cracking", 
        next: "q_system_check_entry" 
      },
      { 
        label: "果皮特厚、粗糙，果实偏硬 (石头果)", 
        value: "thick_skin", 
        tempDiagnosis: "deficiency_B", 
        next: "q_system_check_entry" 
      },
      { 
        label: "果实偏小或畸形 (歪瓜裂枣)", 
        value: "deformed", 
        tempDiagnosis: "deficiency_Fe_Zn", 
        next: "q_system_check_entry" 
      }
    ]
  },

  // --- 分支 C：落果辨证 ---
  "q_drop_check": {
    id: "q_drop_check",
    title: "【查体】检查落果的果柄处？",
    type: "single",
    options: [
      { 
        label: "带果柄和叶片一起落 (枯蒂)", 
        value: "drop_severe", 
        // 严重胁迫，多为烂根或肥害
        next: "q_system_check_entry" 
      },
      { 
        label: "果柄处平滑脱落 (离层脱落)", 
        value: "drop_smooth", 
        tempDiagnosis: "anthracnose", // 或是生理落果
        next: "q_system_check_entry" 
      }
    ]
  },

  // ================= 系统查本连接点 =================
  "q_system_check_entry": {
    id: "q_system_check_entry",
    title: "【系统查本】果实问题往往根源在地下。请检查根际环境。",
    type: "single", 
    options: [
      { label: "检查根部", value: "continue", next: "q_system_touch" }
    ]
  },
  
  // 复用叶片的根系检查逻辑，保持一致性
  "q_system_touch": {
    id: "q_system_touch",
    title: "【切诊】用手捏一下根系和土壤，手感和质地如何？",
    type: "single",
    options: [
      { label: "根皮腐烂，软烂脱皮", value: "root_rot_smell", next: "q_system_knot" },
      { label: "根系干枯变黑，发脆易断", value: "root_burn_dry", next: "q_system_knot" },
      { label: "根系红褐，僵硬无白根", value: "root_red_stagnant", next: "q_system_knot" },
      { label: "根系正常，断面发白", value: "root_healthy", next: "q_system_knot" }
    ]
  },

  "q_system_knot": {
    id: "q_system_knot",
    title: "【望诊】根部是否有“根结”肿块？",
    type: "single",
    options: [
      { label: "有根结", value: "has_knot", isEnd: true }, 
      { label: "无根结", value: "no_knot", isEnd: true }
    ]
  }
};