// utils/leafAlgorithm/config.js

const weights = require('./weights');
const diagnosis_templates = require('./templates');

module.exports = {
  version: "2.0.0",
  diagnosis_codes: ["L1","L2","L3","L4","L5","L6","L7","L8","L9","L10","L11","L12"],
  
  phenology_map: {
    "1": "overwinter", "2": "budding", "3": "budding_flowering", 
    "4": "flowering_fruit_drop", "5": "fruit_drop_summer_rain", 
    "6": "summer_rain", "7": "flower_induction", "8": "autumn_flush", 
    "9": "autumn_flush", "10": "fruit_expansion", "11": "fruit_expansion", "12": "overwinter"
  },

  dynamic_questions: {
    "overwinter": ["leaf_symptom","soil_smell","root_smell","onset_speed","field_type","soil_texture_touch"],
    "budding": ["leaf_symptom","soil_smell","root_smell","onset_speed","field_type","soil_texture_touch"],
    "budding_flowering": ["leaf_symptom","onset_speed","recent_event","field_type"],
    "flowering_fruit_drop": ["leaf_symptom","recent_event","onset_speed","field_type"],
    "fruit_drop_summer_rain": ["leaf_symptom","soil_smell","root_smell","recent_event","field_type"],
    "summer_rain": ["leaf_symptom","soil_smell","root_smell","recent_event","field_type","soil_texture_touch"],
    "flower_induction": ["leaf_symptom","root_appearance","soil_smell","field_type"],
    "autumn_flush": ["leaf_symptom","soil_smell","recent_event","field_type"],
    "fruit_expansion": ["leaf_symptom","fruit_symptom","soil_smell","recent_event","field_type"]
  },

  phenology_correction: {
    "overwinter": { "L1":0.6,"L2":0.6,"L3":1.0,"L4":1.0,"L5":0.5,"L6":0.8,"L7":1.0,"L8":0.7,"L9":1.0,"L10":0.5,"L11":1.0,"L12":1.2 },
    "budding": { "L1":1.0,"L2":1.0,"L3":1.0,"L4":1.2,"L5":0.8,"L6":1.0,"L7":0.8,"L8":1.0,"L9":1.0,"L10":0.7,"L11":1.0,"L12":1.0 },
    "budding_flowering": { "L1":0.7,"L2":0.7,"L3":1.0,"L4":1.2,"L5":0.8,"L6":1.0,"L7":0.7,"L8":1.0,"L9":1.0,"L10":0.6,"L11":1.0,"L12":0.8 },
    "flowering_fruit_drop": { "L1":1.0,"L2":1.0,"L3":1.2,"L4":1.0,"L5":0.9,"L6":1.0,"L7":0.9,"L8":1.0,"L9":1.0,"L10":0.8,"L11":1.0,"L12":1.0 },
    "fruit_drop_summer_rain": { "L1":1.4,"L2":1.6,"L3":1.0,"L4":1.0,"L5":1.0,"L6":1.0,"L7":0.8,"L8":1.6,"L9":1.0,"L10":1.0,"L11":1.0,"L12":1.2 },
    "summer_rain": { "L1":1.7,"L2":1.8,"L3":1.0,"L4":1.0,"L5":1.0,"L6":1.0,"L7":0.7,"L8":1.8,"L9":1.0,"L10":0.8,"L11":1.0,"L12":1.3 },
    "flower_induction": { "L1":0.8,"L2":0.8,"L3":1.0,"L4":1.0,"L5":1.5,"L6":1.0,"L7":0.8,"L8":0.8,"L9":1.0,"L10":0.9,"L11":1.0,"L12":1.0 },
    "autumn_flush": { "L1":0.8,"L2":0.8,"L3":1.0,"L4":1.0,"L5":1.8,"L6":1.2,"L7":1.0,"L8":1.0,"L9":1.0,"L10":1.2,"L11":1.0,"L12":1.0 },
    "fruit_expansion": { "L1":1.5,"L2":1.0,"L3":1.0,"L4":1.0,"L5":0.8,"L6":1.0,"L7":2.0,"L8":1.0,"L9":1.0,"L10":0.8,"L11":1.0,"L12":1.0 }
  },

  // 从独立文件导入
  weights: weights,
  diagnosis_templates: diagnosis_templates,

  priority_rules: {
    root_damage: { if: { root_smell:["root_rotten"], root_appearance:["root_black"] } },
    sulfur_gray: { if: { soil_smell:"soil_sulfur", soil_texture_touch:"touch_gray" } },
    pesticide: { if_contains_event: ["ev_mixed_pesticide","ev_recent_spray"] },
    virus: { if_leaf_symptom: "variegation" },
    salt: { if_soil_texture_touch: "touch_saltty" },
    nitrogen: { if_event: "ev_heavy_n", if_in_candidates: ["L3"] },
    sunburn: { if_recent_event: "ev_hot", if_leaf_symptom: "edge_burn" },
    drought: { if_onset_speed: "onset_overnight", if_in_candidates: ["L9"] },
    gradual: { if_onset_speed: "onset_gradual", prefer: ["L10","L12","L9"] },
    tie_breaker: { priority: ["L1","L2","L4","L3","L11","L5","L7","L8","L10","L6","L12","L9"] }
  }
};