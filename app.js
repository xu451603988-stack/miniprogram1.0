// miniprogram/app.js

// 引入新的诊断引擎
const NewDiagnosticEngine = require('./utils/newDiagnosticEngine');

App({
  /**
   * 全局数据存储
   */
  globalData: {
    // 用户信息
    userInfo: null,
    // 系统信息
    systemInfo: null,
    // 诊断引擎实例
    diagnosticEngine: null,
    // 当前选中的作物
    currentCrop: 'citrus',
    // 当前月份
    currentMonth: new Date().getMonth() + 1,
    // 诊断历史记录
    diagnosisHistory: [],
    // 版本信息
    version: '2.0.0'
  },

  /**
   * 小程序启动生命周期
   */
  onLaunch() {
    console.log('🚀 作物健康诊断系统启动');
    
    // 初始化诊断引擎
    this._initDiagnosticEngine();
    
    // 获取系统信息
    this._getSystemInfo();
    
    // 加载本地缓存数据
    this._loadLocalData();
    
    console.log('✅ 系统初始化完成');
  },

  /**
   * 小程序显示生命周期
   */
  onShow() {
    // 更新当前月份
    this.globalData.currentMonth = new Date().getMonth() + 1;
    console.log('📅 当前月份更新为:', this.globalData.currentMonth);
  },

  /**
   * 小程序隐藏生命周期
   */
  onHide() {
    // 保存数据到本地缓存
    this._saveLocalData();
  },

  /**
   * 初始化诊断引擎
   */
  _initDiagnosticEngine() {
    try {
      // 挂载诊断引擎到全局
      this.globalData.diagnosticEngine = NewDiagnosticEngine;
      console.log('🤖 新诊断引擎初始化成功（newDiagnosticEngine 已挂载）');
    } catch (error) {
      console.error('❌ 诊断引擎初始化失败:', error);
      wx.showModal({
        title: '系统警告',
        content: '诊断模块加载失败，部分功能可能无法使用',
        showCancel: false
      });
    }
  },

  /**
   * 获取系统信息
   */
  _getSystemInfo() {
    try {
      const systemInfo = wx.getSystemInfoSync();
      this.globalData.systemInfo = {
        brand: systemInfo.brand,
        model: systemInfo.model,
        system: systemInfo.system,
        version: systemInfo.version,
        SDKVersion: systemInfo.SDKVersion,
        pixelRatio: systemInfo.pixelRatio,
        screenWidth: systemInfo.screenWidth,
        screenHeight: systemInfo.screenHeight,
        windowWidth: systemInfo.windowWidth,
        windowHeight: systemInfo.windowHeight
      };
      console.log('📱 系统信息获取成功');
    } catch (error) {
      console.warn('⚠️ 获取系统信息失败:', error);
    }
  },

  /**
   * 加载本地缓存数据
   */
  _loadLocalData() {
    try {
      // 加载用户诊断历史
      const history = wx.getStorageSync('diagnosisHistory');
      if (history) {
        this.globalData.diagnosisHistory = JSON.parse(history);
        console.log('📚 已加载', this.globalData.diagnosisHistory.length, '条历史记录');
      }
      
      // 加载用户偏好设置
      const userPrefs = wx.getStorageSync('userPreferences');
      if (userPrefs) {
        const prefs = JSON.parse(userPrefs);
        if (prefs.currentCrop) {
          this.globalData.currentCrop = prefs.currentCrop;
        }
        console.log('⚙️ 用户偏好设置已加载');
      }
    } catch (error) {
      console.warn('⚠️ 加载本地缓存失败:', error);
    }
  },

  /**
   * 保存数据到本地缓存
   */
  _saveLocalData() {
    try {
      // 保存诊断历史
      wx.setStorageSync('diagnosisHistory', JSON.stringify(this.globalData.diagnosisHistory));
      
      // 保存用户偏好
      const userPrefs = {
        currentCrop: this.globalData.currentCrop,
        lastVisit: new Date().toISOString()
      };
      wx.setStorageSync('userPreferences', JSON.stringify(userPrefs));
      
      console.log('💾 数据已保存到本地缓存');
    } catch (error) {
      console.warn('⚠️ 保存本地缓存失败:', error);
    }
  },

  /**
   * 添加诊断记录到历史
   * @param {Object} diagnosisData 传给引擎的诊断入参（至少包含 crop / month / module / answers）
   * @param {Object} result        引擎输出映射后的结果对象（包含 diagnosis_label 等）
   */
  addToHistory(diagnosisData, result) {
    // 使用诊断数据中明确的 module 字段，而不是猜测 leaf / fruit
    const module = diagnosisData.module || 'leaf';

    const record = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString('zh-CN'),
      crop: diagnosisData.crop,
      month: diagnosisData.month,
      module: module,   // 'leaf' | 'fruit' | 'root'
      diagnosisLabel: result.diagnosis_label,
      result: result
    };
    
    // 添加到历史记录数组开头（最新在前）
    this.globalData.diagnosisHistory.unshift(record);
    
    // 限制历史记录数量（最多保留50条）
    if (this.globalData.diagnosisHistory.length > 50) {
      this.globalData.diagnosisHistory = this.globalData.diagnosisHistory.slice(0, 50);
    }
    
    // 保存到本地
    this._saveLocalData();
    
    console.log('📝 新诊断记录已添加到历史，模块：', module);
  },

  /**
   * 获取诊断历史
   */
  getDiagnosisHistory() {
    return this.globalData.diagnosisHistory;
  },

  /**
   * 清除诊断历史
   */
  clearHistory() {
    this.globalData.diagnosisHistory = [];
    wx.removeStorageSync('diagnosisHistory');
    console.log('🗑️ 诊断历史已清除');
  },

  /**
   * 获取诊断次数统计
   */
  getStats() {
    const history = this.globalData.diagnosisHistory;
    const leafCount = history.filter(r => r.module === 'leaf').length;
    const fruitCount = history.filter(r => r.module === 'fruit').length;
    
    return {
      total: history.length,
      leaf: leafCount,
      fruit: fruitCount,
      thisMonth: history.filter(r => {
        const recordMonth = new Date(r.timestamp).getMonth() + 1;
        return recordMonth === this.globalData.currentMonth;
      }).length
    };
  }
});
