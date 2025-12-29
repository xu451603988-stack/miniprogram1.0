function isAnswered(answers, key) {
  return answers[key] !== undefined && answers[key] !== null;
}

// ✅ 问卷层强制追问（不依赖算法 needs）
// 规则：主诉命中某类问题 → 优先追问关键一题
function getForcedFollowup(answers = {}) {
  const symptoms = Array.isArray(answers.symptoms) ? answers.symptoms : [];

  const has = (v) => symptoms.indexOf(v) >= 0;

  // 1) 叶：煤污 → 必问害虫可见
  if (has('leaf_sooty') && !isAnswered(answers, 'insects_visible')) {
    return {
      key: 'insects_visible',
      questionId: 'Q_INSECTS_VISIBLE',
      priority: 100,
      fromRule: 'forced:leaf_sooty'
    };
  }

  // 2) 叶：斑点 → 必问斑点形态
  if (has('leaf_spots') && !isAnswered(answers, 'spots_shape')) {
    return {
      key: 'spots_shape',
      questionId: 'Q_SPOTS_SHAPE',
      priority: 95,
      fromRule: 'forced:leaf_spots'
    };
  }

  // 3) 叶：黄化 → 必问发生阶段
  if (has('leaf_yellowing') && !isAnswered(answers, 'yellow_stage')) {
    return {
      key: 'yellow_stage',
      questionId: 'Q_YELLOW_STAGE',
      priority: 90,
      fromRule: 'forced:leaf_yellowing'
    };
  }

  // 4) 果：果斑 → 必问果斑类型
  if (has('fruit_spots') && !isAnswered(answers, 'fruit_spots_type')) {
    return {
      key: 'fruit_spots_type',
      questionId: 'Q_FRUIT_SPOTS_TYPE',
      priority: 90,
      fromRule: 'forced:fruit_spots'
    };
  }

  // 5) 果：裂果 → 必问裂果形态
  if (has('fruit_cracking') && !isAnswered(answers, 'fruit_crack_pattern')) {
    return {
      key: 'fruit_crack_pattern',
      questionId: 'Q_FRUIT_CRACK_PATTERN',
      priority: 90,
      fromRule: 'forced:fruit_cracking'
    };
  }

  // 6) 枝：流胶 → 必问流胶颜色
  if (has('branch_gumming') && !isAnswered(answers, 'branch_gum_color')) {
    return {
      key: 'branch_gum_color',
      questionId: 'Q_BRANCH_GUM_COLOR',
      priority: 90,
      fromRule: 'forced:branch_gumming'
    };
  }

  // 7) 根：疑似烂根/积水 → 必问排水积水
  if ((has('root_vigor') || has('soil_waterlog_smell')) && !isAnswered(answers, 'soil_waterlog')) {
    return {
      key: 'soil_waterlog',
      questionId: 'Q_SOIL_WATERLOG',
      priority: 85,
      fromRule: 'forced:root'
    };
  }

  return null;
}

module.exports = function scheduler(answers = {}, ruleResults = []) {
  // ✅ 第一优先：问卷层强制追问
  const forced = getForcedFollowup(answers);
  if (forced) return forced;

  // ✅ 第二优先：算法规则 needs（如果规则里写了，也继续支持）
  const needs = [];

  (ruleResults || []).forEach(rule => {
    if (!rule || !Array.isArray(rule.needs)) return;

    rule.needs.forEach(n => {
      if (!n || !n.key || !n.questionId) return;
      needs.push({
        key: n.key,
        questionId: n.questionId,
        priority: Number(n.priority) || 0,
        fromRule: rule.code || 'unknown'
      });
    });
  });

  const pending = needs.filter(n => !isAnswered(answers, n.key));
  if (pending.length === 0) return null;

  pending.sort((a, b) => b.priority - a.priority);
  return pending[0];
};
