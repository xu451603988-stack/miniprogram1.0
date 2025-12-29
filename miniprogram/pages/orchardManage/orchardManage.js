const KEY_LIST = 'orchardProfiles'
const KEY_ACTIVE = 'activeOrchardId'

Page({
  data: {
    orchards: [],
    activeId: ''
  },

  onShow() {
    this.load()
  },

  load() {
    const list = wx.getStorageSync(KEY_LIST)
    const orchards = Array.isArray(list) ? list : []
    const activeId = wx.getStorageSync(KEY_ACTIVE) || (orchards[0]?.id || '')
    if (activeId) wx.setStorageSync(KEY_ACTIVE, activeId)

    this.setData({ orchards, activeId })
  },

  onAdd() {
    wx.navigateTo({ url: '/pages/orchardEdit/orchardEdit?mode=create' })
  },

  onEdit(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/orchardEdit/orchardEdit?mode=edit&id=${id}` })
  },

  onSetDefault(e) {
    const id = e.currentTarget.dataset.id
    wx.setStorageSync(KEY_ACTIVE, id)
    this.setData({ activeId: id })
    wx.showToast({ title: '已设为默认', icon: 'success' })
  },

  onDelete(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '删除果园',
      content: '确定要删除该果园档案吗？（不可恢复）',
      confirmText: '删除',
      confirmColor: '#d32f2f',
      success: (res) => {
        if (!res.confirm) return
        const list = wx.getStorageSync(KEY_LIST)
        const orchards = (Array.isArray(list) ? list : []).filter(o => o.id !== id)
        wx.setStorageSync(KEY_LIST, orchards)

        // 如果删的是默认果园，自动换成第一个
        const activeId = wx.getStorageSync(KEY_ACTIVE)
        if (activeId === id) {
          const newActive = orchards[0]?.id || ''
          wx.setStorageSync(KEY_ACTIVE, newActive)
        }

        this.load()
        wx.showToast({ title: '已删除', icon: 'success' })
      }
    })
  }
})
