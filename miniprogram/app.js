// app.js
import { initLocationAndClimate } from './utils/location'

App({
  globalData: {
    location: null,
    climate: null,
    feedbackEnabled: true
  },

  async onLaunch() {
    try {
      const res = await initLocationAndClimate()
      this.globalData.location = res.location
      this.globalData.climate = res.climate
      console.log('系统环境初始化完成', res)
    } catch (e) {
      console.warn('定位或气候初始化失败，进入降级模式')
    }
  }
})
