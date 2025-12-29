/**
 * 常用工具函数
 */

/**
 * 统一 toast 提示
 * @param {string} title
 * @param {string} icon - success / error / loading / none
 * @param {number} duration
 */
function toast(title, icon = 'none', duration = 2000) {
  wx.showToast({
    title,
    icon,
    duration
  });
}

/**
 * 显示成功提示
 */
function success(title = '操作成功') {
  toast(title, 'success');
}

/**
 * 显示失败提示
 */
function fail(title = '操作失败') {
  toast(title, 'error');
}

/**
 * 显示加载中
 * @param {string} title
 */
function showLoading(title = '加载中...') {
  wx.showLoading({ title, mask: true });
}

/**
 * 隐藏加载
 */
function hideLoading() {
  wx.hideLoading();
}

/**
 * 获取当前用户 openid（推荐在需要时调用）
 * @returns {Promise<string>}
 */
function getOpenid() {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'getOpenid', // 需要在云函数中创建一个获取 openid 的函数，或直接使用官方模板
      success: res => {
        resolve(res.result.openid);
      },
      fail: reject
    });
  });
}

/**
 * 防抖函数
 * @param {Function} fn
 * @param {number} wait - 毫秒
 */
function debounce(fn, wait = 300) {
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, wait);
  };
}

module.exports = {
  toast,
  success,
  fail,
  showLoading,
  hideLoading,
  getOpenid,
  debounce
};