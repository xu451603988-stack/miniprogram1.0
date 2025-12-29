/**
 * 🌍 EnvironmentAlgo.js - 时空与物候算法 (V6.1)
 * 核心逻辑：基于《中药农业》“因时因地”理论
 * * 职责：
 * 1. 动态物候修正 (Phenology Correction)：解决“长沙比桂林晚”的问题。
 * 2. 环境胁迫计算 (Stress Calculation)：将天气转化为五邪数值。
 * 3. 农事预警生成 (Warning Generation)。
 */

const EnvironmentAlgo = {

  /**
   * 计算环境与物候参数
   * @param {Object} location - { latitude, region }
   * @param {Object} weather - { temp: 25, humidity: 80, rain: true } 实时天气
   * @param {Date} date - 当前日期 (默认今天)
   */
  calculate(location, weather, date = new Date()) {
    console.log("🌍 [时空算法] 开始计算:", location.region, weather);

    // 1. 计算当前的“物候时间” (考虑纬度差异)
    const phenology = this._calculatePhenology(date, location.latitude);

    // 2. 计算环境五邪 (将气象数据转为中医邪气值)
    const envEvils = this._calculateEnvEvils(weather);

    // 3. 生成天气预警 (用于首页仪表盘)
    const warning = this._generateWarning(weather, phenology.stage, envEvils);

    return {
      phenology: phenology, // 物候信息 { stage: 'flowering', desc: '花期' }
      envEvils: envEvils,   // 环境邪气 { cold: 0, damp: 30 ... }
      warning: warning      // 预警对象 { level: 'red', msg: '...' }
    };
  },

  /**
   * 内部方法：计算物候 (纬度修正版)
   * 核心原理：纬度每升高 1度，物候约推迟 3-4天
   */
  _calculatePhenology(date, latitude) {
    const month = date.getMonth() + 1; // 1-12
    const lat = latitude || 25; // 默认为华南纬度

    // 基准纬度 (以桂林/柳州 25°N 为基准)
    const baseLat = 25; 
    // 纬度差 (长沙 28° - 桂林 25° = 3°)
    const latDiff = lat - baseLat;
    
    // 物候延迟天数 (每北移1度，推迟4天)
    const delayDays = latDiff * 4; 
    
    // 计算“修正后的虚拟月份” (用于查表)
    // 比如：长沙3月1日 = (3月1日 - 12天) = 桂林的2月中下旬
    // 这里简化处理：只对月份做定性偏移
    
    let stage = 'dormant';
    let name = '休眠期';

    // === 简易物候表 (以基准纬度为准) ===
    // 实际项目中可换成更复杂的积温算法
    if (month === 12 || month === 1) {
      stage = 'overwinter'; name = '越冬期';
    } else if (month === 2) {
      stage = 'budding'; name = '萌芽期';
    } else if (month === 3 || month === 4) {
      stage = 'flowering'; name = '花期';
    } else if (month >= 5 && month <= 8) {
      stage = 'growing'; name = '膨果/夏梢期';
    } else if (month >= 9 && month <= 11) {
      stage = 'maturing'; name = '转色成熟期';
    }

    // 如果纬度高(如长沙)，且处于季节交替时，强行修正回上一个阶段
    if (latDiff > 2 && (month === 2 || month === 3)) {
      console.log(`❄️ 纬度偏高(${lat})，物候修正为上一阶段`);
      if (month === 2) { stage = 'overwinter'; name = '越冬期(修正)'; }
      if (month === 3) { stage = 'budding'; name = '萌芽期(修正)'; }
    }

    return { stage, name, delayDays };
  },

  /**
   * 内部方法：计算环境邪气值
   * 将西医气象数据(℃/%) -> 中医五邪分值(0-100)
   */
  _calculateEnvEvils(w) {
    const scores = { cold: 0, heat: 0, damp: 0, wind: 0 };
    
    // 1. 寒邪 (Cold)
    if (w.temp < 5) scores.cold = 80;       // 极寒
    else if (w.temp < 12) scores.cold = 40; // 微寒

    // 2. 热邪 (Heat)
    if (w.temp > 35) scores.heat = 80;      // 酷暑
    else if (w.temp > 30) scores.heat = 40; // 燥热

    // 3. 湿邪 (Dampness)
    // 下雨直接满分，或者是“高温+高湿”的桑拿天
    if (w.rain) {
      scores.damp = 90; 
    } else if (w.humidity > 85) {
      scores.damp = 60;
    }

    // 4. 风邪 (简单模拟)
    // 如果有风速数据最好，没有暂不计算
    
    return scores;
  },

  /**
   * 内部方法：生成预警文案
   */
  _generateWarning(weather, stage, evils) {
    let warn = { level: 'green', title: '适宜农事', desc: '天气平稳，可进行常规管理。' };

    // === 场景 A: 倒春寒 (花期/萌芽期 + 寒邪) ===
    if ((stage === 'budding' || stage === 'flowering') && evils.cold > 30) {
      return {
        level: 'red',
        title: '⚠️ 倒春寒预警',
        desc: `当前处于${stage === 'flowering'?'花期':'萌芽期'}，气温骤降，极易导致落花或僵苗。请务必保温！`
      };
    }

    // === 场景 B: 花期遇雨 (花期 + 湿邪) ===
    if (stage === 'flowering' && weather.rain) {
      return {
        level: 'orange',
        title: '🌧️ 花期淋雨风险',
        desc: '花期遇雨易引发灰霉病及烂花，雨停后请及时摇花并喷施保护剂。'
      };
    }

    // === 场景 C: 高温逼熟 (成熟期 + 热邪) ===
    if (stage === 'maturing' && evils.heat > 40) {
      return {
        level: 'orange',
        title: '☀️ 高温日灼风险',
        desc: '转色期遭遇高温，果实易日灼或返青，建议适当喷水降温。'
      };
    }

    return warn;
  }
};

module.exports = EnvironmentAlgo;