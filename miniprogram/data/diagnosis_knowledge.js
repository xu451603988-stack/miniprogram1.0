// miniprogram/data/diagnosis_knowledge.js
// V5.1 专家知识库 (全量版：含叶片、果实、根系、体质)
// 核心职责：提供“辨证逻辑(logic)”和“系统方案(solutions)”

module.exports = {
  // ============================================
  // Part A: 中医体质调理库 (系统查本 - 通用)
  // ============================================
  "_constitutions": {
    "damp_heat": {
      title: "湿热困脾型 (根际环境恶化)",
      desc: "闻诊发现酸臭味，或切诊发现烂根/板结。这表明土壤通气性极差，且伴有厌氧发酵。这种“湿热”环境是疫菌褐腐、根腐病和黄化爆发的温床。",
      action: "第一要务是“通”。必须开沟排水，暴晒树盘，降低湿度。停止施用未腐熟有机肥，冲施微生物菌剂（枯草芽孢杆菌）对抗有害菌。"
    },
    "deficiency_qi": {
      title: "气阴两虚型 (根系活力衰退)",
      desc: "土壤干旱严重，或根系干枯脆断。这表明根系老化，吸收能力（气）和水分供应（阴）都不足，导致地上部树势衰弱，果实易裂、易落。",
      action: "重在“养”。淋施海藻酸、矿源黄腐酸钾或生根剂，诱发新根。叶面配合喷施芸苔素内酯+氨基酸，维持树体生命力。"
    },
    "normal": {
      title: "根际环境健康",
      desc: "土壤结构良好，无异味，根系生长正常，具备良好的水肥吸收能力。",
      action: "维持现有管理模式。建议定期监测土壤pH值和有机质含量，预防胜于治疗。"
    }
  },

  // ============================================
  // Part B: 果实病虫害 (新增板块)
  // ============================================
  "fruit_fly": {
    name: "柑橘大实蝇 (蛆柑)",
    severity: "severe",
    tags: ["虫害", "销毁"],
    logic: "果实腐烂发臭，且内部发现蛆虫。这是实蝇产卵危害的铁证，单纯打药已无法挽回病果。",
    solutions: [
      { type: "销毁", content: "必须捡拾所有落地烂果，集中深埋（撒石灰）或烧毁，切勿随意丢弃。" },
      { type: "诱杀", content: "悬挂全逮实蝇诱捕球，或喷施蛋白饵剂诱杀成虫。" }
    ]
  },
  "canker": {
    name: "溃疡病 (叶果同病)",
    severity: "moderate",
    tags: ["细菌", "传染强"],
    logic: "果面出现“火山口状”开裂病斑，且有黄晕；或叶片也发现了同样病斑。这是典型的细菌性溃疡，叶果互为传染源。",
    solutions: [
      { type: "控病", content: "选用铜制剂（氢氧化铜/波尔多液）、春雷霉素或叶枯唑喷雾。" },
      { type: "防风", content: "台风雨后必须补药。同时防治潜叶蛾，减少伤口。" }
    ]
  },
  "melanose": {
    name: "砂皮病 (黑点病)",
    severity: "moderate",
    tags: ["真菌", "外观品质"],
    logic: "果面密布黑褐色小硬点（摸起来粗糙像沙纸），且枯枝上也发现了类似菌源。这是树势弱、枯枝多的表现。",
    solutions: [
      { type: "清园", content: "核心是剪除枯枝！枯枝是病菌的大本营。" },
      { type: "药剂", content: "喷施80%代森锰锌、苯醚甲环唑或吡唑醚菌酯。" }
    ]
  },
  "brown_rot": {
    name: "疫菌褐腐病 (烂脚瘟)",
    severity: "severe",
    tags: ["暴发性", "雨季"],
    logic: "连续降雨后突然爆发，主要烂的是离地近的下部果，且有酸臭味。这是一种土传性病害，病菌靠雨水飞溅传播。",
    solutions: [
      { type: "急救", content: "立即把离地近的果实撑高，避免接触地面泥水。" },
      { type: "药剂", content: "针对性药剂：甲霜·锰锌、烯酰吗啉或疫霜灵。重点喷树冠下部和地面。" }
    ]
  },
  "thrips": {
    name: "蓟马危害",
    severity: "mild",
    tags: ["虫害", "花皮果"],
    logic: "果蒂周围出现银白色或灰白色的环状疤痕。这是谢花幼果期蓟马取食留下的伤痕。",
    solutions: [
      { type: "提示", content: "现在的疤痕是小时候留下的，目前果实已大，打药无法消除疤痕。" },
      { type: "预防", content: "明年谢花期注意防治，使用乙基多杀菌素或噻虫嗪。" }
    ]
  },
  "sunburn": {
    name: "日灼果 (太阳果)",
    severity: "mild",
    tags: ["物理伤害", "高温"],
    logic: "病斑仅出现在树冠外围向阳面，表现为黄褐色干枯。这是高温强光灼伤，非病理传染。",
    solutions: [
      { type: "物理防护", content: "高温期贴白纸或涂白防晒（石灰水）。" },
      { type: "留草", content: "果园生草栽培，降低地面辐射温度。" }
    ]
  },
  "wind_scar": {
    name: "风疤 / 机械伤",
    severity: "mild",
    tags: ["物理伤害", "无传染"],
    logic: "果面有不规则疤痕，但叶片无病斑，且无传染迹象。通常是幼果期大风导致枝叶摩擦形成。",
    solutions: [
      { type: "建议", content: "无需用药。修剪时注意剪除内膛过密的交叉枝，减少摩擦。" }
    ]
  },
  "cracking_physio": {
    name: "生理性裂果",
    severity: "moderate",
    tags: ["水分失衡", "缺钙"],
    logic: "果皮开裂。通常发生在久旱逢雨、果皮太薄或钙素不足时。",
    solutions: [
      { type: "水分", content: "保持土壤水分稳定，避免忽干忽湿。" },
      { type: "营养", content: "幼果期多次喷施螯合钙或糖醇钙，增加果皮韧性。" }
    ]
  },
  "deficiency_B": {
    name: "缺硼症 (石头果)",
    severity: "moderate",
    tags: ["缺素", "果硬"],
    logic: "果实皮厚、坚硬，果形不正，甚至有胶包。这是典型的缺硼症状。",
    solutions: [
      { type: "补硼", content: "叶面喷施流体硼；根部撒施持效硼肥。" }
    ]
  },
  "deficiency_Zn_fruit": {
    name: "缺锌症 (小果/畸形)",
    severity: "moderate",
    tags: ["缺素", "畸形"],
    logic: "果实偏小或畸形，排除了黄龙病（叶片正常）。倾向于认为是缺锌引起的生长受阻。",
    solutions: [
      { type: "补锌", content: "叶面喷施螯合锌或高纯氧化锌。" },
      { type: "调土", content: "检查土壤pH值，避免过碱导致锌被固定。" }
    ]
  },
  "HLB_confirmed": {
    name: "【确诊】黄龙病",
    severity: "severe",
    tags: ["毁灭性", "砍树"],
    logic: "【叶果互证】成立：既有红鼻子果/畸形果，对应的叶片又表现为斑驳黄化。这是黄龙病的确诊特征。",
    solutions: [
      { type: "五步法", content: "一锯（锯树）、二划（划痕）、三涂（涂草甘膦）、四包（包黑膜）、五清（清木虱）。" },
      { type: "警示", content: "绝对不可留树，越留传染越快！" }
    ]
  },
  "HLB_strong_suspect": {
    name: "【高危】疑似黄龙病",
    severity: "severe",
    tags: ["检疫", "需确认"],
    logic: "出现斑驳黄化叶或红鼻子果，高度疑似黄龙病，需立即处理。",
    solutions: [
      { type: "送检", content: "建议采样送专业机构PCR检测。" },
      { type: "防虫", content: "立即喷杀木虱，防止扩散。" }
    ]
  },
  "anthracnose_fruit": {
    name: "炭疽病 (果实型)",
    severity: "moderate",
    tags: ["真菌", "落果"],
    logic: "果面出现干枯褐色病斑，或果柄处腐烂导致落果。多发于树势衰弱的果园。",
    solutions: [
      { type: "药剂", content: "咪鲜胺、苯醚甲环唑或吡唑醚菌酯。" },
      { type: "壮树", content: "炭疽病是弱寄生菌，增强树势是根本。" }
    ]
  },

  // ============================================
  // Part C: 叶片病虫害 (保留并优化)
  // ============================================
  "herbicide_damage": {
    name: "除草剂 / 激素药害",
    severity: "severe",
    tags: ["非生物胁迫", "急救"],
    logic: "叶片向上卷曲、畸形，且有近期用药史。排除了干旱和病毒病。",
    solutions: [
      { type: "急救", content: "喷水淋洗树冠，降低残留。" },
      { type: "解毒", content: "喷施芸苔素内酯 + 氨基酸叶面肥。" }
    ]
  },
  "aphid": {
    name: "蚜虫 / 蜜露危害",
    severity: "moderate",
    tags: ["虫害", "刺吸式"],
    logic: "叶片下卷，叶背有虫体或蜜露。",
    solutions: [
      { type: "杀虫", content: "吡虫啉、噻虫嗪或氟啶虫酰胺。" },
      { type: "清园", content: "配合矿物油清洗煤污。" }
    ]
  },
  "whitefly": {
    name: "粉虱危害",
    severity: "moderate",
    tags: ["虫害", "刺吸式"],
    logic: "发现白色飞舞小虫。粉虱是病毒传播媒介，需重视。",
    solutions: [
      { type: "药剂", content: "烯啶虫胺、吡丙醚或螺虫乙酯。" }
    ]
  },
  "nematodes": {
    name: "根结线虫病",
    severity: "severe",
    tags: ["根系病害", "难治"],
    logic: "叶片黄弱、似缺水，【查本】发现根部有米粒状根结。",
    solutions: [
      { type: "杀线", content: "阿维菌素·噻唑膦或氟吡菌酰胺灌根。" },
      { type: "养根", content: "配合海藻酸生根剂，促进新根生长。" }
    ]
  },
  "leaf_miner": {
    name: "潜叶蛾 (鬼画符)",
    severity: "mild",
    tags: ["新梢虫害"],
    logic: "新叶上有银白色蜿蜒虫道。",
    solutions: [
      { type: "防治", content: "新梢萌发期喷施氯虫苯甲酰胺或阿维菌素。" }
    ]
  },
  "red_spider": {
    name: "红蜘蛛",
    severity: "moderate",
    tags: ["顽固害虫"],
    logic: "叶面出现密集白点，失去光泽。",
    solutions: [
      { type: "药剂", content: "联苯肼酯、乙唑螨腈、螺螨酯（轮换使用）。" }
    ]
  },
  "deficiency_Fe_Zn": {
    name: "缺铁 / 缺锌",
    severity: "moderate",
    tags: ["缺素", "新叶"],
    logic: "新梢嫩叶黄化（网状脉或小叶斑驳）。",
    solutions: [
      { type: "补素", content: "喷施螯合铁+螯合锌。" },
      { type: "调酸", content: "根际施用酸性有机肥，调节pH值。" }
    ]
  },
  "deficiency_Mg": {
    name: "缺镁症",
    severity: "moderate",
    tags: ["缺素", "老叶"],
    logic: "老叶出现倒V字型黄斑。",
    solutions: [
      { type: "补镁", content: "根施钙镁磷肥，叶喷硝酸镁。" }
    ]
  },
  "deficiency_Ca_B": {
    name: "缺钙 / 缺硼",
    severity: "mild",
    tags: ["缺素", "叶形"],
    logic: "叶片反卷但无虫，或叶脉肿大开裂。多为钙硼缺乏所致。",
    solutions: [
      { type: "补素", content: "叶面喷施糖醇钙+流体硼。" }
    ]
  },
  "deficiency_Zn_suspect": {
    name: "疑似缺锌",
    severity: "mild",
    tags: ["缺素"],
    logic: "叶片斑驳黄化，但果实正常，暂排除黄龙病，优先按缺锌调理。",
    solutions: [
      { type: "补锌", content: "喷施高纯锌肥，观察新梢转绿情况。" }
    ]
  },
  "root_rot_systemic": {
    name: "系统性根腐病",
    severity: "severe",
    tags: ["湿热", "根烂"],
    logic: "全树黄化衰弱，且【查本】确认根部酸臭腐烂。",
    solutions: [
      { type: "排水", content: "开沟降湿，打破厌氧环境。" },
      { type: "灌根", content: "甲霜·恶霉灵 + 生根剂。" }
    ]
  },
  "phytotoxicity": {
    name: "急性药害/肥害",
    severity: "severe",
    tags: ["急性", "中毒"],
    logic: "施肥/打药后迅速出现的枯斑、落叶或畸形。",
    solutions: [
      { type: "淋洗", content: "大量清水冲洗叶面或灌溉根部洗盐。" }
    ]
  },
  "drought_stress": {
    name: "生理性干旱",
    severity: "mild",
    tags: ["缺水"],
    logic: "叶卷且土壤干燥，排除病虫害。",
    solutions: [
      { type: "补水", content: "及时淋水，树盘覆盖保湿。" }
    ]
  },
  "fungal_generic": {
    name: "真菌性病害 (炭疽/砂皮)",
    severity: "moderate",
    tags: ["真菌"],
    logic: "叶面/果面出现褐色霉层或轮纹斑，多发于雨后。",
    solutions: [
      { type: "药剂", content: "代森锰锌、咪鲜胺、苯醚甲环唑。" }
    ]
  },
  "viral_disease": {
    name: "病毒病 / 遗传畸形",
    severity: "moderate",
    tags: ["慢性", "难治"],
    logic: "叶片长期畸形/扭曲，但无近期药害史。可能是碎叶病或温州蜜柑萎缩病。",
    solutions: [
      { type: "调理", content: "病毒病无特效药。建议增施有机肥壮树，钝化病毒。" }
    ]
  },
  "soil_compaction": {
    name: "土壤板结 / 根系窒息",
    severity: "moderate",
    tags: ["土壤", "气滞"],
    logic: "树势弱，根系少，土壤坚硬板结。这是根系“缺氧”的表现。",
    solutions: [
      { type: "改土", content: "深翻扩穴，施入腐熟有机肥和生物菌肥，增加土壤孔隙度。" }
    ]
  },

  // ============================================
  // Part D: 兜底
  // ============================================
  "unknown": {
    name: "非典型综合症",
    severity: "mild",
    tags: ["需观察"],
    logic: "当前症状组合不典型，未匹配到单一特定病虫害。建议主要依据【根际体质】进行调理。",
    solutions: [
      { type: "调理", content: "均衡水肥，使用海藻酸调理根系。" },
      { type: "观察", content: "持续观察症状变化，如有新症状出现请重新诊断。" }
    ]
  }
};