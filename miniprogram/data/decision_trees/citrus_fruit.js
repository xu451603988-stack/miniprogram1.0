// miniprogram/data/decision_trees/citrus_fruit.js
// 柑橘果实诊断决策树 (V5.0 叶果联动版)
// 核心逻辑：果实表象 -> 排除非生物因素 -> 【叶果互证】 -> 查本

module.exports = {
  // ================= 第一阶段：望诊定象 =================
  "start": {
    id: "start",
    title: "【望诊】请仔细观察，果实最主要的异常表现是什么？",
    type: "single",
    options: [
      { 
        label: "果皮表面有斑点 / 疤痕 / 霉层", 
        value: "spots", 
        next: "q_spot_appearance" 
      },
      { 
        label: "果实腐烂 / 变软 / 发臭", 
        value: "rot", 
        next: "q_rot_smell" 
      },
      { 
        label: "异常落果 (未熟先落)", 
        value: "drop", 
        next: "q_drop_check" 
      },
      { 
        label: "果实畸形 / 大小不一 / 颜色异常", 
        value: "deformity", 
        next: "q_deformity_type" 
      }
    ]
  },

  // ================= 分支 A：斑点辨证 (叶果互证核心区) =================
  "q_spot_appearance": {
    id: "q_spot_appearance",
    title: "【望诊】请描述斑点的具体形态？",
    type: "single",
    options: [
      { 
        label: "火山口状开裂，边缘有油渍状黄晕", 
        value: "canker_like", 
        // 疑似溃疡，需反查叶片
        next: "q_linkage_canker_leaf" 
      },
      { 
        label: "黑褐色小点 (像沙子)，或泪痕状条纹", 
        value: "sand_skin", 
        // 疑似砂皮，需反查枝条
        next: "q_linkage_melanose_twig" 
      },
      { 
        label: "灰白色/银白色环状疤痕 (主要在果蒂)", 
        value: "ring_scar", 
        // 蓟马典型特征
        tempDiagnosis: "thrips", 
        next: "q_system_check_entry"
      },
      { 
        label: "大块黄褐色干枯斑 (向阳面)", 
        value: "sunburn_like", 
        next: "q_exclude_sunburn" 
      }
    ]
  },

  // --- A1. 联动：查叶片溃疡 ---
  "q_linkage_canker_leaf": {
    id: "q_linkage_canker_leaf",
    title: "【叶果互证】请观察附近的叶片，是否也有类似的“火山口状斑点”？",
    type: "single",
    options: [
      { 
        label: "是，叶片上也有同样的病斑", 
        value: "leaf_has_spots", 
        tempDiagnosis: "canker", // 铁证如山
        next: "q_system_check_entry" 
      },
      { 
        label: "否，叶片很干净", 
        value: "leaf_clean", 
        // 只有果有，可能是风疤或机械伤，非传染性溃疡
        tempDiagnosis: "wind_scar", 
        next: "q_system_check_entry"
      }
    ]
  },

  // --- A2. 联动：查枝条砂皮 ---
  "q_linkage_melanose_twig": {
    id: "q_linkage_melanose_twig",
    title: "【系统查证】请观察枯枝或结果枝，表面是否有褐色小粒点（摸起来粗糙）？",
    type: "single",
    options: [
      { 
        label: "有，枝条上密布小黑点", 
        value: "twig_infected", 
        tempDiagnosis: "melanose", // 确诊砂皮病
        advice: "砂皮病菌源在枯枝。必须先剪除枯枝，再喷施苯醚甲环唑。",
        next: "q_system_check_entry" 
      },
      { 
        label: "没有，枝条光滑", 
        value: "twig_clean", 
        next: "q_system_check_entry" // 仍可能是轻微感染
      }
    ]
  },

  // --- A3. 排除：日灼 ---
  "q_exclude_sunburn": {
    id: "q_exclude_sunburn",
    title: "【辨证】这些斑块是否主要集中在树冠外围、向阳的果实上？",
    type: "single",
    options: [
      { 
        label: "是，都是晒得到的果", 
        value: "outer_fruit", 
        tempDiagnosis: "sunburn", // 确诊日灼
        next: "q_system_check_entry" 
      },
      { 
        label: "不是，内膛/背阴果也有", 
        value: "inner_fruit", 
        tempDiagnosis: "phytotoxicity", // 可能是药害灼伤
        next: "q_system_check_entry" 
      }
    ]
  },

  // ================= 分支 B：腐烂/落果辨证 =================
  "q_rot_smell": {
    id: "q_rot_smell",
    title: "【闻诊】拿起腐烂果闻一下，有什么气味？",
    type: "single",
    options: [
      { 
        label: "酸臭味，且果皮呈水渍状褐变", 
        value: "sour_rot", 
        next: "q_check_rain" // 疑似酸腐/褐腐
      },
      { 
        label: "恶臭，且果内有蛆虫/孔洞", 
        value: "maggot", 
        tempDiagnosis: "fruit_fly", // 确诊实蝇
        isEnd: true, // 实蝇较独立，可直接出结果，也可查本
        advice: "果实蝇危害。必须清理烂果深埋，悬挂诱捕器及喷施诱饵。"
      }
    ]
  },

  "q_check_rain": {
    id: "q_check_rain",
    title: "【问诊】近期是否有连续降雨，且主要烂的是下部果？",
    type: "single",
    options: [
      { 
        label: "是，雨后爆发，离地近的烂得多", 
        value: "rainy_lower", 
        tempDiagnosis: "brown_rot", // 疫菌褐腐病
        next: "q_system_check_entry" // 这种病必查土壤排水
      },
      { 
        label: "否，全树都有，天气干燥", 
        value: "dry_all", 
        tempDiagnosis: "anthracnose_fruit", // 炭疽落果
        next: "q_system_check_entry"
      }
    ]
  },

  "q_drop_check": {
    id: "q_drop_check",
    title: "【查体】捡起落果查看果柄（蒂头）？",
    type: "single",
    options: [
      { 
        label: "果柄带叶片一起脱落", 
        value: "with_leaf", 
        // 严重逆境：肥害/药害/积水
        next: "q_system_check_entry" 
      },
      { 
        label: "果柄处平滑脱落 (无叶)", 
        value: "smooth_drop", 
        // 生理性落果或炭疽
        next: "q_linkage_anthracnose_leaf" 
      }
    ]
  },

  // ================= 分支 C：畸形/黄龙病联动 =================
  "q_deformity_type": {
    id: "q_deformity_type",
    title: "【望诊】果实的具体异常形态？",
    type: "single",
    options: [
      { 
        label: "红鼻子果 (果蒂红果顶青) / 歪瓜裂枣", 
        value: "red_nose", 
        next: "q_linkage_hlb_leaf" // 高危！必须查叶
      },
      { 
        label: "果皮很厚、很硬，甚至有胶包", 
        value: "thick_skin", 
        tempDiagnosis: "deficiency_B", // 缺硼
        next: "q_system_check_entry"
      },
      { 
        label: "果实开裂 (裂果)", 
        value: "cracking", 
        tempDiagnosis: "cracking_physio", // 裂果
        next: "q_system_check_entry"
      }
    ]
  },

  // --- C1. 联动：黄龙病查叶 ---
  "q_linkage_hlb_leaf": {
    id: "q_linkage_hlb_leaf",
    title: "【叶果互证】这是黄龙病典型特征！请务必检查叶片：是否有“斑驳黄化”？",
    type: "single",
    options: [
      { 
        label: "有，叶片黄绿相间，不对称", 
        value: "leaf_mottled", 
        tempDiagnosis: "HLB_confirmed", // 基本确诊
        advice: "红鼻子果+斑驳叶=黄龙病确诊。请立即砍除病树，没药可救，只能防扩散。",
        isEnd: true 
      },
      { 
        label: "没有，叶片正常或均匀黄", 
        value: "leaf_normal", 
        tempDiagnosis: "deficiency_Zn_fruit", // 可能是缺锌引起的畸形
        next: "q_system_check_entry"
      }
    ]
  },

  // ================= 第二阶段：系统查本 (复用叶片的逻辑节点) =================
  // 注意：这里的ID必须与 question.js 中的逻辑匹配
  
  "q_system_check_entry": {
    id: "q_system_check_entry",
    title: "【系统查本】果实表象已确认。最后请检查根系，往往“果病根治”。",
    type: "single", 
    options: [
      { label: "开始检查根部 (闻/切/看)", value: "continue", next: "q_system_smell" }
    ]
  },

  "q_system_smell": {
    id: "q_system_smell",
    title: "【闻诊】抓一把根际深处的土壤闻一下，气味是？",
    type: "single",
    options: [
      { label: "有酸馊味 / 腥臭味 (湿热)", value: "sour_smell", next: "q_system_touch" },
      { label: "正常泥土香", value: "normal_smell", next: "q_system_touch" }
    ]
  },

  "q_system_touch": {
    id: "q_system_touch",
    title: "【切诊】用手捏土壤和根系，质地手感如何？",
    type: "single",
    options: [
      { label: "土粘重板结 / 根系腐烂脱皮", value: "bad_root", next: "q_system_knot" },
      { label: "土质疏松 / 根系正常", value: "good_root", next: "q_system_knot" },
      { label: "根系干枯 / 脆断", value: "dry_root", next: "q_system_knot" }
    ]
  },

  "q_system_knot": {
    id: "q_system_knot",
    title: "【望诊】侧根上是否有“根结”（肿块）？",
    type: "single",
    options: [
      { label: "有根结", value: "has_knot", isEnd: true }, 
      { label: "没有根结", value: "no_knot", isEnd: true }
    ]
  }
};