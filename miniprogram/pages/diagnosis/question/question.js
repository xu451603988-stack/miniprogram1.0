// miniprogram/pages/diagnosis/question/question.js
// V5.0 决策树驱动引擎 (V4.3 排除法逻辑增强版)

const app = getApp();

const decisionTrees = {
  'citrus_leaf': require('../../../data/decision_trees/citrus_leaf.js'),
  'citrus_fruit': require('../../../data/decision_trees/citrus_fruit.js') 
};

Page({
  data: {
    currentNode: null,
    historyStack: [],
    isInitialized: false,
    crop: 'citrus',
    module: 'leaf'
  },

  userChoices: {},
  tempDisease: null, // 暂存过程中的疑似病害（如：缺镁）

  onLoad(options) {
    const crop = options.crop || app.globalData.currentCrop || 'citrus';
    let moduleType = 'leaf';
    if (options.positions && options.positions.indexOf('fruit') > -1) {
      moduleType = 'fruit';
    }
    
    this.setData({ crop, module: moduleType });

    const treeKey = `${crop}_${moduleType}`;
    const treeData = decisionTrees[treeKey];

    if (!treeData) {
      wx.showToast({ title: '配置缺失', icon: 'none' });
      return;
    }

    this.treeData = treeData;
    this.userChoices = {};
    this.tempDisease = null;
    this.loadNode('start');
  },

  loadNode(nodeId) {
    const node = this.treeData[nodeId];
    if (!node) return;
    this.setData({ currentNode: node, isInitialized: true });
  },

  onOptionClick(e) {
    const option = e.currentTarget.dataset.item;
    if (!option) return;

    const currentNodeId = this.data.currentNode.id;
    this.userChoices[currentNodeId] = option;

    // 【关键】捕获中间线索
    // 如果用户选了“网状黄化”，这里会记录下 tempDiagnosis = 'deficiency_Fe_Zn'
    if (option.tempDiagnosis) {
      this.tempDisease = option.tempDiagnosis;
      console.log(`🔍 线索捕获: ${this.tempDisease}`);
    }

    if (option.isEnd) {
      this.submitV5Diagnosis(option);
    } else if (option.next) {
      this.data.historyStack.push(currentNodeId);
      this.loadNode(option.next);
    }
  },

  goBack() {
    if (this.data.historyStack.length === 0) {
      wx.navigateBack();
      return;
    }
    const prevNodeId = this.data.historyStack.pop();
    const currentId = this.data.currentNode.id;
    delete this.userChoices[currentId];
    // 回退不清除 tempDisease，保留记忆
    this.loadNode(prevNodeId);
  },

  submitV5Diagnosis(lastOption) {
    wx.showLoading({ title: '排除法分析中...', mask: true });

    // 1. 确定最终病害
    // 优先级：最后一步的确诊 > 之前的疑似线索 > 未知
    let finalDisease = lastOption.diagnosis;
    
    // 【核心修复：排除法逻辑】
    // 如果最后一步是“排除根结”或“正常”，导致没有 diagnosis，
    // 那么就应该启用之前捕获的 tempDisease（比如缺素）作为最终结论。
    if (!finalDisease || finalDisease === 'unknown') {
        if (this.tempDisease) {
            finalDisease = this.tempDisease;
            console.log(`✅ 启用排除法，回溯确诊: ${finalDisease}`);
        } else {
            finalDisease = "unknown";
        }
    }
    
    // 2. 特征提取
    const allFeatures = [];
    Object.values(this.userChoices).forEach(choice => {
      if (choice && choice.value) {
        allFeatures.push(choice.value);
      }
    });

    const simulatedAnswers = { leaf: [], fruit: [], root: [] };

    // 3. 特征分发与转译
    const choices = this.userChoices;
    const knotVal  = (choices['q_system_knot'] || {}).value;
    const smellVal = (choices['q_system_smell'] || {}).value;
    const touchVal = (choices['q_system_touch'] || {}).value;

    // 分发普通特征
    allFeatures.forEach(feat => {
      if (feat.startsWith('root_')) simulatedAnswers.root.push(feat);
      else if (this.data.module === 'leaf') simulatedAnswers.leaf.push(feat);
      else simulatedAnswers.fruit.push(feat);
    });

    // 【核心修复：显式注入健康信号】
    // 如果用户明确排除了根部问题，我们要告诉引擎“根是好的”，
    // 这样引擎才能放心地把缺素症的置信度拉高。
    if (knotVal === 'no_knot') simulatedAnswers.root.push('root_healthy'); 
    if (touchVal === 'soil_loose') simulatedAnswers.root.push('root_healthy');
    
    // 注入病害特征
    if (knotVal === 'has_knot') simulatedAnswers.root.push('root_knots');
    if (smellVal === 'sour_smell') simulatedAnswers.root.push('root_rot_smell');
    if (touchVal === 'dry_root') simulatedAnswers.root.push('root_burn_dry');

    // 4. 获取历史
    let lastRecord = null;
    try {
      const history = wx.getStorageSync('diagnosisRecords') || [];
      if (Array.isArray(history) && history.length > 0 && history[0].result) {
        lastRecord = {
          diagnosis: history[0].result.diagnosis,
          timestamp: history[0].id
        };
      }
    } catch (e) {}

    console.log("🚀 [V4.3] 提交特征:", simulatedAnswers);

    // 5. 调用引擎
    const engine = app.globalData.diagnosticEngine;
    let resultPayload = engine.runCombined({
      positions: [this.data.module],
      answers: simulatedAnswers,
      month: new Date().getMonth() + 1,
      crop: this.data.crop,
      lastRecord: lastRecord
    });

    // 6. 强力保底 (Double Safety)
    // 如果引擎因为权重配置问题算分太低（unknown），
    // 且我们通过决策树逻辑已经锁定了 finalDisease，则强制覆盖。
    if (resultPayload.diagnosis === 'unknown' && finalDisease !== 'unknown') {
      console.log("🛡️ 触发保底逻辑，强制确诊:", finalDisease);
      resultPayload.diagnosis = finalDisease;
      resultPayload.confidence = 90; // 排除法确诊，置信度很高
      resultPayload.dynamicLogic = `经根部排查未见明显异常，综合叶片表现，判定为【${finalDisease}】。`;
      
      // 修正标签
      resultPayload.tags = [finalDisease]; 
    }

    // 7. 存储与跳转
    setTimeout(() => {
      wx.setStorageSync('temp_diagnosis_result', resultPayload);
      wx.hideLoading(); 
      wx.redirectTo({ url: '/pages/diagnosis/result/result' });
    }, 500);
  }
});