// miniprogram/data/decision_trees/citrus_leaf.js
// 柑橘叶片与根系决策树 V5.1 (国际植保标准版)
// 包含：叶片(颜色/形态/病斑) + 根系(质地/形态)

module.exports = {
  // ================= 第一阶段：叶片望诊 (Visual Diagnosis) =================
  "start": {
    id: "start",
    title: "【望诊】请观察叶片，最明显的异常属于哪一类？",
    type: "single",
    options: [
      { 
        label: "颜色异常 (发黄/花叶/白化)", 
        value: "color_issue", 
        next: "q_leaf_color_pattern" 
      },
      { 
        label: "形态异常 (卷曲/畸形/枯焦)", 
        value: "shape_issue", 
        next: "q_leaf_shape_type" 
      },
      { 
        label: "表面病斑 (斑点/霉层/虫道)", 
        value: "lesion_issue", 
        next: "q_leaf_lesion_type" 
      }
    ]
  },

  // --- 分支 A：颜色辨证 (Color) ---
  "q_leaf_color_pattern": {
    id: "q_leaf_color_pattern",
    title: "【辨证】请仔细观察黄化的具体纹路特征？",
    type: "single",
    options: [
      { 
        label: "斑驳黄化 (黄绿相间不对称，花叶)", 
        value: "mottling_yellow", 
        tempDiagnosis: "hlb", // 疑似黄龙病
        next: "q_system_check_entry" 
      },
      { 
        label: "网状黄化 (叶脉绿，脉间肉黄/白)", 
        value: "interveinal_chlorosis", 
        tempDiagnosis: "deficiency_Fe_Zn", // 缺铁/锌
        next: "q_system_check_entry" 
      },
      { 
        label: "倒V字黄斑 (仅老叶基部黄，尖端绿)", 
        value: "inverted_v_yellow", 
        tempDiagnosis: "deficiency_Mg", // 缺镁
        next: "q_system_check_entry" 
      },
      { 
        label: "脉肿黄化 (叶脉肿大木栓化/发黄)", 
        value: "vein_chlorosis", 
        tempDiagnosis: "deficiency_B", // 缺硼/衰退
        next: "q_system_check_entry" 
      },
      { 
        label: "均匀黄化 (全叶枯黄/无光泽)", 
        value: "uniform_yellow", 
        // 可能是缺氮或根腐，必须查根
        next: "q_system_check_entry" 
      },
      { 
        label: "灰白失绿 (密布针尖状小白点)", 
        value: "red_spider_symptoms", 
        tempDiagnosis: "red_spider", 
        next: "q_system_check_entry" 
      }
    ]
  },

  // --- 分支 B：形态辨证 (Shape) ---
  "q_leaf_shape_type": {
    id: "q_leaf_shape_type",
    title: "【辨证】叶片的形状发生了什么变化？",
    type: "single",
    options: [
      { 
        label: "向叶背反卷 (像扣过来的船)", 
        value: "curl_down", 
        next: "q_check_leaf_back" // 查虫或根
      },
      { 
        label: "向叶面正卷 (U形卷曲/筒状)", 
        value: "curl_up", 
        tempDiagnosis: "drought_stress", // 暂定干旱，需查根确认
        next: "q_system_check_entry" 
      },
      { 
        label: "畸形/狭小/直立 (像辣椒叶)", 
        value: "small_stiff", 
        tempDiagnosis: "deficiency_Fe_Zn", // 缺锌典型
        next: "q_system_check_entry" 
      },
      { 
        label: "叶缘/叶尖焦枯 (像火烧过)", 
        value: "tip_burn", 
        tempDiagnosis: "root_burn", // 肥害/热害
        next: "q_system_check_entry" 
      }
    ]
  },

  "q_check_leaf_back": {
    id: "q_check_leaf_back",
    title: "【查体】翻开卷叶背面，是否发现虫体或排泄物？",
    type: "single",
    options: [
      { label: "有蚜虫/木虱/粉虱 (或蜜露)", value: "aphid", tempDiagnosis: "aphid", next: "q_system_check_entry" },
      { label: "非常干净，无虫", value: "no_bugs", tempDiagnosis: "weak_root", next: "q_system_check_entry" } // 无虫反卷多为根弱
    ]
  },

  // --- 分支 C：病斑辨证 (Lesion) ---
  "q_leaf_lesion_type": {
    id: "q_leaf_lesion_type",
    title: "【查体】请描述病斑的具体形态？",
    type: "single",
    options: [
      { 
        label: "银白色弯曲虫道 (鬼画符)", 
        value: "leaf_miner_trails", 
        tempDiagnosis: "leaf_miner", 
        next: "q_system_check_entry" 
      },
      { 
        label: "火山口状开裂 (摸起来粗糙挡手)", 
        value: "canker_spots", 
        tempDiagnosis: "canker", 
        next: "q_system_check_entry" 
      },
      { 
        label: "褐色轮纹斑/腐烂斑 (有霉层)", 
        value: "anthracnose_spots", 
        tempDiagnosis: "anthracnose", 
        next: "q_system_check_entry" 
      },
      { 
        label: "黑色煤烟状粉末 (煤污)", 
        value: "sooty_mold", 
        tempDiagnosis: "scale_insect", // 煤污多由蚧壳虫/蚜虫引起
        next: "q_system_check_entry" 
      }
    ]
  },

  // ================= 第二阶段：系统查本 (Root & Soil) =================
  // 这里就是你截图里那个界面的升级版逻辑

  "q_system_check_entry": {
    id: "q_system_check_entry",
    title: "【系统查本】叶片表象已确认。最后请务必检查根际环境，这是“治本”的关键。",
    type: "single", 
    options: [
      { label: "开始检查根部 (切/望/闻)", value: "continue", next: "q_system_touch" }
    ]
  },

  "q_system_touch": {
    id: "q_system_touch",
    title: "【切诊】用手捏一下根系和土壤，手感和质地如何？",
    type: "single",
    options: [
      { 
        label: "根皮腐烂，手捏软烂脱皮 (伴有酸臭味)", 
        value: "root_rot_smell", 
        next: "q_system_knot" 
      },
      { 
        label: "根系干枯变黑，发脆一折就断 (像干柴)", 
        value: "root_burn_dry", 
        next: "q_system_knot" 
      },
      { 
        label: "根系颜色发红/发褐，僵硬无新根 (僵苗)", 
        value: "root_red_stagnant", 
        next: "q_system_knot" 
      },
      { 
        label: "根系新鲜有弹性，断面发白 (正常)", 
        value: "root_healthy", 
        next: "q_system_knot" 
      }
    ]
  },

  "q_system_knot": {
    id: "q_system_knot",
    title: "【望诊】侧根或须根上是否有“米粒大小的肿块”(根结)？",
    type: "single",
    options: [
      { label: "有根结 (串珠状肿大)", value: "has_knot", isEnd: true }, 
      { label: "光滑无根结", value: "no_knot", isEnd: true }
    ]
  }
};