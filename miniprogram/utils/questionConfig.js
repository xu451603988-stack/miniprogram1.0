/**
 * questionConfig.js
 * --------------------------------------------------
 * 问卷 → 算法 关键字段配置
 *
 * 规则：
 * - key 必须稳定（算法/YAML/历史都依赖）
 * - value 建议使用枚举字符串
 */

module.exports = {

  // ===== 通用 =====
  crop: {
    desc: '作物类型',
    values: ['citrus'],
    required: true
  },

  month: {
    desc: '发生月份',
    values: [1,2,3,4,5,6,7,8,9,10,11,12],
    required: true
  },

  positions: {
    desc: '发生部位',
    values: ['leaf', 'fruit', 'branch', 'root'],
    multiple: true,
    required: true
  },

  season: {
    desc: '季节',
    values: ['spring', 'summer', 'autumn', 'winter']
  },

  humidity: {
    desc: '环境湿度',
    values: ['low', 'normal', 'high']
  },

  // ===== 害虫 / 表面 =====
  insects_visible: {
    desc: '是否可见害虫',
    values: ['yes', 'no'],
    required: true
  },

  leaf_surface: {
    desc: '叶面状态',
    values: ['normal', 'sticky_black']
  },

  // ===== 叶片症状 =====
  leaf_spots_type: {
    desc: '叶斑类型',
    values: ['none', 'ring_spot', 'brown_spot', 'water_soaked']
  },

  leaf_edge: {
    desc: '叶缘状态',
    values: ['normal', 'necrotic']
  },

  yellow_stage: {
    desc: '黄化阶段',
    values: ['none', 'new_leaf', 'old_leaf', 'whole']
  },

  vein_color: {
    desc: '叶脉颜色',
    values: ['normal', 'green', 'yellow']
  },

  // ===== 果实 =====
  fruit_crack_pattern: {
    desc: '裂果形态',
    values: ['none', 'radial', 'ring']
  },

  fruit_rot: {
    desc: '是否有腐烂',
    values: ['yes', 'no']
  },

  // ===== 枝干 =====
  branch_gum_color: {
    desc: '流胶颜色',
    values: ['none', 'amber', 'dark']
  },

  wound_present: {
    desc: '是否有机械伤口',
    values: ['yes', 'no']
  },

  // ===== 根系 / 土壤 =====
  soil_waterlog: {
    desc: '是否积水',
    values: ['yes', 'no'],
    required: true
  },

  soil_fertility: {
    desc: '土壤肥力',
    values: ['low', 'normal', 'high']
  },

  root_smell: {
    desc: '根部气味',
    values: ['normal', 'bad']
  },

  drought: {
    desc: '是否干旱',
    values: ['yes', 'no']
  },

  irrigation_change: {
    desc: '灌溉变化',
    values: ['stable', 'sudden']
  }
};
