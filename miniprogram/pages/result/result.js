// miniprogram/pages/result/result.js
// --------------------------------------------------
// Assembly 直出结构渲染版（支持从 history_selected_pkg 进入）
// - 关键：所有 require 都显式指向 .js / index.js，避免被解析成 xxx.js 不存在
// --------------------------------------------------

const app = getApp();

// ✅ 显式 .js
const orchestrator = require('../../domain/orchestrator/diagnosisEngine.js');

// ✅ 显式 index.js（避免被解析成 assembly.js）
const AssemblyMod = require('../../domain/assembly/index.js');
// 兼容：assembly 可能导出 {assemble} 或直接导出函数
const assemble = (AssemblyMod && typeof AssemblyMod.assemble === 'function')
  ? AssemblyMod.assemble
  : AssemblyMod;

// ✅ 显式 index.js（你现在报错就是这里）
const solutions = require('../../domain/solutions/index.js');

// ✅ 显式 .js
const expertDictionary = require('../../domain/dictionary/expertDictionary.js');
const treatmentPlans = require('../../domain/dictionary/treatmentPlans.js');

function nowISO() {
  try { return new Date().toISOString(); } catch (e) { return String(Date.now()); }
}

function safeParseJSON(str) {
  try { return JSON.parse(str); } catch (e) { return null; }
}

function appendHistory(compactPkg) {
  try {
    const key = 'diagnosis_history';
    const arr = wx.getStorageSync(key) || [];
    const next = Array.isArray(arr) ? arr.slice() : [];

    const item = {
      traceId: compactPkg?.meta?.generatedAt || nowISO(),
      date: compactPkg?.meta?.generatedAt || nowISO(),
      summary: compactPkg?.summary?.headline || '诊断结果',
      pkg: compactPkg
    };

    next.unshift(item);
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

function reorderCandidatesToTop(report, pickedCode) {
  if (!report || !pickedCode) return report;

  const next = Object.assign({}, report);
  const cands = Array.isArray(next.candidates) ? next.candidates.slice() : [];
  const idx = cands.findIndex(x => x && x.code === pickedCode);
  if (idx <= 0) {
    next.code = pickedCode;
    return next;
  }

  const picked = cands.splice(idx, 1)[0];
  cands.unshift(picked);

  next.code = pickedCode;
  next.candidates = cands;
  return next;
}

Page({
  data: {
    pkg: null,

    meta: null,
    summary: null,
    primarySection: null,
    riskSection: null,
    alternativesSection: null,
    nextSteps: null,

    showRisk: false,
    showAlts: false,
    showFollowups: false,

    answers: {},
    lastReport: null
  },

  onLoad(options) {
    // ✅ 1) history 新入口：从 storage 读选中 pkg（不拼 query）
    if (options?.from === 'history') {
      const stored = wx.getStorageSync('history_selected_pkg');
      if (stored && stored.primarySection) {
        try { wx.removeStorageSync('history_selected_pkg'); } catch (e) {}
        this.applyPackage(stored);
        return;
      }
    }

    // 兼容旧：如果 options.pkg（之前可能用过）
    if (options?.pkg) {
      const parsed = safeParseJSON(decodeURIComponent(options.pkg));
      if (parsed) {
        this.applyPackage(parsed);
        return;
      }
    }

    // 兼容旧：?result=
    if (options?.result) {
      const parsed = safeParseJSON(decodeURIComponent(options.result));
      const pkg = parsed?.primarySection ? parsed : (parsed?.pkg?.primarySection ? parsed.pkg : null);
      if (pkg) {
        this.applyPackage(pkg);
        return;
      }
    }

    // ✅ 2) 主链路：answers -> orchestrator -> assembly
    const answers =
      app.globalData.diagnosisAnswers ||
      wx.getStorageSync('last_diagnosis_answers') ||
      {};

    if (!answers || Object.keys(answers).length === 0) {
      wx.showToast({ title: '未找到问卷答案', icon: 'none' });
      return;
    }

    let report;
    try {
      report = orchestrator.run(answers);
    } catch (e) {
      wx.showToast({ title: '诊断失败（引擎异常）', icon: 'none' });
      report = { code: '', candidates: [], riskTags: [], evidence: [], meta: { error: String(e?.message || e) } };
    }

    try {
      wx.setStorageSync('last_raw_diagnosis_report', report);
      wx.setStorageSync('last_diagnosis_answers', answers);
    } catch (e) {}

    // ✅ 用 assemble 函数（兼容两种导出）
    const fullPkg = assemble(answers, report, {
      solutions,
      expertDictionary,
      treatmentPlans
    });

    const compact = makeCompactPkg(fullPkg);

    appendHistory(compact);
    try { wx.setStorageSync('last_assembly_package', compact); } catch (e) {}

    this.setData({ answers, lastReport: report });
    this.applyPackage(compact);
  },

  applyPackage(pkg) {
    if (!pkg) return;

    const riskDefaultCollapsed = !!pkg?.riskSection?.defaultCollapsed;
    const altDefaultCollapsed = !!pkg?.alternativesSection?.defaultCollapsed;

    this.setData({
      pkg,

      meta: pkg.meta || null,
      summary: pkg.summary || null,
      primarySection: pkg.primarySection || null,
      riskSection: pkg.riskSection || null,
      alternativesSection: pkg.alternativesSection || null,
      nextSteps: pkg.nextSteps || null,

      showRisk: !riskDefaultCollapsed,
      showAlts: !altDefaultCollapsed,
      showFollowups: false
    });
  },

  toggleRisk() {
    this.setData({ showRisk: !this.data.showRisk });
  },

  toggleAlts() {
    this.setData({ showAlts: !this.data.showAlts });
  },

  toggleFollowups() {
    this.setData({ showFollowups: !this.data.showFollowups });
  },

  onPickAlternative(e) {
    const code = e?.currentTarget?.dataset?.code;
    if (!code) return;

    const answers = this.data.answers || wx.getStorageSync('last_diagnosis_answers') || {};
    const lastReport = this.data.lastReport || wx.getStorageSync('last_raw_diagnosis_report');

    if (!lastReport) {
      wx.showToast({ title: '缺少原始诊断结果，无法切换', icon: 'none' });
      return;
    }

    const nextReport = reorderCandidatesToTop(lastReport, code);

    const fullPkg = assemble(answers, nextReport, {
      solutions,
      expertDictionary,
      treatmentPlans
    });

    const compact = makeCompactPkg(fullPkg);

    // 切换只是查看，不写历史
    this.setData({ lastReport: nextReport });
    this.applyPackage(compact);
  },

  goHistory() {
    wx.navigateTo({ url: '/pages/history/history' });
  },

  goExpert() {
    wx.navigateTo({ url: '/pages/expert/expert' });
  }
});
