const KEY_LIST = 'orchardProfiles'
const KEY_ACTIVE = 'activeOrchardId'

function safeNum(v, fallback) {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

Page({
  data: {
    mode: 'create', // create | edit
    id: '',
    form: {
      name: '',
      region: 'unknown',
      age: 5,
      variety: '',
      areaMu: 0,
      management: ''
    }
  },

  onLoad(options) {
    const mode = options?.mode || 'create'
    const id = options?.id || ''
    this.setData({ mode, id })

    if (mode === 'edit' && id) {
      const list = wx.getStorageSync(KEY_LIST)
      const orchards = Array.isArray(list) ? list : []
      const found = orchards.find(o => o.id === id)
      if (found) {
        this.setData({
          form: {
            name: found.name || '',
            region: found.region || 'unknown',
            age: safeNum(found.age, 5),
            variety: found.variety || '',
            areaMu: safeNum(found.areaMu, 0),
            management: found.management || ''
          }
        })
      }
    } else {
      const list = wx.getStorageSync(KEY_LIST)
      const orchards = Array.isArray(list) ? list : []
      const n = orchards.length + 1
      this.setData({ 'form.name': `新果园${n}` })
    }
  },

  onInput(e) {
    const key = e.currentTarget.dataset.key
    const val = e.detail.value
    this.setData({ [`form.${key}`]: val })
  },

  // ✅ 保存（核心逻辑已帮你处理好）
  onSave() {
    const f = this.data.form || {}
    const name = (f.name || '').trim()
    if (!name) {
      wx.showToast({ title: '请输入果园名称', icon: 'none' })
      return
    }

    const record = {
      id: this.data.mode === 'edit' ? this.data.id : `orchard_${Date.now()}`,
      name,
      region: (f.region || 'unknown').trim() || 'unknown',
      age: safeNum(f.age, 5),
      variety: (f.variety || '').trim(),
      areaMu: safeNum(f.areaMu, 0),
      management: (f.management || '').trim()
    }

    const list = wx.getStorageSync(KEY_LIST)
    const orchards = Array.isArray(list) ? list : []

    let next = []
    if (this.data.mode === 'edit') {
      next = orchards.map(o => (o.id === record.id ? record : o))
    } else {
      next = [...orchards, record]
    }

    wx.setStorageSync(KEY_LIST, next)

    // ✅ 关键：告诉 question 页“刚保存的是谁”
    wx.setStorageSync('lastEditedOrchardId', record.id)
    wx.setStorageSync(KEY_ACTIVE, record.id)

    wx.showToast({ title: '已保存', icon: 'success' })
    setTimeout(() => wx.navigateBack(), 300)
  }
})
