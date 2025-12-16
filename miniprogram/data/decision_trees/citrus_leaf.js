// miniprogram/data/decision_trees/citrus_leaf.js
// 柑橘叶片诊断决策树 (V5.0 中医式系统诊断版)
// 核心逻辑：主诉定象 -> 辨证排除 -> 强制查本 -> 综合定性

module.exports = {
  // ================= 第一阶段：望诊定象 (主诉入口) =================
  "start": {
    id: "start",
    title: "【望诊】请仔细观察，叶片最主要的异常表现是什么？",
    type: "single",
    options: [
      { 
        label: "叶片卷曲 / 皱缩 / 畸形", 
        value: "curl", 
        next: "q_curl_direction" 
      },
      { 
        label: "叶片颜色发黄 (黄化)", 
        value: "yellow", 
        next: "q_yellow_pattern" 
      },
      { 
        label: "叶面有斑点 / 坏死 / 霉层", 
        value: "spots", 
        next: "q_spot_type" 
      },
      { 
        label: "以上都不是 (落叶/干枯/树势弱)", 
        value: "other", 
        next: "q_system_check_entry" // 不典型症状，直接查系统体质
      }
    ]
  },

  // ================= 分支 A：卷叶辨证逻辑 =================
  "q_curl_direction": {
    id: "q_curl_direction",
    title: "【望诊】请观察叶片卷曲的方向及形态？",
    type: "single",
    options: [
      { 
        label: "向上卷（像小船一样，向叶面合拢）", 
        value: "curl_up", 
        // 逻辑：上卷多为非生物因素（缺水/药害/根弱），需排除法
        next: "q_exclude_herbicide" 
      },
      { 
        label: "向下卷（呈扣状，向叶背方向卷）", 
        value: "curl_down", 
        // 逻辑：下卷90%是虫害（蚜虫）或缺钙，直接查虫
        next: "q_check_bugs" 
      },
      {
        label: "扭曲 / 畸形 / 呈鸡爪状 / 细长", 
        value: "distorted", 
        // 逻辑：畸形通常是激素中毒或病毒，需问历史
        next: "q_ask_history_spray" 
      }
    ]
  },

  // --- A1. 上卷排除法：查药害 ---
  "q_exclude_herbicide": {
    id: "q_exclude_herbicide",
    title: "【问诊】近期（15天内）果园是否打过除草剂、保果药或高浓度农药？",
    type: "single",
    options: [
      { 
        label: "是，近期刚打过此类药", 
        value: "yes_drug", 
        // 暂定结论：药害，但仍需查根看解毒能力
        tempDiagnosis: "herbicide_damage", 
        next: "q_system_check_entry" 
      },
      { 
        label: "否，近期没打过或很久前打的", 
        value: "no_drug", 
        // 排除药害，下一步查水分
        next: "q_check_water_status" 
      }
    ]
  },

  // --- A2. 上卷排除法：查水分（真旱还是假旱） ---
  "q_check_water_status": {
    id: "q_check_water_status",
    title: "【切诊】请用手摸一下根际土壤，干湿度如何？",
    type: "single",
    options: [
      { 
        label: "土很干，捏不成团，发白", 
        value: "dry_soil", 
        tempDiagnosis: "drought_stress", // 结论：真干旱
        next: "q_system_check_entry" // 虽确诊干旱，也要查根系受损程度
      },
      { 
        label: "土是湿润的，甚至有积水/泥泞", 
        value: "wet_soil", 
        // 逻辑：土湿但叶卷 -> 根烂了吸不到水 -> 假干旱
        // 此时不给结论，直接去查根结和腐烂
        next: "q_system_check_root_knot" 
      }
    ]
  },

  // --- A3. 下卷查虫 ---
  "q_check_bugs": {
    id: "q_check_bugs",
    title: "【查体】请翻开叶片背面，是否有活动虫体、粘液或蜕皮？",
    type: "single",
    options: [
      { 
        label: "有黑色/绿色/黄色小虫 (蚜虫/木虱)", 
        value: "found_aphid", 
        tempDiagnosis: "aphid", 
        next: "q_system_check_entry" 
      },
      { 
        label: "有白色粉虱飞舞", 
        value: "found_whitefly", 
        tempDiagnosis: "whitefly", 
        next: "q_system_check_entry"
      },
      { 
        label: "很干净，没虫", 
        value: "no_bugs", 
        // 逻辑：没虫却反卷，可能是缺钙（老叶）或微量元素失调
        tempDiagnosis: "deficiency_Ca_B",
        next: "q_system_check_entry" 
      }
    ]
  },

  // --- A4. 畸形查历史 ---
  "q_ask_history_spray": {
    id: "q_ask_history_spray",
    title: "【问诊】这种畸形是在打药/施肥后几天内突然出现的吗？",
    type: "single",
    options: [
      { 
        label: "是，农事操作后突然出现", 
        value: "acute", 
        tempDiagnosis: "phytotoxicity", // 急性药害
        next: "q_system_check_entry" 
      },
      { 
        label: "不是，慢慢长出来就是这样", 
        value: "chronic", 
        tempDiagnosis: "viral_disease", // 病毒病或缺锌
        next: "q_system_check_entry" 
      }
    ]
  },

  // ================= 分支 B：黄化辨证逻辑 =================
  "q_yellow_pattern": {
    id: "q_yellow_pattern",
    title: "【望诊】请仔细辨别黄化的具体纹路？",
    type: "single",
    options: [
      { 
        label: "斑驳黄化 (不对称/黄绿相间/红鼻子果)", 
        value: "mottled", 
        next: "q_hlb_confirm" // 疑似黄龙病高危
      },
      { 
        label: "网状黄化 (叶脉绿、叶肉黄)", 
        value: "interveinal", 
        next: "q_leaf_age_check" // 缺素特征
      },
      { 
        label: "均匀黄化 (全叶发黄) 或 脉肿发黄", 
        value: "uniform", 
        // 全黄通常是根系大问题
        next: "q_system_check_entry" 
      }
    ]
  },

  "q_hlb_confirm": {
    id: "q_hlb_confirm",
    title: "【问诊】该树是否伴有“红鼻子果”或比周围树落果更严重？",
    type: "single",
    options: [
      { label: "是，有红鼻子果/落果严重", value: "yes", tempDiagnosis: "HLB_strong_suspect", next: "q_system_check_entry" },
      { label: "否，果实正常", value: "no", tempDiagnosis: "deficiency_Zn_suspect", next: "q_system_check_entry" }
    ]
  },

  "q_leaf_age_check": {
    id: "q_leaf_age_check",
    title: "【辨证】这种黄化主要出现在树的哪个部位？",
    type: "single",
    options: [
      { label: "新梢嫩叶 (顶部)", value: "new", tempDiagnosis: "deficiency_Fe_Zn", next: "q_system_check_entry" },
      { label: "老熟叶片 (中下部)", value: "old", tempDiagnosis: "deficiency_Mg", next: "q_system_check_entry" }
    ]
  },

  // ================= 分支 C：斑点辨证逻辑 =================
  "q_spot_type": {
    id: "q_spot_type",
    title: "【望诊】请描述斑点的形态特征？",
    type: "single",
    options: [
      { 
        label: "火山口状开裂，摸起来挡手粗糙", 
        value: "canker_like", 
        tempDiagnosis: "canker", 
        next: "q_system_check_entry" 
      },
      { 
        label: "银白色/灰白色的蜿蜒虫道 (鬼画符)", 
        value: "miner_trails", 
        tempDiagnosis: "leaf_miner", 
        next: "q_system_check_entry" 
      },
      { 
        label: "红点/白点，叶面失去光泽", 
        value: "red_spider_spots", 
        tempDiagnosis: "red_spider", 
        next: "q_system_check_entry"
      },
      { 
        label: "褐色霉层 / 轮纹斑 / 腐烂斑", 
        value: "fungal_like", 
        tempDiagnosis: "fungal_generic", // 泛指炭疽/砂皮等
        next: "q_system_check_entry" 
      }
    ]
  },

  // ================= 第二阶段：系统查本 (System Check) =================
  // 核心思想：根是本，叶是标。所有流程最终汇聚于此。

  "q_system_check_entry": {
    id: "q_system_check_entry",
    title: "【系统查本】表象信息已收集，最后必须检查根际环境，这决定了能否“断根治疗”。",
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
      { 
        label: "有酸馊味 / 腥臭味 / 酒精味", 
        value: "sour_smell", 
        // 闻出问题，说明湿热/厌氧
        next: "q_system_touch" 
      },
      { 
        label: "刺鼻的氨味 (化肥味)", 
        value: "ammonia_smell", 
        next: "q_system_touch" 
      },
      { 
        label: "无异味 / 正常泥土香", 
        value: "normal_smell", 
        next: "q_system_touch" 
      }
    ]
  },

  "q_system_touch": {
    id: "q_system_touch",
    title: "【切诊】用手捏土壤和根系，质地手感如何？",
    type: "single",
    options: [
      { label: "土粘重板结 / 根系皮肉分离(脱皮)", value: "bad_root", next: "q_system_knot" },
      { label: "土质疏松 / 根系切口发白", value: "good_root", next: "q_system_knot" },
      { label: "根系干枯 / 一折就断", value: "dry_root", next: "q_system_knot" }
    ]
  },
  
  "q_system_check_root_knot": { // 卷叶分支专用的跳板
    id: "q_system_check_root_knot",
    title: "【查本】既然土壤湿润但叶片卷曲，请务必检查根部是否有根结？",
    type: "single",
    options: [
      { label: "有根结 / 肿块", value: "has_knot", isEnd: true }, 
      { label: "没有根结，但根发黑腐烂", value: "no_knot_rot", isEnd: true },
      { label: "根系完好", value: "root_ok", isEnd: true }
    ]
  },

  "q_system_knot": { // 通用终点
    id: "q_system_knot",
    title: "【望诊】侧根或须根上是否有“米粒大小的肿块”（根结）？",
    type: "single",
    options: [
      { label: "有根结", value: "has_knot", isEnd: true }, // 流程结束，提交诊断
      { label: "没有根结", value: "no_knot", isEnd: true }  // 流程结束，提交诊断
    ]
  }
};