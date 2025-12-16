// miniprogram/pages/diagnosis/result/result.js
const app = getApp();
// 1. 【核心修改】引入统一的病害数据中心
// 请确保您已经完成了上一步，新建了 miniprogram/data/disease_database.js 文件
const DISEASE_DB = require('../../../data/disease_database.js');

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
  // 🌍 核心升级：数据中心化查询 (V5.0 Pro)
  // ============================================================
  getDiseaseInfo: function (code) {
    // 1. 尝试直接匹配 (最快)
    if (DISEASE_DB[code]) {
      return DISEASE_DB[code];
    }
    
    // 2. 尝试模糊匹配 (防止大小写或前缀不一致问题)
    // 例如：'deficiency_N' 也能匹配到 'N'
    for (let key in DISEASE_DB) {
      if (code && code.toLowerCase().includes(key.toLowerCase())) {
        return DISEASE_DB[key];
      }
    }

    // 3. 兜底返回未知
    return DISEASE_DB['unknown'] || {
      name: "未知病害",
      severity: "mild",
      logic: "暂无法识别具体病害特征，建议咨询专家。",
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
    // 直接从统一数据库获取信息
    const info = this.getDiseaseInfo(diseaseCode);
    
    // 1. 智能替换文案中的英文代码
    // 如果引擎返回了动态逻辑（newDiagnosticEngine），优先使用动态逻辑
    let displayLogic = data.dynamicLogic || "";
    
    // 如果没有动态逻辑，或动态逻辑太短（可能是旧引擎），则使用数据库里的标准详解
    if (!displayLogic || displayLogic.length < 10) {
        displayLogic = info.logic || info.defaultLogic;
    } else {
        // 如果有动态逻辑，尝试把里面的英文Code替换成中文名
        if (displayLogic.includes(diseaseCode)) {
            displayLogic = displayLogic.replace(new RegExp(diseaseCode, 'g'), info.name);
        }
        // 去除可能存在的英文括号封装
        displayLogic = displayLogic.replace(/【.*?】/g, `【${info.name}】`);
    }

    // 2. 计算风险等级样式
    let severityClass = info.severity || 'mild';
    let severityLabel = '低风险';
    
    // 优先使用数据库定义的等级，如果数据库没定义，则参考置信度
    if (severityClass === 'severe') severityLabel = '高风险';
    else if (severityClass === 'moderate') severityLabel = '中风险';
    else if (severityClass === 'none') severityLabel = '健康';
    else {
        // 兜底逻辑
        const conf = data.confidence || 0;
        if (conf >= 80) { severityClass = 'severe'; severityLabel = '高风险'; }
        else if (conf >= 50) { severityClass = 'moderate'; severityLabel = '中风险'; }
    }

    this.setData({
      report: {
        title: info.name,
        severity: severityClass,
        severityLabel: severityLabel,
        time: this.formatTime(data.timestamp || new Date()),
        // 如果数据里自带tag用自带的，否则用病害名作为tag
        tags: data.report && data.report.tags ? data.report.tags : [info.name.split(' ')[0]],
        logic: displayLogic,
        solutions: info.solutions || []
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
      displayCrop: '柑橘', // 后续可扩展其他作物名称映射
      summary: info.name,
      systemBrief: `置信度 ${newItem.confidence}%`,
      mainSeverityClass: info.severity || 'mild',
      result: newItem
    };

    history.unshift(summaryItem);
    // 限制本地存储数量，防止缓存溢出
    if (history.length > 50) history.pop(); 
    
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
    // 建议后期改为从云配置获取，避免硬编码
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