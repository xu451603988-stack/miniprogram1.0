// miniprogram/domain/assembly/index.js

const assembleDiagnosisPackage = require('./assembleDiagnosisPackage');

/**
 * assembly 出口
 *
 * 职责：
 * - 调用 assembleDiagnosisPackage
 * - 保证输出结构稳定（尤其是 nextSteps）
 */
function assemble(...args) {
  const pkg = assembleDiagnosisPackage(...args) || {};

  // ===== ★ 关键兜底：保证 nextSteps 结构稳定 =====
  if (!pkg.nextSteps) {
    pkg.nextSteps = {
      followupKeys: [],
    };
  } else {
    if (!Array.isArray(pkg.nextSteps.followupKeys)) {
      pkg.nextSteps.followupKeys = [];
    }
  }

  return pkg;
}

module.exports = {
  assemble,
};
