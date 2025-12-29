// miniprogram/pages/positionSelect/positionSelect.js
Page({
  data: {
    crop: 'citrus',
    month: new Date().getMonth() + 1,
    mode: 'single', // single | multi
    selectedPositions: [],

    positions: [
      { key: 'leaf', name: '叶片', desc: '叶片发黄、斑点、卷曲等问题' },
      { key: 'fruit', name: '果实', desc: '果面斑点、裂果、日灼等问题' },
      { key: 'branch', name: '枝条', desc: '枝梢枯萎、流胶、腐烂等问题' },
      { key: 'root', name: '根系', desc: '烂根、根腐、土壤异味等问题' }
    ]
  },

  onLoad(options = {}) {
    const crop = options.crop || 'citrus'
    const month = options.month ? Number(options.month) : (new Date().getMonth() + 1)

    this.setData({
      crop,
      month
    })
  },

  // 选择部位（支持多选）
  onTogglePosition(e) {
    const key = e.currentTarget.dataset.key
    const { selectedPositions } = this.data

    let next = Array.isArray(selectedPositions) ? [...selectedPositions] : []
    if (next.includes(key)) next = next.filter(k => k !== key)
    else next.push(key)

    // mode：单选/多选
    const mode = next.length > 1 ? 'multi' : 'single'

    this.setData({
      selectedPositions: next,
      mode
    })
  },

  // ✅ 兼容你 WXML 里 bindtap="onStartDiagnosis"
  onStartDiagnosis() {
    this.goNext()
  },

  // ✅ 你原本“下一步/开始诊断”的逻辑
  goNext() {
    const { crop, month, mode, selectedPositions } = this.data

    if (!selectedPositions || selectedPositions.length === 0) {
      wx.showToast({ title: '请选择部位', icon: 'none' })
      return
    }

    // ✅ A方案：新一轮诊断，清空上次问卷缓存（关键修复点）
    try {
      wx.removeStorageSync('last_diagnosis_answers')
      wx.removeStorageSync('answers') // 兼容旧key
    } catch (e) {}

    const positionsStr = selectedPositions.join(',')

    wx.navigateTo({
      url: `/pages/question/question?crop=${encodeURIComponent(crop)}&month=${encodeURIComponent(
        String(month)
      )}&mode=${encodeURIComponent(mode)}&positions=${encodeURIComponent(positionsStr)}`
    })
  }
})
