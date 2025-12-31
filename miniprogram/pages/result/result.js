// miniprogram/pages/result/result.js
const app = getApp();

const orchestrator = require('../../domain/orchestrator/diagnosisEngine.js');

const AssemblyMod = require('../../domain/assembly/index.js');
const assemble = (AssemblyMod && typeof AssemblyMod.assemble === 'function')
  ? AssemblyMod.assemble
  : AssemblyMod;

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

/** 你 result.wxml 用 vm.xxx，这里沿用你原来的 vm 结构（最简） */
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

Page({
  data: {
    pkg: null,
    vm: null
  },

  onLoad() {
    // ✅ 1) 闭环/回流：优先读已装配的包
    const cachedPkg =
      wx.getStorageSync('last_assembly_package') ||
      wx.getStorageSync('last_diagnosis_pkg');

    if (cachedPkg && cachedPkg.primarySection) {
      this.applyPackage(cachedPkg);
      return;
    }

    // ✅ 2) 没缓存就用 answers 现算
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
      report = orchestrator.run(answers);
    } catch (e) {
      wx.showToast({ title: '诊断失败', icon: 'none' });
      return;
    }

    const fullPkg = assemble(answers, report, {
      solutions,
      expertDictionary,
      treatmentPlans
    });

    const compact = makeCompactPkg(fullPkg);
    appendHistory(compact);

    wx.setStorageSync('last_assembly_package', compact);
    wx.setStorageSync('last_diagnosis_pkg', compact);

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
