// cloudfunctions/orchardFunctions/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const type = event.type;

  // --- 模块1：果园管理 (之前的代码) ---
  if (type === 'save') {
    const orchardData = event.data;
    orchardData.updateTime = new Date();
    const check = await db.collection('orchards').where({ _openid: openid }).get();
    if (check.data.length > 0) {
      await db.collection('orchards').doc(check.data[0]._id).update({ data: orchardData });
    } else {
      orchardData.createTime = new Date();
      await db.collection('orchards').add({ data: orchardData });
    }
    return { code: 0, msg: 'success' };
  }
  else if (type === 'getMyOrchard') {
    const res = await db.collection('orchards').where({ _openid: openid }).get();
    return { data: res.data[0] || null, code: 0 };
  }
  else if (type === 'getMonthlyTask') {
    const month = event.month || (new Date().getMonth() + 1);
    const res = await db.collection('farming_calendar').where({ month: month }).get();
    return { data: res.data[0] || null, code: 0 };
  }

  // --- 模块2：诊断历史 (新增代码) ---
  
  // 4. 保存诊断结果
  else if (type === 'saveDiagnosis') {
    const record = event.data;
    // 自动补全时间
    record.createTime = new Date();
    // 自动补全时间戳（方便排序）
    record.timestamp = new Date().getTime();
    
    // 存入数据库
    const res = await db.collection('diagnosis_history').add({
      data: record
    });
    return { code: 0, id: res._id };
  }

  // 5. 获取我的历史记录列表
  else if (type === 'getHistoryList') {
    // 按时间倒序排列（最新的在前）
    const res = await db.collection('diagnosis_history')
      .where({ _openid: openid })
      .orderBy('createTime', 'desc')
      .limit(20) // 最多拿最近20条
      .get();
    return { data: res.data, code: 0 };
  }

  return { code: -1, msg: 'unknown type' };
};