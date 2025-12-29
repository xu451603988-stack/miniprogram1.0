// miniprogram/pages/history/history.js
// --------------------------------------------------
// 历史页：直接渲染 item.pkg（Assembly compact package）
// 点击条目：把 pkg 放进 storage，再跳转 result 页（不拼 query string）

function formatTime(isoOrTs) {
  try {
    const d = new Date(isoOrTs);
    const yy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${yy}-${mm}-${dd} ${hh}:${mi}`;
  } catch (e) {
    return String(isoOrTs || '');
  }
}

function loadHistory() {
  const key = 'diagnosis_history';
  const arr = wx.getStorageSync(key) || [];
  const list = Array.isArray(arr) ? arr : [];

  // 兼容：旧数据可能是 {summary, primary, ...} 或 {pkg: {...}}
  return list.map((it, idx) => {
    const pkg = it?.pkg?.primarySection ? it.pkg : (it?.primarySection ? it : null);
    const summary = it?.summary || pkg?.summary?.headline || '诊断结果';
    const date = it?.date || pkg?.meta?.generatedAt || it?.traceId || '';
    const flags = pkg?.meta?.qualityFlags || [];
    const conf = pkg?.meta?.confidenceLevel || '-';

    return {
      _idx: idx,
      traceId: it?.traceId || pkg?.meta?.generatedAt || String(idx),
      dateText: formatTime(date),
      summary,
      confidenceLevel: conf,
      qualityFlags: Array.isArray(flags) ? flags : [],
      pkg: pkg || it?.pkg || null
    };
  });
}

Page({
  data: {
    list: [],
    empty: true
  },

  onShow() {
    const list = loadHistory();
    this.setData({
      list,
      empty: !list.length
    });
  },

  onTapItem(e) {
    const idx = Number(e?.currentTarget?.dataset?.idx);
    const item = (this.data.list || [])[idx];
    if (!item || !item.pkg) return;

    // ✅ 核心：不拼 query，把包放 storage
    try {
      wx.setStorageSync('history_selected_pkg', item.pkg);
    } catch (e) {
      wx.showToast({ title: '存储失败，无法打开', icon: 'none' });
      return;
    }

    wx.navigateTo({ url: '/pages/result/result?from=history' });
  },

  onClearAll() {
    wx.showModal({
      title: '清空历史记录？',
      content: '清空后无法恢复。',
      success: (res) => {
        if (!res.confirm) return;
        try {
          wx.setStorageSync('diagnosis_history', []);
          this.setData({ list: [], empty: true });
        } catch (e) {
          wx.showToast({ title: '清空失败', icon: 'none' });
        }
      }
    });
  },

  onDeleteOne(e) {
    const idx = Number(e?.currentTarget?.dataset?.idx);
    const list = (wx.getStorageSync('diagnosis_history') || []);
    const arr = Array.isArray(list) ? list.slice() : [];
    if (idx < 0 || idx >= arr.length) return;

    arr.splice(idx, 1);
    wx.setStorageSync('diagnosis_history', arr);

    const next = loadHistory();
    this.setData({ list: next, empty: !next.length });
  }
});
