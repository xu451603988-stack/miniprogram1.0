// miniprogram/pages/diagnosis/result/result.js
const app = getApp();
const db = wx.cloud.database();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    isLoading: true,
    resultType: 'decision_tree_v5', 
    report: {
      title: '',
      severity: 'mild',
      severityLabel: '分析中...',
      time: '',
      tags: [],
      logic: '',
      solutions: []
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ isLoading: true });
    
    // 1. 从列表页进来 (带云数据库ID)
    if (options.id) {
      this.fetchFromCloud(options.id);
    } 
    // 2. 刚诊断完进来 (无ID，读缓存)
    else {
      this.loadFromCacheAndSave();
    }
  },

  // ============================================================
  // 🌍 核心升级：国际标准级病害字典库 (V5.0 Pro)
  // ============================================================
  getDiseaseInfo: function (code) {
    const database = {
      // ------------------------------------------------------------
      // 🟢 1. 营养与生理障碍 (Nutritional & Physiological Disorders)
      // ------------------------------------------------------------
      
      // --- 缺素类 ---
      "N": {
        name: "缺氮症 (Nitrogen Deficiency)",
        defaultLogic: "老叶均匀黄化，新梢短小贫弱。氮是叶绿素的主要成分，缺乏时植物光合能力下降，长期缺氮会导致树势早衰，产量锐减。",
        solutions: [
          { type: "土壤施肥", content: "施用尿素或高氮复合肥，结合腐熟有机肥改良土壤。" },
          { type: "叶面急救", content: "喷施0.3%-0.5%尿素溶液 + 氨基酸水溶肥。" }
        ]
      },
      "P": {
        name: "缺磷症 (Phosphorus Deficiency)",
        defaultLogic: "老叶暗绿无光泽，甚至呈紫红色，落叶严重。磷决定了能量代谢与根系生长，缺磷会导致花芽分化不良，果实皮厚空心。",
        solutions: [
          { type: "根部施肥", content: "增施过磷酸钙或钙镁磷肥，注意与有机肥混合施用以防固定。" },
          { type: "叶面补充", content: "花前喷施高磷叶面肥或磷酸二氢钾。" }
        ]
      },
      "K": {
        name: "缺钾症 (Potassium Deficiency)",
        defaultLogic: "老叶叶尖或叶缘焦枯卷曲，果实偏小、转色差、口感酸。钾被称为'品质元素'，缺钾严重影响果实商品性。",
        solutions: [
          { type: "根部施肥", content: "果实膨大期追施硫酸钾或高钾复合肥。" },
          { type: "叶面补充", content: "喷施磷酸二氢钾或流体钾，间隔10-15天一次。" }
        ]
      },
      "deficiency_Mg": {
        name: "缺镁症 (Magnesium Deficiency)",
        defaultLogic: "典型症状为老叶叶脉间失绿黄化，呈倒V字形，基部绿色。多发生于酸性土壤或挂果量过大的果园，镁元素从老叶转移至果实导致。",
        solutions: [
          { type: "根部施肥", content: "增施钙镁磷肥或硫酸镁，调节土壤酸碱度。" },
          { type: "叶面补充", content: "喷施硝酸镁或螯合镁叶面肥，间隔10天一次，连喷2-3次。" }
        ]
      },
      "Mg": { name: "缺镁症 (Magnesium Deficiency)", defaultLogic: "典型症状为老叶叶脉间失绿黄化，呈倒V字形。", solutions: [{ type: "根部施肥", content: "增施钙镁磷肥或硫酸镁。" }] }, 
      
      "deficiency_Fe_Zn": {
        name: "缺铁/缺锌 (Fe/Zn Deficiency)",
        defaultLogic: "表现为新梢叶片黄化。缺铁导致嫩叶脉间失绿变白（网状），缺锌导致叶片狭小、直立、花叶。通常与根系活力差或土壤pH值过高有关。",
        solutions: [
          { type: "叶面补充", content: "选用氨基酸螯合铁+锌叶面肥喷施，快速矫正。" },
          { type: "根系调理", content: "检查是否有积水烂根，使用腐植酸改良土壤透气性。" }
        ]
      },
      "Fe": { name: "缺铁症 (Iron Deficiency)", defaultLogic: "新叶叶肉发黄，叶脉绿色，呈网状。", solutions: [{ type: "建议", content: "喷施螯合铁。" }] },
      "Zn": { name: "缺锌症 (Zinc Deficiency)", defaultLogic: "新叶小且直立，花叶斑驳。", solutions: [{ type: "建议", content: "喷施螯合锌。" }] },
      "B": {
        name: "缺硼症 (Boron Deficiency)",
        defaultLogic: "新叶叶脉肿大、木栓化，果实出现'石头果'，果皮甚至流胶。硼对生殖生长至关重要。",
        solutions: [
          { type: "底肥补充", content: "冬肥时每株施用硼砂10-20克。" },
          { type: "花期喷施", content: "蕾期和谢花期各喷一次流体硼，提高坐果率。" }
        ]
      },

      // --- 生理障碍 ---
      "sunburn": {
        name: "日灼果 (Sunburn)",
        defaultLogic: "由高温强光引起的生理性伤害。多发生于树冠外围向阳果实，果皮组织被高温灼伤坏死，形成黄白色干枯斑块，后期易感炭疽病。",
        solutions: [
          { type: "物理防护", content: "高温期给外围果实贴白纸或涂石灰浆防晒。" },
          { type: "修剪调整", content: "夏剪时适当保留外围枝叶给果实遮阴，切忌过度开天窗。" }
        ]
      },
      "cracking": {
        name: "严重裂果 (Fruit Cracking)",
        defaultLogic: "典型生理性病害。主要由果实膨大期水分供应剧烈波动引起（如久旱逢雨），或钙、硼元素缺乏导致果皮韧性不足。",
        solutions: [
          { type: "水分管理", content: "保持土壤水分均衡，干旱时切忌猛灌水，应少量多次淋跑马水。" },
          { type: "营养增强", content: "叶面喷施糖醇钙或螯合钙+硼，增加果皮韧性。" }
        ]
      },
      "cracking_water_imbalance": { name: "裂果 (水分失衡)", defaultLogic: "久旱逢雨引发的裂果。", solutions: [] },

      // ------------------------------------------------------------
      // 🐛 2. 虫害 (Pests & Mites)
      // ------------------------------------------------------------
      "red_spider": {
        name: "柑橘红蜘蛛 (Citrus Red Mite)",
        defaultLogic: "叶面出现密集灰白色失绿点，失去光泽。该虫害繁殖极快，易产生抗药性，是柑橘头号害虫。",
        solutions: [
          { type: "化学防治", content: "联苯肼酯 + 乙螨唑（杀卵+杀成螨），或阿维菌素。" },
          { type: "关键节点", content: "重点喷施叶背，建议7天后复查，防止卵孵化二次爆发。" }
        ]
      },
      "rust_mite": {
        name: "锈壁虱 (Rust Mite)",
        defaultLogic: "果实表面变黑（黑皮果），叶片背面呈烟熏状。高温干旱季节多发。",
        solutions: [
          { type: "药剂选择", content: "虱螨脲、丁硫克百威或代森锰锌。" },
          { type: "预防为主", content: "5-6月开始预防，一旦果实变黑无法逆转。" }
        ]
      },
      "leaf_miner": {
        name: "潜叶蛾 (Leaf Miner)",
        defaultLogic: "嫩叶表皮下有银白色弯曲隧道（鬼画符），叶片卷曲硬化。伤口极易诱发溃疡病。",
        solutions: [
          { type: "统一放梢", content: "抹除零星新梢，切断害虫食物链。" },
          { type: "药剂防治", content: "新梢萌发粒米长时喷施氯虫苯甲酰胺或溴氰菊酯。" }
        ]
      },
      "fruit_fly": {
        name: "果实蝇 (Fruit Fly)",
        defaultLogic: "俗称针蜂。成虫产卵于果皮内，导致果实局部变黄、腐烂、提前脱落。果面可见针尖大小产卵孔。",
        solutions: [
          { type: "物理诱杀", content: "悬挂全降解黄板 + 性诱剂诱捕雄虫。" },
          { type: "化学防治", content: "树冠喷施阿维菌素 + 蛋白饵剂点喷诱杀成虫。" }
        ]
      },
      "thrips": {
        name: "蓟马危害 (Thrips Damage)",
        defaultLogic: "果蒂周围出现银白色环状疤痕（风疤），嫩叶受害扭曲变形。主要在谢花幼果期危害。",
        solutions: [
          { type: "防治节点", content: "花期至幼果期是关键窗口。" },
          { type: "药剂选择", content: "乙基多杀菌素、吡虫啉或噻虫嗪。" }
        ]
      },
      "scale_insect": {
        name: "蚧壳虫 (Scale Insect)",
        defaultLogic: "枝叶或果实上有白色/褐色蜡质介壳，诱发煤污病，导致树势衰弱。",
        solutions: [
          { type: "药剂防治", content: "毒死蜱、螺虫乙酯或松脂合剂。" },
          { type: "清园", content: "剪除虫口密度大的枝条并烧毁。" }
        ]
      },
      "aphid": {
        name: "蚜虫 (Aphids)",
        defaultLogic: "聚集在嫩梢吸食汁液，分泌蜜露诱发煤污病，且是衰退病的主要传播媒介。",
        solutions: [{ type: "药剂防治", content: "吡虫啉、啶虫脒或高效氯氟氰菊酯。" }]
      },
      "psyllid": {
        name: "柑橘木虱 (Asian Citrus Psyllid)",
        defaultLogic: "【高危预警】木虱是黄龙病的唯一自然传播媒介！成虫停在叶片上呈45度角。发现木虱必须立即杀灭。",
        solutions: [
          { type: "铁腕防治", content: "嫩梢期喷施联苯菊酯、噻虫嗪，务必“这就打药”。" },
          { type: "砍除病树", content: "若树体已感染黄龙病，杀木虱后必须挖除病树。" }
        ]
      },

      // ------------------------------------------------------------
      // 🦠 3. 真菌与细菌病害 (Fungal & Bacterial Diseases)
      // ------------------------------------------------------------
      "canker": {
        name: "溃疡病 (Canker)",
        defaultLogic: "细菌性病害。病斑突出果面或叶面，呈火山口状开裂，外有黄晕。大风、暴雨及潜叶蛾造成的伤口极易诱发此病。",
        solutions: [
          { type: "药剂防治", content: "选用氢氧化铜、春雷霉素或王铜喷雾。" },
          { type: "注意事项", content: "统一放梢，严防潜叶蛾，大风雨后及时补药。" }
        ]
      },
      "anthracnose": {
        name: "炭疽病 (Anthracnose)",
        defaultLogic: "弱寄生菌，树势弱时易发。叶片出现同心轮纹状褐色病斑，或果梗处腐烂导致落果（爆米花落果）。",
        solutions: [
          { type: "药剂防治", content: "咪鲜胺、苯醚甲环唑或吡唑醚菌酯。" },
          { type: "系统固本", content: "增施有机肥，提升树势是根本。" }
        ]
      },
      "melanose": {
        name: "砂皮病 (Melanose)",
        defaultLogic: "又称树脂病。雨水传播，果皮表面布满黑褐色硬质小点，手摸有砂纸感。严重影响果实外观。",
        solutions: [
          { type: "清园", content: "彻底剪除枯枝（病菌大本营）。" },
          { type: "保护", content: "雨前喷施代森锰锌，雨后喷施苯醚甲环唑。" }
        ]
      },
      "greasy_spot": {
        name: "脂点黄斑病 (Greasy Spot)",
        defaultLogic: "叶背出现淡黄色或褐色疱疹状小粒点，随后叶片黄化脱落。多发生在老叶上。",
        solutions: [{ type: "药剂防治", content: "代森锰锌、吡唑醚菌酯。" }]
      },
      "scab": {
        name: "疮痂病 (Scab)",
        defaultLogic: "叶片或幼果出现圆锥形木栓化突起，多发于阴湿环境。",
        solutions: [{ type: "药剂防治", content: "苯醚甲环唑、代森锰锌。" }]
      },
      
      // ------------------------------------------------------------
      // ☠️ 4. 根系与系统性病害 (Root & Systemic Diseases)
      // ------------------------------------------------------------
      "hlb": {
        name: "黄龙病 (HLB / Citrus Greening)",
        defaultLogic: "【绝症预警】叶片出现斑驳状黄化（左右不对称），红鼻子果。这是柑橘癌症，目前无药可治。",
        solutions: [
          { type: "三板斧", content: "1.杀木虱；2.砍病树；3.种无毒苗。" },
          { type: "处置", content: "确诊后请勿犹豫，立即挖除并烧毁，防止传染全园。" }
        ]
      },
      "root_rot_fungal": {
        name: "根腐病 (Root Rot)",
        defaultLogic: "根颈部皮层腐烂，有酒糟味，叶片黄化脱落。多由排水不良或疫霉菌侵染引起。",
        solutions: [
          { type: "外科手术", content: "扒开根颈土壤晾晒，刮除腐烂部位并涂抹杀菌剂。" },
          { type: "药剂灌根", content: "甲霜·恶霉灵 + 生根液兑水淋灌。" }
        ]
      },
      "nematodes": {
        name: "根结线虫病 (Nematodes)",
        defaultLogic: "根系须根稀少，末端形成串珠状“根结”肿大。阻断养分吸收，导致树体黄化衰退，极难恢复。",
        solutions: [
          { type: "化学防治", content: "阿维菌素·噻唑膦颗粒剂撒施，或氟吡菌酰胺淋根。" },
          { type: "生物防治", content: "增施厚孢轮枝菌等生物菌剂。" }
        ]
      },
      
      // ------------------------------------------------------------
      // ❓ 5. 兜底 (Fallback)
      // ------------------------------------------------------------
      "unknown": {
        name: "疑难杂症 (Undiagnosed)",
        defaultLogic: "当前特征较为复杂，可能属于非典型症状或复合侵染（如药害+病害）。建议拍摄更多清晰照片或咨询专家。",
        solutions: [
          { type: "建议", content: "点击底部按钮联系人工专家，或重新检查输入特征。" }
        ]
      }
    };

    // --- 智能模糊匹配逻辑 ---
    // 防止引擎输出如 'cracking_physio' 找不到 'cracking' 的情况
    if (!database[code]) {
        // 1. 尝试前缀匹配
        for (let key in database) {
            if (code.includes(key) || key.includes(code)) {
                return database[key];
            }
        }
        // 2. 尝试映射表 (Map Codes)
        if (code === "deficiency_N") return database["N"];
        if (code === "deficiency_P") return database["P"];
        if (code === "deficiency_K") return database["K"];
    }

    return database[code] || {
      name: code, 
      defaultLogic: "症状复杂，特征不典型，建议联系专家人工复核。",
      solutions: []
    };
  },

  // ============================================================
  // ⚙️ 渲染与逻辑处理 (Logic & Rendering)
  // ============================================================
  
  /**
   * 格式化数据并渲染到视图
   */
  formatAndRender: function (data) {
    const diseaseCode = data.diagnosis || 'unknown';
    const info = this.getDiseaseInfo(diseaseCode);
    
    // 1. 智能替换文案中的英文代码
    let engineLogic = data.dynamicLogic || "";
    if (engineLogic.includes(diseaseCode)) {
      engineLogic = engineLogic.replace(new RegExp(diseaseCode, 'g'), info.name);
    }
    // 去除可能存在的英文括号封装
    engineLogic = engineLogic.replace(/【.*?】/g, `【${info.name}】`);

    // 2. 拼接本地专家详解 (如果引擎返回的文案太短)
    let finalLogic = engineLogic;
    if (info.defaultLogic && finalLogic.length < 100) {
        finalLogic += "\n\n📋 专家详解：\n" + info.defaultLogic;
    }

    // 3. 计算风险等级
    let severityClass = 'mild';
    let severityLabel = '低风险';
    const conf = data.confidence || 0;
    
    if (conf >= 80) { 
      severityClass = 'severe'; 
      severityLabel = '高风险'; 
    } else if (conf >= 50) { 
      severityClass = 'moderate'; 
      severityLabel = '中风险'; 
    }

    this.setData({
      report: {
        title: info.name,
        severity: severityClass,
        severityLabel: severityLabel,
        time: this.formatTime(data.timestamp || new Date()),
        tags: [info.name],
        logic: finalLogic,
        solutions: info.solutions
      },
      resultType: 'decision_tree_v5',
      isLoading: false
    });
  },

  /**
   * 从缓存读取数据并双重保存
   */
  loadFromCacheAndSave: function () {
    try {
      const rawData = wx.getStorageSync('temp_diagnosis_result');
      if (!rawData) throw new Error("无缓存数据");

      this.formatAndRender(rawData);

      // 如果是新产生的数据（无_id），则执行保存
      if (!rawData._id) {
        this.saveToCloud(rawData); // 存云端
        this.saveToLocalHistory(rawData); // 存本地
      }
    } catch (e) {
      console.error(e);
      wx.showToast({ title: '数据读取异常', icon: 'none' });
    }
  },

  // 保存到云数据库
  saveToCloud: function (data) {
    wx.cloud.callFunction({
      name: 'orchardFunctions',
      data: { type: 'saveDiagnosis', data: data }
    }).then(res => console.log("云端备份成功")).catch(console.error);
  },

  // 保存到本地缓存 (供首页列表使用)
  saveToLocalHistory: function (newItem) {
    let history = wx.getStorageSync('diagnosisRecords') || [];
    const info = this.getDiseaseInfo(newItem.diagnosis);
    
    // 构造首页列表摘要对象
    const summaryItem = {
      id: new Date().getTime(),
      time: this.formatTime(new Date()),
      crop: newItem.crop || 'citrus',
      displayCrop: '柑橘',
      summary: info.name,
      systemBrief: `置信度 ${newItem.confidence}%`,
      mainSeverityClass: newItem.confidence >= 80 ? 'severe' : 'mild',
      result: newItem
    };

    history.unshift(summaryItem);
    wx.setStorageSync('diagnosisRecords', history);
    console.log("本地历史已更新");
  },

  // 从云端拉取历史详情
  fetchFromCloud: function (id) {
    db.collection('diagnosis_history').doc(id).get().then(res => {
      this.formatAndRender(res.data);
    }).catch(err => {
      wx.showToast({ title: '记录不存在', icon: 'none' });
    });
  },

  // 时间格式化工具
  formatTime: function (ts) {
    const date = new Date(ts);
    return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  },

  // 返回首页 (强力模式)
  goHome: function () {
    console.log("正在尝试返回首页...");
    wx.reLaunch({
      url: '/pages/index/index',
      fail: (err) => {
        console.error("返回首页失败:", err);
        wx.showModal({
          title: '跳转受阻',
          content: '请点击右上角胶囊按钮的“三个点” -> “重新进入小程序”',
          showCancel: false
        });
      }
    });
  },

  // 重新诊断
  retest: function () {
    wx.reLaunch({ url: '/pages/diagnosis/cropSelect/cropSelect' });
  },

  // 联系专家
  contactDoctor: function () {
    wx.makePhoneCall({ phoneNumber: '13800000000' });
  },

  // 分享
  onShareAppMessage: function () {
    return {
      title: `我的果园诊断报告：${this.data.report.title}`,
      path: `/pages/diagnosis/result/result?id=${this.data.resultId || ''}`
    };
  }
});