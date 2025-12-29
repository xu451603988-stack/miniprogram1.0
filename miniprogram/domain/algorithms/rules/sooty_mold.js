/**
 * 煤污（Sooty mold / 黑层）
 * 典型特征：叶/果表面黑色霉层，常可擦掉；通常与蜜露害虫（蚜虫/粉虱/木虱/介壳虫等）相关。
 *
 * 规则目标：
 * - 用尽量少的问卷字段就能命中
 * - 命中后给出“先控虫→再清洗→再改善通风”的处置建议
 *
 * ctx = { crop, month, position, answers, meta }
 * 输出：{ code, score, evidence[], tags[], suggestions[], riskFlags[] }
 */

// 小工具：去重 push
function pushUnique(arr, item) {
  if (!item) return;
  if (!arr.includes(item)) arr.push(item);
}

// 从 answers 里兼容多种字段名（你旧版/新版本可能不同）
function readAny(answers, keys) {
  for (const k of keys) {
    if (answers && Object.prototype.hasOwnProperty.call(answers, k)) {
      return answers[k];
    }
  }
  return undefined;
}

module.exports = function ruleSootyMold(ctx) {
  const { answers = {}, position } = ctx;

  // --- 0) 仅叶类场景（你也可以去掉这个限制，让果实也能复用）
  if (position && position !== "leaf" && position !== "fruit") {
    // 如果你希望“煤污只在叶类模块判断”，就直接 return null
    return null;
  }

  // --- 1) 读取“煤污相关”字段（兼容多命名）
  // 最省力命中：只要用户勾了 leaf_sooty_mold 或 sooty_mold 或 “黑层能擦掉”
  const hasSooty = readAny(answers, [
    "leaf_sooty_mold",
    "sooty_mold",
    "leaf_black_layer",
    "black_layer"
  ]);

  // 可擦掉（煤污强特征）
  const canWipeOff = readAny(answers, [
    "sooty_can_wipe_off",
    "leaf_black_can_wipe_off",
    "black_layer_can_wipe_off"
  ]);

  // 蜜露害虫线索（可多选/字符串/布尔）
  const honeydewPests = readAny(answers, [
    "honeydew_pests",              // 建议：数组：["aphid","whitefly",...]
    "pest_honeydew",
    "leaf_pests"
  ]);

  // 叶背是否有虫/卵/介壳（布尔/枚举）
  const pestVisible = readAny(answers, [
    "pest_visible",
    "leaf_back_pests",
    "leaf_pest_visible"
  ]);

  // 是否伴随粘手蜜露/发亮（蜜露强证据）
  const stickyHoneydew = readAny(answers, [
    "leaf_sticky",
    "honeydew_sticky",
    "sticky_honeydew"
  ]);

  // 发生范围（均匀/局部）：局部更像某处虫源爆发
  const distribution = readAny(answers, [
    "distribution",
    "leaf_distribution",
    "disease_distribution"
  ]);

  // --- 2) 先判断是否“有理由启动此规则”
  // 允许 3 种进入方式：
  // A) 显式选择煤污
  // B) 黑层且可擦掉
  // C) 蜜露害虫证据足够强（虫多+叶面发黑）
  const shouldRun =
    Boolean(hasSooty) ||
    (canWipeOff === true) ||
    (stickyHoneydew === true);

  if (!shouldRun) return null;

  // --- 3) 开始打分/证据
  const evidence = [];
  const suggestions = [];
  const tags = [];
  const riskFlags = [];

  let score = 0;

  // 3.1 核心命中：煤污/黑层
  if (hasSooty) {
    score += 18;
    pushUnique(evidence, "叶/果表面出现黑色霉层（煤污/黑层）");
    pushUnique(tags, "sooty_mold");
  }

  // 3.2 可擦掉 → 煤污强特征
  if (canWipeOff === true) {
    score += 14;
    pushUnique(evidence, "黑层可擦掉（更符合煤污而非叶片坏死斑）");
    pushUnique(tags, "wipeable_black_layer");
  } else if (canWipeOff === false) {
    // 不可擦掉：煤污置信度下降
    score -= 6;
    pushUnique(evidence, "黑层不易擦掉（需警惕煤污以外的病斑/烟煤病混合）");
  }

  // 3.3 蜜露/虫害证据
  if (stickyHoneydew === true) {
    score += 12;
    pushUnique(evidence, "叶面/叶背有粘手蜜露或发亮（蜜露来源提示）");
    pushUnique(tags, "honeydew");
  }

  if (pestVisible === true) {
    score += 10;
    pushUnique(evidence, "叶背可见害虫/虫体/卵/介壳（虫害线索加强）");
    pushUnique(tags, "pest_visible");
  }

  // honeydewPests 支持数组或字符串
  const pestList = Array.isArray(honeydewPests)
    ? honeydewPests
    : (typeof honeydewPests === "string" ? [honeydewPests] : []);

  if (pestList.length > 0) {
    score += 10;
    pushUnique(evidence, `疑似蜜露害虫：${pestList.join("、")}`);
    pushUnique(tags, "honeydew_pests");
  }

  // 3.4 分布：局部爆发更像虫源
  if (distribution) {
    const d = String(distribution);
    if (d.includes("局部") || d === "local") {
      score += 4;
      pushUnique(evidence, "局部发生更明显（常见于虫源点扩散）");
    } else if (d.includes("均匀") || d === "uniform") {
      score += 1;
      pushUnique(evidence, "发生较均匀（可能虫害较普遍或管理原因）");
    }
  }

  // 3.5 最低分钳制
  if (score < 6) score = 6;

  // --- 4) 输出 code（你可以把它当作“病因/问题编码”）
  const code = "LEAF_SOOTY_MOLD";

  // --- 5) 建议（通用版，后续你可迁移到 plans 文件）
  pushUnique(suggestions, "优先处理源头：先控蜜露害虫（蚜虫、粉虱、木虱、介壳虫等），再谈清除煤污。");
  pushUnique(suggestions, "煤污本身多为表面霉层：虫控住后，可用清水/中性清洗方式辅助清洁，恢复光合。");
  pushUnique(suggestions, "加强通风透光：适度修剪、降低郁闭，减少蜜露与霉层滋生环境。");
  pushUnique(suggestions, "若黑层不易擦掉或伴随叶片组织坏死斑，应补拍近照并考虑合并病斑诊断。");

  // --- 6) 风险提示（可选）
  if (pestList.includes("介壳虫") || pestList.includes("scale")) {
    pushUnique(riskFlags, "scale_insect_risk");
  }
  if (pestList.includes("木虱") || pestList.includes("psyllid")) {
    pushUnique(riskFlags, "psyllid_risk");
  }

  // --- 7) 返回
  return {
    code,
    score,
    evidence,
    tags,
    suggestions,
    riskFlags
  };
};
