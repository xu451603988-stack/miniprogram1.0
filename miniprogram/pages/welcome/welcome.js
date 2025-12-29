// miniprogram/pages/welcome/welcome.js
Page({
  data: {},

  // 开始诊断
  onStart() {
    // 你当前主流程：先选作物
    this._safeNav('/pages/cropSelect/cropSelect', '作物选择页未配置')
  },

  // 会员中心
  toUser() {
    // 你项目里通常叫 /pages/user/user
    // 如果你实际页面不是这个路径，告诉我你 pages 下真实路径，我再给你改成对应的
    this._safeNav('/pages/user/user', '会员中心页面未配置')
  },

  // 诊断记录
  toHistory() {
    this._safeNav('/pages/history/history', '诊断记录页面未配置')
  },

  // 联系专家
  toExpert() {
    this._safeNav('/pages/expert/expert', '联系专家页面未配置')
  },

  // ============ 兼容旧方法名（避免其它地方还在调用） ============
  startDiagnosis() { this.onStart() },
  goHistory() { this.toHistory() },

  // ============ 通用兜底跳转 ============
  _safeNav(url, failText) {
    wx.navigateTo({
      url,
      fail: (e) => {
        console.warn('[safeNav] nav fail:', url, e)
        wx.showToast({ title: failText || '页面未配置', icon: 'none' })
      }
    })
  }
})
