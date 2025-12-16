// miniprogram/pages/diagnosis/question/question.js
// 决策树引擎核心 V6.0 (修复白屏问题 + 适配国际标准数据)

const app = getApp();

// 1. 【关键】引入您更新好的决策树数据文件
const decisionTrees = {
  'citrus_leaf': require('../../../data/decision_trees/citrus_leaf.js'),
  'citrus_fruit': require('../../../data/decision_trees/citrus_fruit.js')
};

Page({
  data: {
    isInitialized: false, // 控制加载状态
    currentNode: null,    // 当前题目节点
    historyStack: [],     // 历史路径栈 (用于返回上一题)
    
    // 上下文
    crop: 'citrus',
    module: 'leaf',       // 当前运行的模块 (leaf/fruit)
    
    // 答案收集
    userChoices: {},      // 记录用户的每一步选择
    tempDisease: null     // 过程中的疑似线索
  },

  onLoad(options) {
    // 1. 解析参数
    const crop = options.crop || (app.globalData.currentCrop) || 'citrus';
    
    // 解析 positions (例如 ["leaf", "fruit"])
    let positions = [];
    if (options.positions) {
      try { positions = JSON.parse(decodeURIComponent(options.positions)); } catch(e){}
    }
    
    // 2. 智能决定加载哪棵树
    // 因为新的决策树里，叶片和果实都已经包含了根系检查(系统查本)，所以只需要跑一个主树即可
    let moduleType = 'leaf';
    if (positions.includes('leaf')) moduleType = 'leaf';
    else if (positions.includes('fruit')) moduleType = 'fruit';
    else if (positions.includes('root')) moduleType = 'leaf'; // 单测根系时，借用叶片树的后半段

    this.setData({ 
      crop, 
      module: moduleType,
      isInitialized: false // 开始加载
    });

    // 3. 读取数据
    const treeKey = `${crop}_${moduleType}`; // 例如 "citrus_leaf"
    this.treeData = decisionTrees[treeKey];

    if (!this.treeData) {
      wx.showModal({ 
        title: '配置缺失', 
        content: `未找到 ${treeKey} 的决策树数据，请检查文件名。`, 
        showCancel: false 
      });
      return;
    }

    // 4. 启动引擎，加载 'start' 节点
    this.loadNode('start');
  },

  // --- 核心：加载节点 ---
  loadNode(nodeId) {
    const node = this.treeData[nodeId];
    
    if (!node) {
      console.error("Node not found:", nodeId);
      wx.showToast({ title: '节点丢失', icon: 'error' });
      return;
    }

    this.setData({
      currentNode: node,
      isInitialized: true // 【关键修复】数据加载完毕，解除 Loading 遮罩
    });
  },

  // --- 交互：点击选项 ---
  // 对应 WXML 中的 bindtap="onOptionClick"
  onOptionClick(e) {
    const item = e.currentTarget.dataset.item;
    if (!item) return;

    const currentId = this.data.currentNode.id;

    // 1. 记录答案
    this.data.userChoices[currentId] = item;

    // 2. 捕获线索 (tempDiagnosis) - 用于排除法
    if (item.tempDiagnosis) {
      this.setData({ tempDisease: item.tempDiagnosis });
      console.log("🔍 捕获线索:", item.tempDiagnosis);
    }

    // 3. 导航逻辑
    if (item.isEnd) {
      // 如果是终点，提交诊断
      this.submitV6Diagnosis(item);
    } else if (item.next) {
      // 还有下一题，入栈并跳转
      this.data.historyStack.push(currentId);
      this.loadNode(item.next);
    } else {
      wx.showToast({ title: '流程配置错误: 无下文', icon: 'none' });
    }
  },

  // --- 交互：回退 ---
  goBack() {
    if (this.data.historyStack.length === 0) {
      wx.navigateBack();
      return;
    }
    const prevId = this.data.historyStack.pop();
    // 清除该步骤的答案，防止污染逻辑
    delete this.data.userChoices[prevId];
    this.loadNode(prevId);
  },

  // ==========================================================
  // 🚀 提交逻辑 (V6.0: 决策树结论 + 历史追溯 + 云端容灾)
  // ==========================================================
  async submitV6Diagnosis(lastOption) {
    wx.showLoading({ title: '综合分析中...', mask: true });

    // 1. 确定最终病害结论 (Final Decision)
    let finalCode = lastOption.value; 
    
    // 【排除法逻辑】
    // 如果最后一步只是排除项（例如 "no_knot" 无根结），则回溯使用之前的疑似线索
    if (lastOption.tempDiagnosis) {
        finalCode = lastOption.tempDiagnosis;
    } else if (this.data.tempDisease && (!finalCode || finalCode.indexOf('knot') > -1 || finalCode === 'root_healthy' || finalCode === 'no_knot')) {
        finalCode = this.data.tempDisease; 
        console.log("✅ 启用排除法，确诊为:", finalCode);
    }

    // 2. 构造特征列表 (传给算法引擎计算复合风险)
    const answers = { leaf: [], fruit: [], root: [] };
    
    // 将用户一路选过来的所有 value 收集起来
    Object.values(this.data.userChoices).forEach(choice => {
      const v = choice.value;
      if (v) {
        if (v.startsWith('root_') || v.includes('soil') || v.includes('knot')) answers.root.push(v);
        else if (this.data.module === 'fruit') answers.fruit.push(v);
        else answers.leaf.push(v);
      }
    });

    // 3. 获取历史记录 (双重容灾)
    let lastRecord = null;
    try {
      // A. 优先查本地
      const history = wx.getStorageSync('diagnosisRecords') || [];
      if (history.length > 0 && history[0].result) {
        lastRecord = { 
          diagnosis: history[0].result.diagnosis, 
          timestamp: history[0].id 
        };
        console.log("📜 [历史] 命中本地:", lastRecord.diagnosis);
      }
      // B. 降级查云端
      if (!lastRecord) {
        const cloudRes = await wx.cloud.callFunction({
          name: 'orchardFunctions',
          data: { type: 'getHistoryList' }
        });
        if (cloudRes.result?.data?.[0]) {
          const cData = cloudRes.result.data[0];
          lastRecord = {
            diagnosis: cData.diagnosis,
            timestamp: cData.timestamp || new Date(cData.createTime).getTime()
          };
          console.log("☁️ [历史] 命中云端:", lastRecord.diagnosis);
        }
      }
    } catch (e) { console.error("历史获取失败", e); }

    // 4. 调用算法引擎
    try {
        const engine = app.globalData.diagnosticEngine;
        
        // 【Hack技巧】: 为了确保引擎能识别出决策树的结论，我们将 finalCode 强行加入特征列表
        if (finalCode && finalCode !== 'no_knot' && finalCode !== 'root_healthy') {
            if (this.data.module === 'leaf') answers.leaf.push(finalCode);
            else answers.fruit.push(finalCode);
        }

        const result = engine.runCombined({
            answers,
            month: new Date().getMonth() + 1,
            crop: this.data.crop,
            lastRecord
        });

        // 【强力保底】: 如果引擎算分失败(unknown)，但决策树有明确结论，强制覆盖
        if (result.diagnosis === 'unknown' && finalCode && finalCode !== 'unknown') {
             result.diagnosis = finalCode; 
             result.confidence = 95;
             console.log("🛡️ 触发保底逻辑，强制采用:", finalCode);
        }

        // 5. 存储并跳转
        wx.setStorageSync('temp_diagnosis_result', result);
        
        setTimeout(() => {
            wx.hideLoading();
            wx.redirectTo({ url: '/pages/diagnosis/result/result' });
        }, 500);

    } catch (err) {
        wx.hideLoading();
        console.error(err);
        wx.showModal({ title: 'Error', content: '诊断分析出错', showCancel:false });
    }
  }
});