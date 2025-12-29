function buildChiefComplaintQuestion(positions) {
  const pos = Array.isArray(positions) ? positions : [];
  const options = [];

  if (pos.includes('leaf')) {
    options.push(
      { label: '叶片有煤污/黏腻（像灰黑膜）', value: 'leaf_sooty' },
      { label: '叶片出现斑点/病斑', value: 'leaf_spots' },
      { label: '叶片黄化（发黄、花叶等）', value: 'leaf_yellowing' }
    );
  }

  if (pos.includes('fruit')) {
    options.push(
      { label: '果面斑点/黑点/锈斑', value: 'fruit_spots' },
      { label: '裂果/开裂', value: 'fruit_cracking' }
    );
  }

  if (pos.includes('branch')) {
    options.push(
      { label: '枝条流胶/渗胶', value: 'branch_gumming' },
      { label: '枝梢枯萎/回枯', value: 'branch_dieback' }
    );
  }

  if (pos.includes('root')) {
    options.push(
      { label: '疑似烂根/根腐（树势差、萎蔫等）', value: 'root_vigor' },
      { label: '土壤臭味/长期积水', value: 'soil_waterlog_smell' }
    );
  }

  options.push({ label: '说不清/不确定', value: 'unknown' });

  return {
    id: 'Q_CHIEF_COMPLAINT',
    key: 'symptoms',
    type: 'multi',
    title: '你主要想问的是哪类问题？（可选 1~2 项）',
    options,
    hint: '先选最明显的，系统会再追问关键细节'
  };
}

const bank = {
  // 叶-煤污
  Q_INSECTS_VISIBLE: {
    id: 'Q_INSECTS_VISIBLE',
    key: 'insects_visible',
    type: 'single',
    title: '叶背/嫩梢能看到蚜虫、粉虱、介壳虫等害虫吗？',
    options: [
      { label: '能看到', value: 'yes' },
      { label: '没看到', value: 'no' },
      { label: '不确定', value: 'unknown' }
    ],
    hint: '重点看叶背、嫩梢、蚂蚁活动路径'
  },

  // 叶-斑点
  Q_SPOTS_SHAPE: {
    id: 'Q_SPOTS_SHAPE',
    key: 'spots_shape',
    type: 'single',
    title: '叶片斑点形态更像哪种？',
    options: [
      { label: '小黑点密集（针尖样/麻点）', value: 'tiny_black_dense' },
      { label: '圆形褐斑（边界较清晰）', value: 'round_brown' },
      { label: '水渍状/油渍状（易扩展）', value: 'water_soaked' },
      { label: '结痂粗糙（疮痂样）', value: 'scab' },
      { label: '不确定', value: 'unknown' }
    ]
  },

  // 叶-黄化
  Q_YELLOW_STAGE: {
    id: 'Q_YELLOW_STAGE',
    key: 'yellow_stage',
    type: 'single',
    title: '黄化主要发生在？',
    options: [
      { label: '新叶（顶部嫩叶）', value: 'new_leaf' },
      { label: '老叶（下部老叶）', value: 'old_leaf' },
      { label: '整株都有', value: 'whole_tree' },
      { label: '不确定', value: 'unknown' }
    ]
  },

  // 根-排水
  Q_SOIL_WATERLOG: {
    id: 'Q_SOIL_WATERLOG',
    key: 'soil_waterlog',
    type: 'single',
    title: '近期是否有积水/排水差（雨后久不干）？',
    options: [
      { label: '是', value: 'yes' },
      { label: '否', value: 'no' },
      { label: '不确定', value: 'unknown' }
    ]
  },

  // ✅ 枝-流胶颜色（算法 needs 会用到）
  Q_BRANCH_GUM_COLOR: {
    id: 'Q_BRANCH_GUM_COLOR',
    key: 'branch_gum_color',
    type: 'single',
    title: '流胶颜色更像哪种？',
    options: [
      { label: '透明/淡黄色', value: 'clear_yellow' },
      { label: '褐色/深色', value: 'brown_dark' },
      { label: '夹杂木屑/虫粪（疑似虫孔）', value: 'with_sawdust' },
      { label: '不确定', value: 'unknown' }
    ],
    hint: '建议补拍：流胶点近照 + 周围树皮是否溃疡/虫孔'
  },

  // ✅ 果-果斑类型（算法 needs 会用到）
  Q_FRUIT_SPOTS_TYPE: {
    id: 'Q_FRUIT_SPOTS_TYPE',
    key: 'fruit_spots_type',
    type: 'single',
    title: '果面斑点更像哪种？',
    options: [
      { label: '表面锈斑/粗糙（像擦伤/锈皮）', value: 'rust_rough' },
      { label: '凹陷黑斑（像腐烂扩展）', value: 'sunken_black' },
      { label: '小黑点密集（芝麻点）', value: 'tiny_black_dense' },
      { label: '不确定', value: 'unknown' }
    ]
  },

  // ✅ 果-裂果形态（算法 needs 会用到）
  Q_FRUIT_CRACK_PATTERN: {
    id: 'Q_FRUIT_CRACK_PATTERN',
    key: 'fruit_crack_pattern',
    type: 'single',
    title: '裂果更像哪种形态？',
    options: [
      { label: '环裂（像一圈裂开）', value: 'ring' },
      { label: '纵裂（从蒂部到果底）', value: 'vertical' },
      { label: '网裂/多条细裂', value: 'net' },
      { label: '不确定', value: 'unknown' }
    ],
    hint: '裂果常与水分波动/钙镁不足有关'
  }
};

module.exports = {
  listAllQuestionIds() {
    return Object.keys(bank).concat(['Q_CHIEF_COMPLAINT']);
  },

  getQuestion(id, ctx) {
    if (id === 'Q_CHIEF_COMPLAINT') {
      const positions = (ctx && ctx.positions) ? ctx.positions : [];
      return buildChiefComplaintQuestion(positions);
    }
    return bank[id] || null;
  }
};
