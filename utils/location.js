// utils/location.js
export function getUserLocation() {
  return new Promise((resolve, reject) => {
    wx.getLocation({
      type: 'wgs84',
      success(res) {
        resolve({
          latitude: res.latitude,
          longitude: res.longitude
        });
      },
      fail() {
        reject('location_denied');
      }
    });
  });
}
