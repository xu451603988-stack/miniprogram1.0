// miniprogram/domain/algorithms/citrus/leaf/index.js
var engine = require('../../engine/runRules');

// 叶类规则（以后你新增规则文件，只要在这里多加一行 require 即可）
var sootyMold = require('./rules/sooty_mold');
var yellowing = require('./rules/yellowing');
var spots = require('./rules/spots');

module.exports = function runLeaf(ctx) {
  return engine.runRules(ctx, [sootyMold, yellowing, spots]);
};
