/**
 * 日期工具模块
 */

/**
 * 格式化日期
 * @param {Date|string|number} date - 日期对象、时间戳或可解析字符串
 * @param {string} fmt - 格式字符串，默认 'YYYY-MM-DD'
 * @returns {string} 格式化后的日期字符串
 * 示例：formatDate(new Date(), 'YYYY-MM-DD hh:mm:ss') => '2025-12-16 14:30:45'
 */
function formatDate(date = new Date(), fmt = 'YYYY-MM-DD') {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  if (isNaN(date.getTime())) return '';

  const o = {
    'Y+': date.getFullYear(),
    'M+': date.getMonth() + 1,
    'D+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds()
  };

  for (let k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      const str = o[k] + '';
      fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? str : ('00' + str).padStart(RegExp.$1.length, '0'));
    }
  }
  return fmt;
}

/**
 * 获取当前时间戳（毫秒）
 */
function getTimestamp() {
  return Date.now();
}

/**
 * 获取今天0点的时间戳
 */
function getTodayStartTimestamp() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}

module.exports = {
  formatDate,
  getTimestamp,
  getTodayStartTimestamp
};