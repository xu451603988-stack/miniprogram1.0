// miniprogram/pages/diagnosis/result/result.js
// V5.0 结果渲染层
// 核心职责：读取诊断Code -> 查阅专家库 -> 生成“表象+体质”综合报告

const app = getApp();
// 引入专家知识库 (路径需对应)
const diagnosisDB = require('../../../data/diagnosis_knowledge.js');

Page({
  data: {
    resultType: '', // 标记结果版本 ('combined' | 'decision_tree_v5')
    report: null,   // 用于页面渲染的最终报告数据
    
    // ... 保留部分旧数据字段以防万一 ...
    isCombined: false 
  },

  /**
   * 页面加载
   */
  onLoad(options) {
    console.log("【结果页】收到参数:", options);

    if (!options.result) {
      wx.showToast({ title: '数据缺失', icon: 'none' });
      return;
    }

    let parsed = {};
    try {
      // 解码传递过来的 JSON 字符串
      parsed = JSON.parse(decodeURIComponent(options.result));
    } catch (e) {
      console.error("解析失败:", e);
      return;
    }

    // 记录结果类型
    this.setData({ resultType: parsed.type });

    // 分流处理：如果是 V5 新版引擎生成的
    if (parsed.type === 'decision_tree_v5') {
      this.initV5Result(parsed);
    } 
    // 兼容旧版逻辑 (保留原有代码逻辑，防止旧入口报错)
    else {
      // 这里可以保留您原来的 processCombined 或 processSingle 逻辑
      // 或者直接提示“旧版数据”
      this.initCompatibleResult(parsed);
    }
  },

  /**
   * V5.0 核心渲染逻辑
   * 将“病害”与“体质”拼接，生成像中医处方一样的报告
   */
  initV5Result(data) {
    const diseaseCode = data.diagnosis || 'unknown'; // 主病代码 (如 aphid)
    const rootCode = data.rootStatus || 'normal';    // 体质代码 (如 damp_heat)
    
    console.log(`正在生成报告: 病害[${diseaseCode}] + 体质[${rootCode}]`);

    // 1. 查阅知识库
    const diseaseEntry = diagnosisDB[diseaseCode] || diagnosisDB['unknown'];
    const constitutionEntry = diagnosisDB['_constitutions'] ? diagnosisDB['_constitutions'][rootCode] : null;

    // 防御性检查：如果没有体质库，给个默认值
    const rootInfo = constitutionEntry || { 
      title: "根系状况未知", 
      desc: "未检测到明显的根际异常。", 
      action: "维持常规管理。" 
    };

    // 2. 动态组合【调理方案】
    // 方案 = 病害急救方案 (标) + 体质调理方案 (本)
    let combinedSolutions = [];
    
    // 先加病害方案 (如杀虫/杀菌)
    if (diseaseEntry.solutions) {
      combinedSolutions = [...diseaseEntry.solutions];
    }

    // 再加体质方案 (如果体质异常)
    if (rootCode !== 'normal') {
      combinedSolutions.push({
        type: "系统固本", // 标签名
        content: `【针对${rootInfo.title}】：${rootInfo.action}`
      });
    }

    // 3. 动态组合【辨证逻辑】文案
    // 逻辑 = 为什么确诊这个病 + 根部查到了什么
    let logicText = diseaseEntry.logic || "根据您的症状描述推导得出。";
    if (rootCode !== 'normal') {
      logicText += `\n\n【系统查本】：${rootInfo.desc}`;
    }

    // 4. 生成标签 (Tags)
    // 合并病害标签和体质标签
    let displayTags = diseaseEntry.tags || [];
    if (rootCode !== 'normal') {
      // 取体质标题的前两个字做标签 (如 "湿热")
      displayTags.push(rootInfo.title.substring(0, 2)); 
    }

    // 5. 构造最终渲染对象
    const report = {
      title: diseaseEntry.name, // 大标题 (如 蚜虫危害)
      severity: diseaseEntry.severity, // 风险等级 (控制卡片颜色)
      severityLabel: this.getSeverityLabel(diseaseEntry.severity),
      
      tags: displayTags,
      logic: logicText,
      solutions: combinedSolutions,
      
      // 辅助信息
      time: new Date().toLocaleString()
    };

    this.setData({ report });
    
    // 自动保存到历史记录 (可选)
    this.saveToHistoryAuto(report, data);
  },

  /**
   * 辅助：获取风险等级文案
   */
  getSeverityLabel(level) {
    const map = {
      'severe': '高风险 · 需重视',
      'moderate': '中风险 · 需干预',
      'mild': '低风险 · 需观察'
    };
    return map[level] || '风险未知';
  },

  /**
   * 兼容旧版 (可选，为了不让旧代码报错)
   */
  initCompatibleResult(data) {
    this.setData({
      isCombined: true,
      summary: "本次诊断使用旧版数据格式，建议重新测试以获取精准报告。",
      leaf: { enabled: false },
      fruit: { enabled: false },
      root: { enabled: false }
    });
  },

  /**
   * 自动保存历史记录
   */
  saveToHistoryAuto(report, rawData) {
    const historyItem = {
      id: Date.now(),
      time: new Date().toLocaleString(),
      summary: report.title, // 列表页显示标题
      mainSeverityClass: report.severity, // 列表页显示颜色
      systemBrief: report.tags.join(' · '), // 列表页显示标签
      result: { // 保存完整数据以便回看
        summary: {
          mainModule: 'leaf', // 兼容旧字段
          hasIssue: true
        },
        type: 'decision_tree_v5',
        report: report
      }
    };

    let list = wx.getStorageSync("diagnosisRecords") || [];
    if (!Array.isArray(list)) list = [];
    list.unshift(historyItem);
    if (list.length > 50) list = list.slice(0, 50);
    wx.setStorageSync("diagnosisRecords", list);
  },

  // ================= 页面交互 =================

  goHome() {
    wx.reLaunch({ url: '/pages/index/index' });
  },

  retest() {
    // 返回两层：结果页 -> 问卷页 -> 选部位页/首页
    wx.navigateBack({ delta: 1 }); // V5是 replace 跳转，所以退一层即可，或者直接 reLaunch
  },

  goHistory() {
    wx.navigateTo({ url: '/pages/diagnosis/history/history' });
  },

  contactDoctor() {
    wx.showModal({
      title: '联系专家',
      content: '是否复制植保专家微信号？',
      success: (res) => {
        if (res.confirm) {
          wx.setClipboardData({ data: "PlantDoctor001" });
        }
      }
    });
  }
});