// miniprogram/pages/positionSelect/positionSelect.js
Page({
  data: {
    crop: 'citrus',
    month: new Date().getMonth() + 1,

    // ✅ 必须有 selected 字段（你的 WXML 用 item.selected 来渲染样式/✔）
    positions: [
      { id: 'leaf',   name: '叶片', desc: '叶片发黄、斑点、卷曲等问题', selected: false, icon: '🍃' },
      { id: 'fruit',  name: '果实', desc: '果面斑点、裂果、日灼等问题', selected: false, icon: '🍊' },
      { id: 'branch', name: '枝条', desc: '枝梢枯萎、流胶、腐烂等问题', selected: false, icon: '🌿' },
      { id: 'root',   name: '根系', desc: '烂根、根腐、土壤异味等问题', selected: false, icon: '🪴' }
    ]
  },

  onLoad(options = {}) {
    // 兼容上游可能传 crop/month
    const crop = options.crop || 'citrus'
    const month = options.month ? Number(options.month) : (new Date().getMonth() + 1)

    this.setData({ crop, month })
  },

  /* =====================================================
   * ✅ WXML 绑定的方法（一个不漏）
   * positionSelect.wxml:
   *  - bindtap="onTogglePosition" (data-id)
   *  - bindtap="onStartDiagnosis"
   * ===================================================== */

  // 点击卡片：切换选中
  onTogglePosition(e) {
    this.togglePosition(e)
  },

  togglePosition(e) {
    const id = e.currentTarget.dataset.id
    if (!id) return

    const positions = (this.data.positions || []).map(p => {
      if (p.id === id) return { ...p, selected: !p.selected }
      return p
    })

    this.setData({ positions })
  },

  // 开始诊断按钮
  onStartDiagnosis() {
    this.goNext()
  },

  goNext() {
    const positions = this.data.positions || []
    const selected = positions.filter(p => p.selected).map(p => p.id)

    if (selected.length === 0) {
      wx.showToast({ title: '请选择至少一个部位', icon: 'none' })
      return
    }

    const mode = selected.length > 1 ? 'combo' : 'single'
    const positionsStr = selected.join(',')
    const crop = this.data.crop || 'citrus'
    const month = this.data.month || (new Date().getMonth() + 1)

    // ✅ A方案：新一轮诊断清空上次问卷缓存（避免 question 直接结束）
    try {
      wx.removeStorageSync('last_diagnosis_answers')
      wx.removeStorageSync('answers') // 兼容旧key
    } catch (e) {}

    wx.navigateTo({
      url: `/pages/question/question?mode=${encodeURIComponent(mode)}&positions=${encodeURIComponent(
        positionsStr
      )}&crop=${encodeURIComponent(crop)}&month=${encodeURIComponent(String(month))}`
    })
  }
})
