// miniprogram/domain/solutions/index.js
// --------------------------------------------------
// 第5层：方案库统一出口（Solutions Layer Entry）
// 关键：require 显式到 index.js，避免被解析成 citrus.js
// --------------------------------------------------

const citrus = require('./citrus/index.js');

function normCrop(crop) {
  return (crop || 'citrus').toLowerCase();
}

module.exports = {
  /**
   * @param {Object} ctx
   * @param {string} ctx.crop
   * @param {string} ctx.code
   * @param {number=} ctx.month
   * @param {string=} ctx.severity
   */
  getPlan(ctx = {}) {
    const crop = normCrop(ctx.crop);
    if (!ctx.code) return null;

    if (crop === 'citrus') return citrus.getPlan(ctx);

    // 未来扩作物：在这里加分支
    return null;
  },

  /**
   * 把 planObject 转成页面可直接渲染的 planView
   * @param {Object} plan
   */
  toPlanView(plan) {
    if (!plan) return null;

    const title = plan.title || plan.name || '处置方案';

    const summaryArr = Array.isArray(plan.summary)
      ? plan.summary
      : (plan.summary ? [String(plan.summary)] : []);
    const summary = summaryArr.join('；');

    const stepsRaw = Array.isArray(plan.steps) ? plan.steps : [];
    const steps = stepsRaw
      .map(s => {
        if (!s) return '';
        if (typeof s === 'string') return s;
        const name = s.name || s.title || s.id || '步骤';
        const desc = s.desc || s.description || '';
        return desc ? `${name}：${desc}` : String(name);
      })
      .filter(Boolean);

    const notes = [];
    if (Array.isArray(plan.notes)) plan.notes.forEach(n => n && notes.push(String(n)));
    stepsRaw.forEach(s => {
      if (s && Array.isArray(s.notes)) s.notes.forEach(n => n && notes.push(String(n)));
    });

    const dos = Array.isArray(plan.dos) ? plan.dos : [];
    const donts = Array.isArray(plan.donts) ? plan.donts : [];
    const whenToEscalate = Array.isArray(plan.whenToEscalate) ? plan.whenToEscalate : [];

    return {
      title,
      summary,
      steps,
      notes,
      dos,
      donts,
      whenToEscalate
    };
  }
};
