// miniprogram/pages/welcome/welcome.js
Page({
  data: {
    title: '作物健康诊断小助手',
    subtitle: '专业诊断作物病害，提供精准解决方案'
  },

  // 1. 【修复】将函数名改为 goStart，与 WXML 对应
  goStart() {
    console.log('[跳转] 前往作物选择页');
    
    wx.navigateTo({
      // 确保这个路径在 app.json 的 pages 列表里
      url: '/pages/cropSelect/cropSelect', 
      // 注意：如果您之前的路径是 /pages/diagnosis/cropSelect/cropSelect，请改回原样
      // 根据您之前的代码，似乎路径改到了 /pages/cropSelect/cropSelect 
      // 如果报错“页面不存在”，请尝试换回：'/pages/diagnosis/cropSelect/cropSelect'
      
      success: () => {
        console.log('[跳转成功] 作物选择页');
      },
      fail: (err) => {
        // 如果失败，尝试备用路径（兼容您的旧目录结构）
        console.warn('[首选路径失败] 尝试备用路径...', err);
        wx.navigateTo({
          url: '/pages/diagnosis/cropSelect/cropSelect'
        });
      }
    });
  },

  // 2. 【新增】补全 goHistory 方法，防止点"诊断记录"报错
  goHistory() {
    console.log('[跳转] 前往历史记录页');
    // 尝试跳转到历史页，如果失败则跳转到个人中心（通常历史记录也在个人中心）
    wx.navigateTo({
      url: '/pages/diagnosis/history/history',
      fail: (err) => {
        console.log('无独立历史页，跳转至个人中心');
        wx.switchTab({ url: '/pages/user/user' });
      }
    });
  },

  // 3. 【新增】分享配置
  onShareAppMessage() {
    return {
      title: '作物健康智能诊断助手',
      path: '/pages/welcome/welcome'
    };
  }
});