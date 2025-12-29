/**
 * 云开发请求封装
 * 包含云函数调用、数据库查询、文件上传等常用操作
 */

const db = wx.cloud.database();
const _ = db.command;

/**
 * 调用云函数（Promise 化）
 * @param {string} name - 云函数名称
 * @param {object} data - 传入参数
 * @returns {Promise<any>}
 */
function callFunction(name, data = {}) {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name,
      data,
      success: res => {
        resolve(res.result);
      },
      fail: err => {
        console.error(`[云函数调用失败] ${name}`, err);
        reject(err);
      }
    });
  });
}

/**
 * 查询集合数据（带加载提示和错误处理）
 * @param {string} collection - 集合名称
 * @param {object} where - 查询条件
 * @param {object} options - 可选参数 { orderBy, limit, showLoading }
 * @returns {Promise<Array>}
 */
function query(collection, where = {}, options = {}) {
  const {
    orderBy,
    limit = 20,
    showLoading = true,
    loadingTitle = '加载中...'
  } = options;

  if (showLoading) wx.showLoading({ title: loadingTitle });

  let query = db.collection(collection).where(where);

  if (orderBy) {
    const { field, direction = 'desc' } = orderBy;
    query = query.orderBy(field, direction);
  }

  if (limit) query = query.limit(limit);

  return query.get().then(res => {
    if (showLoading) wx.hideLoading();
    return res.data;
  }).catch(err => {
    if (showLoading) wx.hideLoading();
    console.error('[数据库查询失败]', err);
    wx.showToast({ title: '数据加载失败', icon: 'none' });
    throw err;
  });
}

/**
 * 添加一条记录
 */
function add(collection, data) {
  return db.collection(collection).add({ data }).then(res => res._id);
}

/**
 * 更新记录
 */
function update(collection, docId, data) {
  return db.collection(collection).doc(docId).update({ data });
}

/**
 * 删除记录
 */
function remove(collection, docId) {
  return db.collection(collection).doc(docId).remove();
}

module.exports = {
  callFunction,
  query,
  add,
  update,
  remove,
  _: _  // 导出命令操作符，如 _.inc, _.in 等
};