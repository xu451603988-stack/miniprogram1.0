// miniprogram/pages/result/result.js
const app = getApp();

const orchestrator = require('../../domain/orchestrator/diagnosisEngine.js');

const AssemblyMod = require('../../domain/assembly/index.js');
const assembleFn = (AssemblyMod && typeof AssemblyMod.assemble === 'function')
  ? AssemblyMod.assemble
  : (typeof AssemblyMod === 'function' ? AssemblyMod : null);

const solutions = require('../../domain/solutions/index.js');
const expertDictionary = require('../../domain/dictionary/expertDictionary.js');
const treatmentPlans = require('../../domain/dictionary/treatmentPlans.js');

function nowISO() {
  try { return new Date().toISOString(); } catch (e) { return String(Date.now()); }
}

function appendHistory(compactPkg) {
  try {
    const key = 'diagnosis_history';
    const arr = wx.getStorageSync(key) || [];
    const next = Array.isArray(arr) ? arr.slice() : [];
    next.unshift({
      traceId: compactPkg?.meta?.generatedAt || nowISO(),
      date: compactPkg?.meta?.generatedAt || nowISO(),
      summary: compactPkg?.summary?.headline || '诊断结果',
      pkg: compactPkg
    });
    wx.setStorageSync(key, next.slice(0, 50));
  } catch (e) {}
}

function makeCompactPkg(fullPkg) {
  if (!fullPkg) return null;
  return {
    meta: fullPkg.meta,
    summary: fullPkg.summary,
    primarySection: fullPkg.primarySection,
    riskSection: fullPkg.riskSection,
    alternativesSection: fullPkg.alternativesSection,
    nextSteps: fullPkg.nextSteps
  };
}

/** 你 result.wxml 用 vm.xxx，这里沿用你原来的 vm 结构（尽量不改 wxml） */
function buildVM(pkg) {
  const p = pkg?.primarySection || {};
  const score = p.score ?? pkg?.meta?.primaryScore;

  const confidenceText = (typeof score === 'number')
    ? (score >= 0.7 ? '判断比较明确' : score >= 0.4 ? '有一定可能' : '还需要进一步确认')
    : '还需要进一步确认';

  return {
    aTitle: (p.displayName || p.title || p.code || '问题待进一步确认'),
    confidenceText,
    actionsSteps: p?.actions?.steps || [],
    whyList: [],
    possibleCauses: [],
    altList: [],
    followups: Array.isArray(pkg?.nextSteps?.suggestedFollowups) ? pkg.nextSteps.suggestedFollowups : []
  };
}

/**
 * 兼容不同 assemble 签名（你项目里 assembly 可能经历过多次调整）
 * 依次尝试：
 *  1) assemble(report, answers, deps)
 *  2) assemble(answers, report, deps)
 *  3) assemble(report, answers)
 *  4) assemble(answers, report)
 */
function safeAssemble(answers, report) {
  if (!assembleFn) return null;

  const deps = { solutions, expertDictionary, treatmentPlans };

  // 1) (report, answers, deps)
  try { return assembleFn(report, answers, deps); } catch (e) {}

  // 2) (answers, report, deps)
  try { return assembleFn(answers, report, deps); } catch (e) {}

  // 3) (report, answers)
  try { return assembleFn(report, answers); } catch (e) {}

  // 4) (answers, report)
  try { return assembleFn(answers, report); } catch (e) {}

  return null;
}

/**
 * 兼容 orchestrator.run 的不同签名：
 * - 新：run({ answers })
 * - 旧：run(answers)
 */
function safeRunOrchestrator(answers) {
  try {
    // 优先新签名
    return orchestrator.run({ answers });
  } catch (e1) {
    try {
      // 兼容旧签名
      return orchestrator.run(answers);
    } catch (e2) {
      throw e2;
    }
  }
}

Page({
  data: {
    pkg: null,
    vm: null
  },

  onLoad() {
    /**
     * ✅ 1) 问答页闭环回流：优先读已装配的包（与你刚修的 question.js 对齐）
     * question.js 写入：wx.setStorageSync('latest_result_pkg', pkg)
     */
    const cachedPkg =
      wx.getStorageSync('latest_result_pkg') ||
      wx.getStorageSync('last_assembly_package') ||
      wx.getStorageSync('last_diagnosis_pkg');

    if (cachedPkg && cachedPkg.primarySection) {
      this.applyPackage(cachedPkg);
      return;
    }

    /**
     * ✅ 2) 没缓存就用 answers 现算（保持你原来的多 key 兜底）
     */
    const answers =
      app.globalData.diagnosisAnswers ||
      wx.getStorageSync('last_diagnosis_answers') ||
      wx.getStorageSync('answers') ||
      {};

    if (!answers || Object.keys(answers).length === 0) {
      wx.showToast({ title: '缺少问卷答案', icon: 'none' });
      return;
    }

    let report;
    try {
      report = safeRunOrchestrator(answers);
    } catch (e) {
      console.error('[result] orchestrator.run failed:', e);
      wx.showToast({ title: '诊断失败', icon: 'none' });
      return;
    }

    const fullPkg = safeAssemble(answers, report);
    if (!fullPkg) {
      console.error('[result] assemble failed: returned null');
      wx.showToast({ title: '结果组装失败', icon: 'none' });
      return;
    }

    const compact = makeCompactPkg(fullPkg);
    appendHistory(compact);

    // ✅ 写入兼容缓存（保留旧 key）
    wx.setStorageSync('last_assembly_package', compact);
    wx.setStorageSync('last_diagnosis_pkg', compact);

    // ✅ 写入与 question.js 对齐的 key，保证后续直接回显
    wx.setStorageSync('latest_result_pkg', compact);

    // followupKeys 回流，便于继续追问
    if (compact?.nextSteps && Array.isArray(compact.nextSteps.followupKeys)) {
      wx.setStorageSync('last_followup_keys', compact.nextSteps.followupKeys);
    }

    this.applyPackage(compact);
  },

  applyPackage(pkg) {
    this.setData({
      pkg,
      vm: buildVM(pkg)
    });
  },

  goHistory() {
    wx.navigateTo({ url: '/pages/history/history' });
  },

  goExpert() {
    wx.navigateTo({ url: '/pages/expert/expert' });
  }
});
