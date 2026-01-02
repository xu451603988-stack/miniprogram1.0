/**
 * questionBank.js
 * ✅ 修复：补齐 leaf_color / leaf_shape / start 三道基础题
 * 同时保留裂果追问题
 */

const QUESTION_BANK = {
  // ===== 基础问卷（必须有，否则 missingKeys 也问不了）=====
  leaf_color: {
    id: 'leaf_color',
    key: 'leaf_color',
    type: 'multi',
    title: '叶片颜色/表面更接近哪种情况？（可多选）',
    options: [
      { label: '叶脉绿、叶肉发黄', value: 'vein_green_leaf_yellow' },
      { label: '叶面有黑灰色霉层/煤烟状', value: 'sooty_layer' },
      { label: '伴随红蜘蛛/刺吸为害迹象（黄白斑、细网等）', value: 'red_spider_symptoms' },
      { label: '说不清/不确定', value: 'unknown' }
    ]
  },

  leaf_shape: {
    id: 'leaf_shape',
    key: 'leaf_shape',
    type: 'multi',
    title: '叶片形态更接近哪种情况？（可多选）',
    options: [
      { label: '叶片向背面卷曲（反卷）', value: 'leaf_curled_back' },
      { label: '叶片变小、畸形或皱缩', value: 'leaf_small_deformed' },
      { label: '叶片有斑点/斑块', value: 'leaf_spot_like' },
      { label: '说不清/不确定', value: 'unknown' }
    ]
  },

  start: {
    id: 'start',
    key: 'start',
    type: 'single',
    title: '症状更像从哪里开始出现？',
    options: [
      { label: '整树势弱/新梢偏弱', value: 'tree_weak' },
      { label: '局部枝条或局部区域', value: 'local_branch' },
      { label: '不确定', value: 'unknown' }
    ]
  },

  // ===== 裂果追问（你原本就有）=====
  FRUIT_CRACKING_WATER_SWING: {
    id: 'FRUIT_CRACKING_WATER_SWING',
    key: 'fruit_cracking_water_swing',
    type: 'single',
    title: '最近是否出现过“干旱后突然大雨或猛浇水”？',
    options: [
      { label: '是的，发生过', value: 'yes' },
      { label: '没有', value: 'no' },
      { label: '不确定', value: 'unknown' }
    ]
  },

  FRUIT_CRACKING_SHAPE: {
    id: 'FRUIT_CRACKING_SHAPE',
    key: 'fruit_cracking_shape',
    type: 'single',
    title: '果实裂口更接近哪种形态？',
    options: [
      { label: '果脐周围放射状开裂', value: 'navel' },
      { label: '纵向裂开（从上到下）', value: 'longitudinal' },
      { label: '环状裂口', value: 'ring' },
      { label: '说不清', value: 'unknown' }
    ]
  },

  FRUIT_CRACKING_RATIO: {
    id: 'FRUIT_CRACKING_RATIO',
    key: 'fruit_cracking_ratio',
    type: 'single',
    title: '大约有多少果实出现裂果？',
    options: [
      { label: '少量（<5%）', value: 'low' },
      { label: '比较明显（5–20%）', value: 'medium' },
      { label: '很多（>20%）', value: 'high' },
      { label: '不确定', value: 'unknown' }
    ]
  }
};

function getQuestion(questionId) {
  if (!questionId) return null;
  return QUESTION_BANK[questionId] || null;
}

function listAllQuestionIds() {
  return Object.keys(QUESTION_BANK);
}

module.exports = { getQuestion, listAllQuestionIds };
