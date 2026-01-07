// miniprogram/pages/result/result.js
// --------------------------------------------------
// ✅ 方案A最终版：Result 只读渲染（不再二次计算）
// - 只读取 wx.getStorageSync('latest_result_pkg')
// - 不 require orchestrator / assemble / solutions
// - vm.actionsSteps 统一为 string[]
// --------------------------------------------------

function toStepsStrings(steps) {
  const arr = Array.isArray(steps) ? steps : [];
  const out = [];
  arr.forEach((x) => {
    if (!x) return;
    if (typeof x === 'string') {
      const s = x.trim();
      if (s) out.push(s);
      return;
    }
    if (typeof x === 'object') {
      const title = (x.title || x.text || '').toString().trim();
      const detail = (x.detail || x.desc || '').toString().trim();
      if (title && detail) out.push(`${title}：${detail}`);
      else if (title) out.push(title);
    }
  });
  return out;
}

function buildVM(pkg) {
  const p = (pkg && pkg.primarySection) ? pkg.primarySection : {};
  const score = (typeof p.score === 'number') ? p.score : (pkg && pkg.meta ? pkg.meta.primaryScore : undefined);

  const confidenceText = (typeof score === 'number')
    ? (score >= 0.7 ? '判断比较明确' : score >= 0.4 ? '有一定可能' : '还需要进一步确认')
    : '还需要进一步确认';

  const actionsSteps = toStepsStrings(p && p.actions ? p.actions.steps : []);

  return {
    aTitle: (p.displayName || p.title || p.code || '问题待进一步确认'),
    confidenceText,
    actionsSteps,
    whyList: [],
    possibleCauses: [],
    altList: [],
    followups: (pkg && pkg.nextSteps && Array.isArray(pkg.nextSteps.suggestedFollowups)) ? pkg.nextSteps.suggestedFollowups : []
  };
}

Page({
  data: {
    pkg: null,
    vm: null,
    errMsg: ''
  },

  onLoad() {
    try {
      const pkg = wx.getStorageSync('latest_result_pkg');
      if (!pkg) {
        console.warn('[result] no pkg in storage: latest_result_pkg');
        this.setData({ errMsg: '没有读取到诊断结果，请返回重新诊断。' });
        return;
      }

      const vm = buildVM(pkg);

      console.log('[result] pkg loaded ok');
      console.log('[result] primaryCode=', pkg?.primarySection?.code, 'confidence=', pkg?.primarySection?.confidenceLevel, 'stepsCount=', vm.actionsSteps.length);

      this.setData({ pkg, vm, errMsg: '' });
    } catch (e) {
      console.error('[result] onLoad error', e);
      this.setData({ errMsg: '结果页渲染失败，请查看控制台报错。' });
    }
  },

  goHistory() {
    wx.navigateTo({ url: '/pages/history/history' });
  },

  goExpert() {
    wx.navigateTo({ url: '/pages/expert/expert' });
  }
});
