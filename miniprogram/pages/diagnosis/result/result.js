// pages/diagnosis/result/result.js
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoading: true, // 加载状态
    resultId: null, // 诊断记录ID
    
    // 诊断结果核心数据对象 (默认空结构，防止渲染报错)
    result: {
      diseaseName: '',     // 病害名称 (如：柑橘红蜘蛛)
      probability: 0,      // 置信度/相似度 (0-100)
      severity: '',        // 严重程度 (轻度/中度/重度)
      imageUrl: '',        // 诊断的原图
      featureDesc: '',     // 症状描述
      
      // 核心分析：结合你提到的“药害/肥害/根系/卷叶”等多维度
      analysis: [],        // 数组，例如 ["叶片主要呈现反卷", "疑似伴有轻微药害"]
      
      // 解决方案：分为 农业防治(物理) 和 化学防治(药剂)
      solutions: {
        agricultural: [], // 农业/物理防治建议
        chemical: [],     // 化学药剂建议
        prevention: ''    // 治未病/日常养护建议
      }
    },

    // 推荐产品列表 (可关联商城)
    recommendProducts: [] 
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ isLoading: true });

    // 场景1：如果有 id，从服务器获取详情
    if (options.id) {
      this.setData({ resultId: options.id });
      this.fetchDiagnosisResult(options.id);
    } 
    // 场景2：如果上一页直接传了编码后的对象 (适用于离线或快速展示)
    else if (options.data) {
      try {
        const resultData = JSON.parse(decodeURIComponent(options.data));
        this.setData({ 
          result: resultData,
          isLoading: false 
        });
      } catch (e) {
        console.error("解析数据失败", e);
        this.showError("数据解析错误");
      }
    } 
    // 场景3：开发调试用 (当没有参数时加载模拟数据)
    else {
      // TODO: 正式上线请注释掉此行
      this.mockDebugData();
    }
  },

  /**
   * 模拟数据 (用于开发阶段调试 UI)
   */
  mockDebugData: function() {
    console.warn("⚠️ 正在使用模拟数据");
    setTimeout(() => {
      this.setData({
        isLoading: false,
        result: {
          diseaseName: '柑橘黄龙病 (疑似)',
          probability: 88.5,
          severity: '中度',
          imageUrl: 'https://via.placeholder.com/300x300?text=Citrus+Leaf', // 替换为你的测试图
          featureDesc: '叶片呈现斑驳状黄化，且左右不对称；叶脉肿大。',
          analysis: [
            '叶片主要呈现斑驳黄化',
            '根系活力可能受损',
            '需排查是否存在线虫影响'
          ],
          solutions: {
            agricultural: [
              '严格管控病树，发现确诊立即挖除。',
              '加强对木虱的监测与防控。'
            ],
            chemical: [
              '选用高效氯氰菊酯进行木虱消杀。',
              '补充锌、铁等微量元素叶面肥。'
            ],
            prevention: '核心在于“治未病”，需常年监测果园木虱基数，提升树体自身抗性。'
          }
        }
      });
    }, 1000);
  },

  /**
   * 从服务器获取诊断结果 API
   */
  fetchDiagnosisResult: function (id) {
    const that = this;
    // 模拟网络请求
    // wx.request({
    //   url: app.globalData.apiUrl + '/diagnosis/detail/' + id,
    //   method: 'GET',
    //   success: (res) => {
    //     if (res.data.code === 200) {
    //       that.setData({
    //         result: res.data.data,
    //         isLoading: false
    //       });
    //     } else {
    //       that.showError(res.data.msg);
    //     }
    //   },
    //   fail: () => {
    //     that.showError("网络请求失败");
    //   }
    // });
    
    // 暂时直接调用模拟数据替代 API
    this.mockDebugData();
  },

  /**
   * 图片预览
   */
  onPreviewImage: function () {
    if (this.data.result.imageUrl) {
      wx.previewImage({
        urls: [this.data.result.imageUrl]
      });
    }
  },

  /**
   * 点击咨询专家
   */
  onConsultExpert: function () {
    wx.navigateTo({
      url: '/pages/expert/chat/chat?disease=' + this.data.result.diseaseName,
      fail: () => {
        // 如果没有专家页，则弹窗提示或拨打电话
        wx.showModal({
          title: '专家服务',
          content: '即将为您接通植保专家热线：400-XXX-XXXX',
          confirmText: '拨打',
          success(res) {
            if (res.confirm) {
              wx.makePhoneCall({ phoneNumber: '13800000000' });
            }
          }
        });
      }
    });
  },

  /**
   * 保存结果/生成海报
   */
  onSaveResult: function () {
    wx.showToast({
      title: '生成海报中...',
      icon: 'loading'
    });
    // 这里可以接入 canvas 绘图逻辑生成海报
    setTimeout(() => {
      wx.hideToast();
      wx.showToast({ title: '保存成功' });
    }, 1000);
  },

  /**
   * 返回首页
   */
  onBackHome: function () {
    wx.switchTab({
      url: '/pages/index/index', // 确保这是你的 tabbar 首页路径
      fail: () => {
        wx.reLaunch({ url: '/pages/index/index' });
      }
    });
  },

  /**
   * 再次诊断
   */
  onRetry: function() {
    wx.navigateBack({
      delta: 1
    });
  },

  /**
   * 错误提示辅助函数
   */
  showError: function (msg) {
    this.setData({ isLoading: false });
    wx.showToast({
      title: msg || '未知错误',
      icon: 'none',
      duration: 2000
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    const disease = this.data.result.diseaseName || '作物健康诊断';
    return {
      title: `我的果园诊断报告：${disease}`,
      path: `/pages/diagnosis/result/result?id=${this.data.resultId}`
    };
  }
});