// cloudfunctions/orchardFunctions/index.js
const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  // === 1. 获取/自动创建用户信息 ===
  if (event.type === 'getLatestUserInfo') {
    try {
      const userQuery = await db.collection('users').where({ _openid: openid }).get();
      if (userQuery.data.length > 0) {
        return { success: true, data: userQuery.data };
      } else {
        const newUserConfig = {
          _openid: openid,
          memberLevel: 0,
          expireTime: 0,
          remainingPoints: 5,
          createTime: db.serverDate()
        };
        await db.collection('users').add({ data: newUserConfig });
        return { success: true, data: [newUserConfig] };
      }
    } catch (e) {
      return { success: false, msg: '获取用户信息失败', error: e };
    }
  }

  // === 2. 真实数据库兑换码核销 (已适配你的 redemption_codes 集合) ===
  if (event.type === 'redeemCode') {
    const code = event.data.code;
    
    try {
      // 第一步：去 redemption_codes 表里查这个码
      // 条件：必须是这个码(code)，而且必须是未使用的(status: 0)
      const codeRecord = await db.collection('redemption_codes').where({
        code: code,
        status: 0 
      }).get();

      // 如果找不到，或者 status 不等于 0
      if (codeRecord.data.length === 0) {
        return { success: false, msg: '无效或已被使用的兑换码' };
      }

      const codeData = codeRecord.data[0];
      const pointsToAdd = codeData.points || 10; // 如果数据库里没写points，默认加10分

      // 第二步：执行核销（标记为已使用）
      // 使用 db.serverDate() 记录被谁、什么时间用了
      await db.collection('redemption_codes').doc(codeData._id).update({
        data: {
          status: 1, // 1 代表已使用
          usedBy: openid,
          usedTime: db.serverDate()
        }
      });

      // 第三步：给用户加积分
      await db.collection('users').where({ _openid: openid }).update({
        data: {
          remainingPoints: _.inc(pointsToAdd)
        }
      });

      return { success: true, msg: '兑换成功' };

    } catch (e) {
      console.error(e);
      return { success: false, msg: '系统繁忙，请稍后重试' };
    }
  }

  // === 3. 保存诊断记录 ===
  if (event.type === 'saveDiagnosis') {
    try {
      return await db.collection('diagnosis_history').add({
        data: {
          _openid: openid,
          ...event.data,
          timestamp: new Date().getTime(),
          createTime: db.serverDate()
        }
      });
    } catch (e) {
      return { success: false, errMsg: e };
    }
  }

  // === 4. 获取历史列表 ===
  if (event.type === 'getHistoryList') {
    try {
      return await db.collection('diagnosis_history')
        .where({ _openid: openid })
        .orderBy('timestamp', 'desc')
        .limit(20)
        .get();
    } catch (e) {
      return { success: false, errMsg: e };
    }
  }

  // === 5. 获取详情 ===
  if (event.type === 'getDetail') {
    try {
      return await db.collection('diagnosis_history').doc(event.id).get();
    } catch (e) {
      return { success: false, errMsg: e };
    }
  }

  return { success: false, msg: 'Unknown type' };
};