// cloudfunctions/orchardFunctions/index.js
const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  // 1. 保存诊断记录
  if (event.type === 'saveDiagnosis') {
    try {
      return await db.collection('diagnosis_history').add({
        data: {
          _openid: openid,
          ...event.data, // 包含 diagnosis, crop, answers, result 等
          timestamp: new Date().getTime(),
          createTime: db.serverDate()
        }
      });
    } catch (e) {
      return { success: false, errMsg: e };
    }
  }

  // 2. 获取历史列表 (用于首页列表 + 容灾追溯)
  if (event.type === 'getHistoryList') {
    try {
      return await db.collection('diagnosis_history')
        .where({ _openid: openid })
        .orderBy('timestamp', 'desc') // 按时间倒序
        .limit(20) // 取最近20条
        .get();
    } catch (e) {
      return { success: false, errMsg: e };
    }
  }

  // 3. 获取单条详情 (用于结果页分享回看)
  if (event.type === 'getDetail') {
    try {
      return await db.collection('diagnosis_history').doc(event.id).get();
    } catch (e) {
      return { success: false, errMsg: e };
    }
  }

  return { success: false, msg: 'Unknown type' };
};