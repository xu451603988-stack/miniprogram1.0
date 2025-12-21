// miniprogram/pages/diagnosis/question/question.js
// 权重融合算法适配版 + 会员积分拦截逻辑

const app = getApp();

// 引入问卷题目数据
const leafQuestions = require('../../../data/questionnaire/leaf_questions.js');
const fruitQuestions = require('../../../data/questionnaire/fruit_questions.js');

Page({
  data: {
    isInitialized: false,
    currentNode: null,
    historyStack: [],
    crop: 'citrus',
    module: 'leaf',
    selectedSymptomKeys: {}, 
  },

  onLoad(options) {
    const crop = options.crop || app.globalData.currentCrop || 'citrus';
    let positions = [];
    if (options.positions) {
      try { positions = JSON.parse(decodeURIComponent(options.positions)); } catch(e){}
    }
    
    let moduleType = 'leaf';
    if (positions.includes('fruit')) moduleType = 'fruit';

    this.setData({ 
      crop, 
      module: moduleType,
      isInitialized: false 
    });

    this.treeData = (moduleType === 'fruit') ? fruitQuestions : leafQuestions;

    if (!this.treeData || !this.treeData['start']) {
      wx.showModal({ 
        title: '数据异常', 
        content: '未能加载起始题目，请确认数据文件包含 start 节点', 
        showCancel: false 
      });
      return;
    }

    this.loadNode('start');
  },

  loadNode(nodeId) {
    const node = this.treeData[nodeId];
    if (!node) return;
    this.setData({
      currentNode: node,
      isInitialized: true 
    });
  },

  onOptionClick(e) {
    const item = e.currentTarget.dataset.item;
    if (!item) return;

    const currentId = this.data.currentNode.id;

    if (item.value) {
      const newKeys = { ...this.data.selectedSymptomKeys };
      newKeys[currentId] = item.value;
      this.setData({ selectedSymptomKeys: newKeys });
    }

    if (item.isEnd) {
      this.checkPermissionAndSubmit(); // 改为先检查权限
    } else if (item.next) {
      this.data.historyStack.push(currentId);
      this.loadNode(item.next);
    }
  },

  /**
   * 🛡️ 会员权限拦截器
   */
  async checkPermissionAndSubmit() {
    const userStats = app.globalData.userStats;

    if (!userStats) {
      wx.showToast({ title: '用户信息同步中...', icon: 'loading' });
      return;
    }

    // 逻辑：非VIP 且 积分不足
    if (userStats.memberLevel === 0 && userStats.remainingPoints <= 0) {
      wx.showModal({
        title: '诊断次数已耗尽',
        content: '您的免费次数已用完，开通会员可享受无限次精准诊断。',
        confirmText: '去查看',
        success: (res) => {
          if (res.confirm) wx.navigateTo({ url: '/pages/user/user' });
        }
      });
      return;
    }

    // 权限通过，进入计算
    this.submitWeightFusionDiagnosis();
  },

  /**
   * 🚀 核心算法执行 + 积分扣除
   */
  async submitWeightFusionDiagnosis() {
    wx.showLoading({ title: '权重融合分析中...', mask: true });

    const symptomKeys = Object.values(this.data.selectedSymptomKeys);
    const env = {
      continuousRain: app.globalData.climate?.rain > 50,
      lowTemperature: app.globalData.climate?.temp < 12
    };

    try {
      const engine = app.globalData.diagnosticEngine;
      const scoringResult = engine.calculateFinalScores(symptomKeys, env, "all");

      if (!scoringResult || scoringResult.length === 0) throw new Error("算法结论为空");

      const topRisk = scoringResult[0];
      const finalResult = {
        diagnosis: topRisk.target,
        score: topRisk.score,
        confidence: Math.min(Math.round(topRisk.score * 5), 99),
        allScores: scoringResult,
        type: "weight_fusion_v4",
        timestamp: new Date().getTime()
      };

      // --- 关键：诊断成功后扣除积分 (仅限普通用户) ---
      if (app.globalData.userStats.memberLevel === 0) {
        const db = wx.cloud.database();
        await db.collection('users').doc(app.globalData.userStats._id).update({
          data: {
            remainingPoints: db.command.inc(-1)
          }
        });
        // 同步本地全局变量，防止页面不刷新
        app.globalData.userStats.remainingPoints -= 1;
        console.log('📉 积分扣除成功，剩余：', app.globalData.userStats.remainingPoints);
      }

      wx.setStorageSync('temp_diagnosis_result', finalResult);
      
      setTimeout(() => {
        wx.hideLoading();
        wx.redirectTo({ url: '/pages/diagnosis/result/result' });
      }, 500);

    } catch (err) {
      wx.hideLoading();
      wx.showModal({ title: '诊断失败', content: err.message, showCancel: false });
    }
  },

  goBack() {
    if (this.data.historyStack.length === 0) {
      wx.navigateBack();
      return;
    }
    const prevId = this.data.historyStack.pop();
    const newKeys = { ...this.data.selectedSymptomKeys };
    delete newKeys[prevId];
    this.setData({ selectedSymptomKeys: newKeys });
    this.loadNode(prevId);
  }
});