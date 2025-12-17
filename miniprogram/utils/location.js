// utils/location.js
export function initLocationAndClimate() {
  return new Promise((resolve, reject) => {
    wx.getLocation({
      type: 'wgs84',
      success(res) {
        const latitude = res.latitude
        const climate = mapClimate(latitude)
        resolve({
          location: res,
          climate
        })
      },
      fail() {
        reject()
      }
    })
  })
}

function mapClimate(lat) {
  if (lat < 23) return 'south_humid'
  if (lat < 30) return 'subtropical'
  return 'north_temperate'
}
