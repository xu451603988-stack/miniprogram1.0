/**
 * evidenceBuilder.js
 * --------------------------------------------------
 * 证据构造器（A 主）
 */

function base(code, score) {
  return {
    type: 'base',
    code,
    impact: score,
    text: '基础分',
  };
}

function strong(code, rule, value) {
  return {
    type: 'strong',
    code,
    key: rule.key,
    value,
    impact: rule.score,
    text: '强信号命中',
  };
}

function weak(code, rule, value) {
  return {
    type: 'weak',
    code,
    key: rule.key,
    value,
    impact: rule.score,
    text: '弱信号命中',
  };
}

function penalty(code, rule, value) {
  return {
    type: 'penalty',
    code,
    key: rule.key,
    value,
    impact: -rule.score,
    text: '惩罚项命中',
  };
}

function cap(code, capScore, missingKeys) {
  return {
    type: 'cap',
    code,
    impact: capScore,
    missingKeys,
    text: '关键信息不足，触发封顶',
  };
}

module.exports = {
  base,
  strong,
  weak,
  penalty,
  cap,
};
