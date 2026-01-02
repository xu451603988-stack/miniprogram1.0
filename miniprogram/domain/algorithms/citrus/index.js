/**
 * miniprogram/domain/algorithms/citrus/index.js
 * ✅ 可直接替换版
 *
 * 关键修复：不要把 require() 包在函数里（动态 require 会导致小程序打包器漏收子模块，
 * 运行时报：module '.../leaf/index.js' is not defined）。
 */

function normalizeAnswers(answers = {}) {
  const crop = answers.crop || answers.cropKey || answers.crop_code || answers.cropCode;
  const month = answers.month || answers.monthNum || answers.month_no || answers.monthNo;

  const positionsRaw = answers.positions || answers.position || answers.parts || answers.part;
  const positions = Array.isArray(positionsRaw) ? positionsRaw : (positionsRaw ? [positionsRaw] : []);

  return { ...answers, crop, month, positions };
}

// --- 静态 require：必须保持字面量字符串 ---
let leaf = null;
let fruit = null;
let branch = null;
let root = null;

try { leaf = require('./leaf/index.js'); } catch (e) { console.warn('[citrus/index] require failed: ./leaf/index.js', e); }
try { fruit = require('./fruit/index.js'); } catch (e) { console.warn('[citrus/index] require failed: ./fruit/index.js', e); }
try { branch = require('./branch/index.js'); } catch (e) { console.warn('[citrus/index] require failed: ./branch/index.js', e); }
try { root = require('./root/index.js'); } catch (e) { console.warn('[citrus/index] require failed: ./root/index.js', e); }

function runModule(mod, ctx) {
  if (!mod) return null;
  try {
    if (typeof mod === 'function') return mod(ctx);
    if (typeof mod.run === 'function') return mod.run(ctx);
    if (typeof mod.diagnose === 'function') return mod.diagnose(ctx);
    return null;
  } catch (e) {
    console.warn('[citrus/index] run module failed:', e);
    return null;
  }
}

/**
 * 统一入口：返回单一部位时返回该部位结果；多部位时返回 {positions:[...]}
 */
function diagnose(answers = {}, ctx = {}) {
  const a = normalizeAnswers(answers);
  const posArr = Array.isArray(a.positions) ? a.positions : [];
  const positions = posArr.length ? posArr : ['leaf']; // 默认 leaf

  const out = [];
  positions.forEach((pos) => {
    const moduleCtx = { ...ctx, answers: a, position: pos };
    let res = null;

    if (pos === 'leaf') res = runModule(leaf, moduleCtx);
    else if (pos === 'fruit') res = runModule(fruit, moduleCtx);
    else if (pos === 'branch') res = runModule(branch, moduleCtx);
    else if (pos === 'root') res = runModule(root, moduleCtx);
    else res = runModule(leaf, moduleCtx);

    if (res) out.push({ position: pos, ...res });
  });

  if (out.length === 1) return out[0];
  return { positions: out };
}

module.exports = { diagnose };
