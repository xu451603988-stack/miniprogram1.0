/**
 * miniprogram/domain/diagnosisEngine.js
 *
 * ✅ 兼容层：把历史上的 run(answers) / run({answers}) 统一转发到 orchestrator 引擎
 * 目的：
 * - 避免旧实现把 citrusAlgo 当函数调用导致 TypeError（旧实现见 :contentReference[oaicite:1]{index=1}）
 * - 让全链路输出结构统一（question/result 都走 orchestrator）
 *
 * 注意：
 * - 新工程建议直接在页面层 require('../../domain/orchestrator/diagnosisEngine')
 * - 这里保留是为了兼容历史引用，避免“删了就炸”
 */

const orchestrator = require('./orchestrator/diagnosisEngine');

/** 兼容：把 run(answers) / run({answers}) 都规范成 { answers } */
function normalizePayload(input) {
  // run({ answers })
  if (input && typeof input === 'object' && !Array.isArray(input) && input.answers) {
    return input;
  }

  // run(answers) 其中 answers 常常是对象
  if (input && typeof input === 'object') {
    return { answers: input };
  }

  // 兜底
  return { answers: {} };
}

module.exports = {
  /**
   * 兼容旧签名：run(answers) / run({answers, crop, ...})
   * 返回：orchestrator.run 的 report（由 assembly 再转 UI 包）
   */
  run(input = {}) {
    const payload = normalizePayload(input);

    // 优先使用新签名 orchestrator.run({answers,...})
    try {
      return orchestrator.run(payload);
    } catch (e1) {
      // 兼容极少数旧 orchestrator：run(answers)
      try {
        return orchestrator.run(payload.answers);
      } catch (e2) {
        // 保留更可读的报错信息
        const err = new Error(
          `[diagnosisEngine] orchestrator.run failed: ${e2 && e2.message ? e2.message : String(e2)}`
        );
        err.cause = e2;
        throw err;
      }
    }
  }
};
