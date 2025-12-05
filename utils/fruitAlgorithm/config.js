// utils/fruitAlgorithm/config.js

const weights = require('./weights');
const diagnosis_templates = require('./templates');

module.exports = {
  version: "2.0.0",
  diagnosis_codes: ["F1","F2","F3","F4","F5","F6","F7","F8","F9","F10","F11","F12"],
  
  phenology_map: {
    "1": "overwinter", "2": "budding", "3": "budding_flowering", 
    "4": "flowering_fruit_drop", "5": "fruit_drop_summer_rain", 
    "6": "summer_rain", "7": "flower_induction", "8": "autumn_flush", 
    "9": "autumn_flush", "10": "fruit_expansion", "11": "fruit_expansion_critical", "12": "overwinter"
  },

  dynamic_questions: {
    "overwinter": ["fruit_symptom","soil_smell","root_smell","onset_speed","field_type"],
    "budding": ["fruit_symptom","soil_smell","root_smell","field_type"],
    "budding_flowering": ["fruit_symptom","onset_speed","recent_event","field_type"],
    "flowering_fruit_drop": ["fruit_symptom","recent_event","onset_speed","field_type"],
    "fruit_drop_summer_rain": ["fruit_symptom","soil_smell","root_smell","recent_event","field_type"],
    "summer_rain": ["fruit_symptom","soil_smell","root_smell","recent_event","field_type","soil_texture_touch"],
    "flower_induction": ["fruit_symptom","root_appearance","soil_smell","field_type"],
    "autumn_flush": ["fruit_symptom","soil_smell","recent_event","field_type"],
    "fruit_expansion": ["fruit_symptom","leaf_symptom","soil_smell","recent_event","field_type"],
    "fruit_expansion_critical": ["fruit_symptom","leaf_symptom","soil_smell","root_appearance","recent_event","field_type","soil_texture_touch"]
  },

  phenology_correction: {
    "overwinter": { "F1":0.5,"F2":0.5,"F3":1.0,"F4":1.0,"F5":0.6,"F6":0.7,"F7":0.8,"F8":0.6,"F9":1.0,"F10":0.5,"F11":1.0,"F12":1.2 },
    "budding": { "F1":0.8,"F2":0.8,"F3":1.0,"F4":1.1,"F5":0.7,"F6":0.9,"F7":0.7,"F8":0.8,"F9":1.0,"F10":0.6,"F11":1.0,"F12":0.9 },
    "budding_flowering": { "F1":0.6,"F2":0.6,"F3":1.0,"F4":1.1,"F5":0.8,"F6":0.9,"F7":0.6,"F8":0.8,"F9":1.0,"F10":0.7,"F11":1.0,"F12":0.8 },
    "flowering_fruit_drop": { "F1":0.9,"F2":0.9,"F3":1.1,"F4":1.0,"F5":0.8,"F6":0.9,"F7":0.8,"F8":0.9,"F9":1.0,"F10":0.7,"F11":1.0,"F12":1.0 },
    "fruit_drop_summer_rain": { "F1":1.3,"F2":1.5,"F3":1.0,"F4":1.0,"F5":1.0,"F6":1.0,"F7":0.7,"F8":1.5,"F9":1.0,"F10":1.0,"F11":1.0,"F12":1.1 },
    "summer_rain": { "F1":1.6,"F2":1.7,"F3":1.0,"F4":1.0,"F5":1.0,"F6":1.0,"F7":0.6,"F8":1.7,"F9":1.0,"F10":0.8,"F11":1.0,"F12":1.2 },
    "flower_induction": { "F1":0.7,"F2":0.7,"F3":1.0,"F4":1.0,"F5":1.4,"F6":1.1,"F7":0.9,"F8":0.7,"F9":1.0,"F10":0.9,"F11":1.0,"F12":1.0 },
    "autumn_flush": { "F1":0.7,"F2":0.7,"F3":1.0,"F4":1.0,"F5":1.7,"F6":1.2,"F7":1.0,"F8":0.9,"F9":1.0,"F10":1.1,"F11":1.0,"F12":1.0 },
    "fruit_expansion": { "F1":1.4,"F2":0.9,"F3":1.0,"F4":1.0,"F5":0.7,"F6":1.0,"F7":2.1,"F8":0.9,"F9":1.0,"F10":0.7,"F11":1.0,"F12":1.0 },
    "fruit_expansion_critical": { "F1":1.6,"F2":1.0,"F3":1.0,"F4":1.0,"F5":0.6,"F6":1.0,"F7":2.3,"F8":1.0,"F9":1.0,"F10":0.6,"F11":1.0,"F12":1.0 }
  },

  // 从独立文件导入
  weights: weights,
  diagnosis_templates: diagnosis_templates,

  priority_rules: {
    root_damage: { if: { root_smell:["root_rotten"], root_appearance:["root_black"] } },
    sulfur_gray: { if: { soil_smell:"soil_sulfur", soil_texture_touch:"touch_gray" } },
    pesticide: { if_contains_event: ["ev_mixed_pesticide","ev_recent_spray"] },
    salt: { if_soil_texture_touch: "touch_saltty" },
    nitrogen: { if_event: "ev_heavy_n", if_in_candidates: ["F3"] },
    sunburn: { if_recent_event: "ev_hot", if_fruit_symptom: "fruit_sunburn" },
    fruit_drop: { if_fruit_symptom: "fruit_abscission", if_in_candidates: ["F1","F2"] },
    drought: { if_onset_speed: "onset_gradual", if_fruit_symptom: "fruit_small", prefer: ["F9","F10"] },
    low_temp: { if_recent_event: "ev_cold", if_in_candidates: ["F8","F9"], if_fruit_symptom: "fruit_internal_crack" },
    tie_breaker: { priority: ["F1","F2","F4","F3","F11","F5","F7","F8","F10","F6","F12","F9"] }
  }
};