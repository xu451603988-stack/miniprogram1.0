// 首页逻辑：仅负责跳转至作物选择页
Page({
  /**
   * 页面的初始数据（首页无动态数据，留空即可）
   */
  data: {},

  /**
   * 点击"开始诊断"按钮，跳转至作物选择页
   * 核心：从首页→作物选择页→诊断表单页的流程入口
   */
  goToForm() {
    wx.navigateTo({
      // 路径严格对应新建的作物选择页
      url: '/pages/cropSelect/cropSelect',
      success: () => {
        console.log('跳转作物选择页成功'); // 调试用，发布时可删除
      },
      fail: (err) => {
        // 跳转失败时弹窗提示（常见原因：页面未创建或路径错误）
        wx.showModal({
          title: '跳转失败',
          content: '请检查作物选择页是否存在：pages/cropSelect/cropSelect\n错误详情：' + err.errMsg,
          showCancel: false
        });
        console.error('跳转失败原因：', err); // 控制台打印详细错误
      }
    });
  },

  /**
   * 生命周期函数--监听页面加载（首页加载时触发）
   */
  onLoad() {
    // 可在这里添加首页初始化逻辑，如加载缓存数据等
    console.log('首页加载完成');
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示（每次进入首页时触发）
   */
  onShow() {},

  /**
   * 生命周期函数--监听页面隐藏（离开首页时触发）
   */
  onHide() {},

  /**
   * 生命周期函数--监听页面卸载（首页被关闭时触发）
   */
  onUnload() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    // 首页一般不需要下拉刷新，如需开启可在此处理
    wx.stopPullDownRefresh(); // 停止下拉刷新动画
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {},

  /**
   * 用户点击右上角分享（支持分享首页）
   */
  onShareAppMessage() {
    return {
      title: '作物诊断小助手，科学辨病更轻松',
      path: '/pages/index/index' // 分享后打开首页
    };
  }
});