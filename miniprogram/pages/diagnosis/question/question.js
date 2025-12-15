// miniprogram/pages/diagnosis/question/question.js
// V5.0 决策树驱动引擎 (叶果联动版)
// 核心职责：节点跳转、路径记录、线索收集、综合定性

const app = getApp();

// 1. 引入决策树数据源
// 注意：路径需严格对应您新建的文件夹结构
const decisionTrees = {
  'citrus_leaf': require('../../../data/decision_trees/citrus_leaf.js'),
  'citrus_fruit': require('../../../data/decision_trees/citrus_fruit.js') // 新增果实树
  // 未来可扩展: 'citrus_root': require(...)
};

Page({
  data: {
    currentNode: null,    // 当前展示的题目节点对象
    historyStack: [],     // 历史路径栈（用于返回上一题）
    isInitialized: false, // 页面加载状态
    
    // 诊断上下文
    crop: 'citrus',
    module: 'leaf'
  },

  // 用于在内存中暂存用户的选择和推断（不放入 data 以免影响渲染性能）
  userChoices: {},    // 记录每一题选了什么 { nodeId: optionValue }
  tempDisease: null,  // 暂存的表象诊断（如：检测到了蚜虫）

  /**
   * 页面加载
   */
  onLoad(options) {
    console.log("【V5.0 引擎启动】参数:", options);

    // 1. 初始化上下文
    const crop = options.crop || app.globalData.currentCrop || 'citrus';
    
    // 解析模块类型 (leaf/fruit/root)
    let moduleType = 'leaf'; // 默认为叶片
    // 兼容从 positionSelect 传来的数组字符串格式
    if (options.positions && options.positions.indexOf('fruit') > -1) {
      moduleType = 'fruit';
    }
    // 兼容直接传参
    if (options.moduleType) {
      moduleType = options.moduleType;
    }

    this.setData({ crop, module: moduleType });

    // 2. 加载对应的决策树数据
    // 拼接 Key (如 "citrus_leaf" 或 "citrus_fruit")
    const treeKey = `${crop}_${moduleType}`;
    const treeData = decisionTrees[treeKey];

    if (!treeData) {
      wx.showModal({
        title: '配置缺失',
        content: `暂未找到 [${treeKey}] 的决策树数据，请确保已创建对应文件。`,
        showCancel: false,
        success: () => wx.navigateBack()
      });
      return;
    }

    // 挂载数据到实例
    this.treeData = treeData;
    
    // 重置记录
    this.userChoices = {};
    this.tempDisease = null;

    // 3. 启动引擎：加载入口节点
    this.loadNode('start');
  },

  /**
   * 引擎核心：加载指定 ID 的节点
   */
  loadNode(nodeId) {
    const node = this.treeData[nodeId];

    if (!node) {
      console.error("❌ 路由错误：找不到节点 ID", nodeId);
      wx.showToast({ title: '流程配置错误', icon: 'none' });
      return;
    }

    console.log("👉 跳转节点:", nodeId, node.title);

    // 更新 UI
    this.setData({
      currentNode: node,
      isInitialized: true
    });
  },

  /**
   * 交互事件：用户点击选项
   */
  onOptionClick(e) {
    const option = e.currentTarget.dataset.item;
    if (!option) return;

    const currentNodeId = this.data.currentNode.id;
    console.log(`✅ 用户在 [${currentNodeId}] 选择了:`, option.label);

    // 1. 【关键】记录用户轨迹
    // 这对于最后的“综合辨证”至关重要
    this.userChoices[currentNodeId] = option;

    // 2. 【关键】捕获暂存诊断 (tempDiagnosis)
    // 例如：用户选了“有蚜虫”或“红鼻子果”，虽然流程还没完，但这不仅是路径，也是结论
    if (option.tempDiagnosis) {
      this.tempDisease = option.tempDiagnosis;
      console.log("🔍 捕获表象线索:", this.tempDisease);
    }

    // 3. 执行路由跳转
    if (option.isEnd) {
      // 到达终点，进入结算
      this.submitV5Diagnosis(option);
    } else if (option.next) {
      // 还有下一题
      // 入栈：保存当前节点 ID，方便回退
      this.data.historyStack.push(currentNodeId);
      // 跳转
      this.loadNode(option.next);
    } else {
      wx.showToast({ title: '该选项未配置下一步', icon: 'none' });
    }
  },

  /**
   * 交互事件：返回上一题
   */
  goBack() {
    // 如果栈空了，说明是第一题，直接退出页面
    if (this.data.historyStack.length === 0) {
      wx.navigateBack();
      return;
    }

    // 出栈：取出上一个节点的 ID
    const prevNodeId = this.data.historyStack.pop();
    
    // 【重要】回退时，要清除刚才那个节点的选择记录，防止逻辑污染
    const currentId = this.data.currentNode.id;
    delete this.userChoices[currentId];

    // 如果回退的节点曾设置过 tempDiagnosis，也要回滚吗？
    // 简化处理：tempDiagnosis 采用“最后写入优先”原则，再次选择会覆盖

    // 重新加载上一题
    this.loadNode(prevNodeId);
  },

  /**
   * 结算算法：中医式综合辨证 (V5.0 核心)
   * 将“表象病害”与“根际体质”结合，生成最终结论
   */
  submitV5Diagnosis(lastOption) {
    console.log("🎉 流程结束，开始综合辨证...");

    const choices = this.userChoices;
    
    // 1. 提取基础结论
    // 优先使用最后一步的确诊结果，如果没有，就用路上收集到的 tempDisease
    let finalDisease = lastOption.diagnosis || this.tempDisease || "unknown";
    
    // 2. 提取根际体质 (查本)
    // 这些 Key 必须与 citrus_leaf.js / citrus_fruit.js 中的节点 ID 对应
    const smellVal = choices['q_system_smell']?.value; // 闻诊结果
    const touchVal = choices['q_system_touch']?.value; // 切诊结果
    // 兼容不同决策树中查根结的节点 ID
    const knotVal  = choices['q_system_knot']?.value || choices['q_system_check_root_knot']?.value; 

    let rootStatus = "normal"; // 默认为健康

    // === 辨证逻辑 A：一票否决权 (根结线虫) ===
    // 如果发现了根结线虫，它就是主因，覆盖之前的所有推测
    if (knotVal === 'has_knot') {
      finalDisease = "nematodes";
      // 线虫通常伴随根弱
      rootStatus = "deficiency_qi"; 
    }
    
    // === 辨证逻辑 B：湿热证判定 (根腐/沤根) ===
    // 依据：酸臭味 OR 烂根/板结
    else if (smellVal === 'sour_smell' || touchVal === 'bad_root') {
      rootStatus = "damp_heat"; // 定性：湿热困脾
      
      // 如果表象只是“缺素”、“未知”或“生理性干旱”
      // 但根部其实是湿热腐烂，那么必须修正主病为“系统性根腐”
      const weakDiagnoses = ['unknown', 'drought_stress', 'deficiency_Fe_Zn', 'deficiency_Mg', 'deficiency_Zn_suspect'];
      if (weakDiagnoses.includes(finalDisease) || finalDisease.includes('deficiency')) {
        finalDisease = "root_rot_systemic";
      }
    }
    
    // === 辨证逻辑 C：气虚/阴虚判定 (干旱/老化) ===
    // 依据：根干枯脆断
    else if (touchVal === 'dry_root') {
      rootStatus = "deficiency_qi"; // 定性：气阴两虚
    }

    // 3. 构造最终 Payload
    console.log(`📊 辨证结果: 主病[${finalDisease}] + 体质[${rootStatus}]`);

    const resultPayload = {
      type: 'decision_tree_v5', // 标记版本，通知结果页使用新模版
      diagnosis: finalDisease,  // 核心病害 Code
      rootStatus: rootStatus,   // 体质 Code
      timestamp: new Date().getTime()
    };

    // 4. 跳转结果页
    const url = `/pages/diagnosis/result/result?result=${encodeURIComponent(JSON.stringify(resultPayload))}`;
    
    // 使用 redirectTo 避免结果页回退再做一次提交
    wx.redirectTo({ url });
  }
});