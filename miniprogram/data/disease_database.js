// miniprogram/data/disease_database.js
// 全局病害知识库中心
// 包含：病害名称、风险等级、专家辨证逻辑、防治方案

module.exports = {
  // ================= 根系病害 =================
  "nematodes": {
    name: "根结线虫病 (Nematodes)",
    severity: "severe",
    logic: "🔍【专家辨证】根部发现肿大结节（根结），这是线虫破坏输导组织的铁证。会导致根系无法吸收水肥，引起地上部黄化衰退。",
    solutions: [
      { type: "急救用药", content: "使用10%噻唑膦颗粒剂、或1.8%阿维菌素乳油兑水灌根。" },
      { type: "根系修复", content: "杀线7天后，淋施含腐植酸、海藻酸的生根剂。" },
      { type: "农业防治", content: "增施腐熟有机肥，改善根际微生态。" }
    ]
  },
  "root_rot_fungal": {
    name: "根腐病/沤根 (Root Rot)",
    severity: "severe",
    logic: "🔍【专家辨证】根系皮层腐烂发黑且有酸臭味，说明根际缺氧或受疫霉菌侵染。根死则叶黄，需立即抢救。",
    solutions: [
      { type: "急救排水", content: "开挖排水沟，扒开根颈部土壤晾根。" },
      { type: "杀菌灌根", content: "使用30%甲霜·恶霉灵、或25%精甲霜灵灌根。" }
    ]
  },
  "root_burn": {
    name: "肥害/药害 (Root Burn)",
    severity: "moderate",
    logic: "🔍【专家辨证】根系脱水干枯，叶缘焦枯（火烧状），结合近期施肥/用药史，判定为浓度过高引起的渗透胁迫。",
    solutions: [
      { type: "紧急缓解", content: "立即停止施肥！用大量清水淋灌根部冲淡浓度。" },
      { type: "叶面解毒", content: "喷施碧护（赤·吲乙·芸苔）或芸苔素内酯。" }
    ]
  },
  "weak_root": {
    name: "根系衰退综合症",
    severity: "moderate",
    logic: "🔍【专家辨证】树势衰弱伴随叶片反卷，虽未见明显根结或腐烂，但根系吸收功能已显著下降（隐形根病）。",
    solutions: [
      { type: "养根调理", content: "淋施含矿源黄腐酸钾的水溶肥，改良根际环境。" }
    ]
  },

  // ================= 叶果病虫 =================
  "canker": {
    name: "溃疡病 (Canker)",
    severity: "moderate",
    logic: "🔍【专家辨证】病斑呈火山口状开裂，有黄晕。这是细菌性病害典型特征，易随风雨传播。",
    solutions: [
      { type: "化学防治", content: "选用氢氧化铜、春雷霉素或王铜喷雾。" },
      { type: "避雨防风", content: "台风雨前后是防治关键期，务必抢晴喷药。" }
    ]
  },
  "red_spider": {
    name: "红蜘蛛 (Red Mite)",
    severity: "moderate",
    logic: "🔍【专家辨证】叶面出现密集灰白失绿点，失去光泽。这是红蜘蛛刺吸叶片汁液所致。",
    solutions: [
      { type: "杀螨剂", content: "轮换使用联苯肼酯、乙螨唑、螺螨酯，重点喷叶背。" }
    ]
  },
  "leaf_miner": {
    name: "潜叶蛾 (Leaf Miner)",
    severity: "mild",
    logic: "🔍【专家辨证】新梢叶片出现银白色弯曲虫道（鬼画符），易诱发溃疡病。",
    solutions: [
      { type: "保梢用药", content: "新梢抽出“一粒米”长时，喷施氯虫苯甲酰胺。" }
    ]
  },
  "fruit_fly": {
    name: "果实蝇 (Fruit Fly)",
    severity: "severe",
    logic: "🔍【专家辨证】俗称针蜂。果实内部发现蛆虫或果面有产卵孔，会导致果实腐烂脱落。",
    solutions: [
      { type: "物理诱杀", content: "悬挂全降解黄板 + 性诱剂诱捕雄虫。" },
      { type: "销毁", content: "捡拾烂果深埋处理，切勿随意丢弃。" }
    ]
  },
  "thrips": {
    name: "蓟马危害 (Thrips)",
    severity: "mild",
    logic: "🔍【专家辨证】果蒂周围出现银白色环状疤痕（风疤），是幼果期蓟马取食留下的伤痕。",
    solutions: [
      { type: "防治节点", content: "花期至幼果期是关键窗口，选用乙基多杀菌素。" }
    ]
  },
  "sunburn": {
    name: "日灼果 (Sunburn)",
    severity: "mild",
    logic: "🔍【专家辨证】树冠外围向阳果实出现黄褐色干枯斑块，为高温强光灼伤。",
    solutions: [
      { type: "物理防护", content: "高温期给外围果实贴白纸或涂石灰浆防晒。" }
    ]
  },
  "anthracnose": {
    name: "炭疽病 (Anthracnose)",
    severity: "moderate",
    logic: "🔍【专家辨证】弱寄生菌，树势弱时易发。叶片出现同心轮纹状褐色病斑，或果梗腐烂。",
    solutions: [
      { type: "药剂防治", content: "咪鲜胺、苯醚甲环唑或吡唑醚菌酯。" },
      { type: "系统固本", content: "增施有机肥，提升树势是根本。" }
    ]
  },
  "melanose": {
    name: "砂皮病 (Melanose)",
    severity: "moderate",
    logic: "🔍【专家辨证】果皮布满黑褐色硬质小点（砂纸感）。枯枝是病菌大本营。",
    solutions: [
      { type: "清园", content: "彻底剪除枯枝。" },
      { type: "保护", content: "雨前喷施代森锰锌，雨后喷施苯醚甲环唑。" }
    ]
  },
  "hlb": {
    name: "黄龙病 (HLB)",
    severity: "severe",
    logic: "🔍【绝症预警】叶片斑驳黄化（不对称），果实红鼻子。这是柑橘癌症，无药可治。",
    solutions: [
      { type: "三板斧", content: "1.杀木虱；2.砍病树；3.种无毒苗。" },
      { type: "处置", content: "确诊后立即挖除并烧毁，防止传染。" }
    ]
  },

  // ================= 缺素与生理 =================
  "deficiency_Mg": {
    name: "缺镁症 (Magnesium Deficiency)",
    severity: "mild",
    logic: "🔍【专家辨证】老叶基部出现倒V字形黄斑，是典型的缺镁症状。影响光合作用。",
    solutions: [
      { type: "补充营养", content: "叶面喷施硝酸镁；根部撒施钙镁磷肥。" }
    ]
  },
  "deficiency_Fe_Zn": {
    name: "缺铁/缺锌",
    severity: "moderate",
    logic: "🔍【专家辨证】新梢叶片黄化。缺铁脉间失绿（网状），缺锌叶片狭小直立（花叶）。",
    solutions: [
      { type: "叶面补充", content: "喷施氨基酸螯合铁+锌叶面肥。" },
      { type: "根系调理", content: "检查是否有积水烂根，使用腐植酸改良土壤。" }
    ]
  },
  "deficiency_B": {
    name: "缺硼症",
    severity: "moderate",
    logic: "🔍【专家辨证】新叶脉肿大、果实有“石头果”或流胶。",
    solutions: [{ type: "补充", content: "花前喷施流体硼，底肥施硼砂。" }]
  },
  "cracking": {
    name: "裂果 (Cracking)",
    severity: "moderate",
    logic: "🔍【专家辨证】果皮开裂。多由水分剧烈波动或缺钙/硼引起。",
    solutions: [
      { type: "水分管理", content: "保持土壤水分均衡，干旱时少量多次淋水。" },
      { type: "营养增强", content: "喷施糖醇钙或螯合钙，增加果皮韧性。" }
    ]
  },

  // ================= 兜底状态 =================
  "sub_health": {
    name: "亚健康状态",
    severity: "mild",
    logic: "🔍【专家辨证】未匹配到典型烈性病害，但树体表现出非典型不适（如轻微卷叶或黄化）。",
    solutions: [
      { type: "调理建议", content: "建议淋施海藻酸或氨基酸水溶肥，提升树体抗逆性。" }
    ]
  },
  "healthy": {
    name: "健康",
    severity: "none",
    logic: "各项指标正常，未发现明显病虫害特征。",
    solutions: [
      { type: "日常管理", content: "建议定期巡园，保持水肥平衡。" }
    ]
  },
  "unknown": {
    name: "疑难杂症",
    severity: "mild",
    logic: "当前特征较为复杂，可能属于非典型症状或复合侵染。建议咨询专家。",
    solutions: [
      { type: "建议", content: "点击底部按钮联系人工专家。" }
    ]
  }
};