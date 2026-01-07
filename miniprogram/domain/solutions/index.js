// miniprogram/domain/solutions/index.js
// --------------------------------------------------
// ✅ 方案A最终版（配置层成为“唯一真源”）
// - 所有处置步骤 steps 统一为 string[]
// - 每个 code 至少 3 条 steps
// - 提供 DEFAULT（>=3）作为兜底
// - assembly 只负责：读取 solutions[code].actions.steps，不足 3 用 DEFAULT 补齐
// --------------------------------------------------

function safeArray(v) {
  return Array.isArray(v) ? v : [];
}
function uniq(arr) {
  return Array.from(new Set(safeArray(arr).filter(Boolean)));
}
function toSteps3(steps, defSteps) {
  let out = safeArray(steps).map(s => String(s)).filter(Boolean);
  if (out.length < 3) out = out.concat(safeArray(defSteps));
  out = uniq(out);
  if (out.length < 3) {
    // 极端兜底（保证 >=3）
    out = uniq(out.concat([
      '补充关键照片/信息（叶背、病斑近景、整株远景、近期管理记录），以提高判断准确度。',
      '优先排查基础管理问题：水分波动、肥害/盐害、积水闷根、近期用药/用肥史。',
      '若症状快速扩展或影响产量，建议尽快线下复核（农技站/植保站）并带样确认。'
    ]));
  }
  return out.slice(0, 3);
}

// ------------------------------
// Citrus solutions library
// ------------------------------
const DEFAULT = {
  title: '通用处置建议',
  actions: {
    steps: [
      '补充关键照片/信息（叶背、病斑近景、整株远景、近期管理记录），以提高判断准确度。',
      '优先排查基础管理问题：水分波动、肥害/盐害、积水闷根、近期用药/用肥史。',
      '若症状快速扩展或影响产量，建议尽快线下复核（农技站/植保站）并带样确认。'
    ]
  }
};

// 你可以后续把这些 steps 逐步替换为更专业、更细的文案；但结构与条数门槛不要改。
const CITRUS_LIB = {
  DEFAULT,

  LEAF_SOOTY_MOLD: {
    title: '叶片煤污（黑灰霉层）',
    actions: {
      steps: [
        '先检查叶背、嫩梢和枝条分叉处是否有蚜虫/介壳虫/粉虱等刺吸害虫（是否有蜜露黏手/蜡粉）。',
        '改善通风透光，必要时清水轻冲/喷雾清洗叶面煤污层，降低遮光影响。',
        '若虫害明显，优先针对虫体防治并轮换用药机理，避免抗性。'
      ]
    }
  },

  LEAF_YELLOWING: {
    title: '叶片发黄（黄化）',
    actions: {
      steps: [
        '补拍叶片正反面近景、整株远景，确认黄化分布范围与是否伴随斑点/卷曲。',
        '排查水分波动、肥害/盐害与根系积水；必要时先控水、松土/排涝。',
        '结合叶龄与症状判断缺素/病害可能，优先做基础管理纠偏再考虑针对性处理。'
      ]
    }
  },

  LEAF_SPOTS: {
    title: '叶片斑点',
    actions: {
      steps: [
        '补拍病斑近景（含边缘/背面）与整株远景，观察是否有同心轮纹/水渍状/霉层。',
        '及时清理重病叶、改善通风透光，雨后注意排湿，减少叶面长时间潮湿。',
        '如扩展迅速或集中爆发，再按病害类型选择针对性防治并注意轮换。'
      ]
    }
  },

  FRUIT_CRACKING: {
    title: '裂果',
    actions: {
      steps: [
        '重点记录近 7 天浇水/降雨变化与土壤干湿波动，避免“忽干忽湿”。',
        '检查果实裂口形态与发生比例，区分生理裂果与病害/虫伤引发裂口。',
        '调整水肥与钙镁补充策略，必要时疏果与改善树体负载，减轻裂果风险。'
      ]
    }
  },

  FRUIT_SPOTS: {
    title: '果面斑点',
    actions: {
      steps: [
        '补拍果面斑点近景与整果远景，观察是否有软腐、凹陷、霉层或虫咬痕。',
        '改善通风透光与园区卫生，雨后及时排湿，减少病害扩散条件。',
        '若斑点快速扩展或伴随腐烂，建议尽快线下复核并做针对性处理。'
      ]
    }
  },

  BRANCH_GUMMING: {
    title: '枝条流胶',
    actions: {
      steps: [
        '检查流胶部位是否有伤口/虫孔/日灼，观察皮层是否变褐或开裂。',
        '先改善树势：控水防涝、合理修剪、避免过量氮肥与机械损伤。',
        '若流胶范围扩大或出现腐烂，建议尽快线下复核并进行针对性处理。'
      ]
    }
  }
};

// 尝试加载你项目里已有的 citrus/index.js（如果存在），并合并覆盖内置库（以你项目为准）
let citrus = null;
try {
  citrus = require('./citrus/index.js');
} catch (e) {
  citrus = null;
}

// 统一得到“最终库对象”：优先使用外部 citrus（若其导出为库对象），否则用内置库
const LIB = (citrus && typeof citrus === 'object' && !Array.isArray(citrus))
  ? Object.assign({}, CITRUS_LIB, citrus)
  : CITRUS_LIB;

// ✅ 强制把库里的 steps 都归一到 >=3（防止后续误改导致 steps=1/0 回归）
Object.keys(LIB).forEach((k) => {
  const v = LIB[k];
  if (!v || typeof v !== 'object') return;
  const actions = v.actions || {};
  const steps = actions.steps;
  v.actions = {
    steps: toSteps3(steps, DEFAULT.actions.steps)
  };
});

// --------------------------------------------------
// 对外导出：既支持 LIB[code] 直接取，也保留 getPlan 供其它调用方使用
// --------------------------------------------------
module.exports = Object.assign({}, LIB, {
  /**
   * 兼容接口：按 ctx 取方案（当前仅用 code）
   * @param {Object} ctx
   * @param {string} ctx.code
   */
  getPlan(ctx = {}) {
    const code = String(ctx.code || '').trim();
    if (!code) return null;
    return LIB[code] || LIB.DEFAULT || null;
  },

  /**
   * 可选：把 plan 转成页面直接渲染的数据结构
   * 目前 result 页直接渲染 pkg，不依赖此函数
   */
  toPlanView(plan) {
    if (!plan) return null;
    const title = plan.title || '处置方案';
    const steps = safeArray(plan.actions && plan.actions.steps);
    return { title, steps };
  }
});
