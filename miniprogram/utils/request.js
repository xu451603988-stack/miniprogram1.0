function callService(name, data = {}) {
  return wx.cloud.callFunction({
    name,
    data
  }).catch(err => {
    console.error('云函数调用失败：', err)
    wx.showToast({
      title: '系统繁忙，请稍后再试',
      icon: 'none'
    })
    throw err
  })
}

module.exports = {
  callService
}
