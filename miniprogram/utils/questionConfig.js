// utils/questionConfig.js

// 问题选项配置
const QUESTION_CONFIG = {
  optionLabels: {
    leaf_symptom: {
      'lower_yellow': '下位叶黄', 'upper_yellow': '上位叶黄/畸形', 'edge_burn': '叶缘焦枯', 'whole_yellow': '全株发黄',
      'spot_water': '水渍斑', 'one_side': '同侧受害', 'variegation': '花叶/斑驳', 'leaf_curl_up': '上卷',
      'leaf_curl_down': '下卷', 'leaf_thin': '叶薄发亮'
    },
    shoot_status: {
      'shoot_weak': '梢短弱', 'shoot_exuberant': '梢旺长', 'shoot_wood': '早木质化', 'shoot_stop': '停长', 'shoot_black': '梢黑腐'
    },
    fruit_symptom: {
      'fruit_oily': '果面油胞', 'fruit_nocolor': '不上色', 'fruit_small': '果小', 'fruit_sunburn': '日灼斑',
      'fruit_abscission': '梗部脱落', 'fruit_internal_crack': '内裂'
    },
    soil_smell: {
      'soil_fresh': '清香（正常）', 'soil_acid': '酸腐味', 'soil_sulfur': '臭鸡蛋味', 'soil_ammonia': '氨味',
      'soil_ferment': '发酵酒味', 'soil_no_smell': '无味潮湿'
    },
    root_smell: {
      'root_fresh': '泥土香', 'root_slight_acid': '微酸', 'root_rotten': '腐臭', 'root_sharp': '刺鼻', 'root_mildew': '霉味'
    },
    recent_event: {
      'ev_rain': '连续降雨', 'ev_hot': '高温强光', 'ev_heavy_n': '大量追施氮肥', 'ev_mixed_pesticide': '农药混配',
      'ev_greenhouse': '大棚高湿', 'ev_recent_spray': '最近喷药', 'ev_freq_irrig': '频繁灌溉'
    },
    onset_speed: {
      'onset_overnight': '一夜之间', 'onset_after_rain_1_2d': '雨后1-2天', 'onset_after_overcast': '连阴天后', 'onset_gradual': '逐渐1-2周'
    },
    field_type: {
      'soil_clay': '粘重土', 'soil_sandy': '沙土', 'soil_lowland': '低洼地', 'soil_repeated': '重茬地', 'soil_good': '黑松软'
    },
    root_appearance: {
      'root_white': '白根多', 'root_dullyellow': '淡黄', 'root_brown': '褐色', 'root_black': '发黑', 'root_loss_hairs': '毛细根少'
    },
    soil_texture_touch: {
      'touch_sandy': '一揉即散', 'touch_clayey': '捏成团不散', 'touch_saltty': '粘手有盐', 'touch_gray': '灰白（缺氧）', 'touch_black_loose': '黑而松软'
    }
  }
};

module.exports = QUESTION_CONFIG;