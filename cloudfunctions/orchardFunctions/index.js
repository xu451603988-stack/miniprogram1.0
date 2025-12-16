// cloudfunctions/orchardFunctions/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const type = event.type;

  // --- 模块1：果园管理 ---
  if (type === 'save') {
    // 1. 安全校验：只提取允许的字段，防止恶意覆盖
    const rawData = event.data || {};
    
    // 强制数据清洗：创建一个新对象，只包含我们允许的字段
    const orchardData = {
      name: String(rawData.name || '').slice(0, 50), // 限制名字长度
      variety: String(rawData.variety || ''),
      age: Number(rawData.age) || 0,
      address: String(rawData.address || '').slice(0, 100),
      latitude: rawData.latitude,
      longitude: rawData.longitude,
      updateTime: new Date() // 强制使用服务器时间，不信任前端传的时间
    };

    // 2. 必填项检查
    if (!orchardData.name || !orchardData.latitude) {
      return { code: -1, msg: '缺少果园位置或名称' };
    }

    // 3. 数据库操作
    const check = await db.collection('orchards').where({ _openid: openid }).get();
    
    if (check.data.length > 0) {
      // 更新现有记录
      await db.collection('orchards').doc(check.data[0]._id).update({ data: orchardData });
    } else {
      // 新增记录
      orchardData.createTime = new Date();
      // 自动附带 _openid，无需手动添加
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

  // --- 模块2：诊断历史 ---
  else if (type === 'saveDiagnosis') {
    const record = event.data;
    
    // 简单清洗
    if (!record || !record.diagnosis) {
      return { code: -1, msg: 'invalid data' };
    }

    // 补充时间信息
    record.createTime = new Date();
    record.timestamp = new Date().getTime();
    
    // 存入数据库
    const res = await db.collection('diagnosis_history').add({
      data: record
    });
    return { code: 0, id: res._id };
  }

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