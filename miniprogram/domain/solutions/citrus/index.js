/**
 * miniprogram/domain/solutions/citrus/index.js
 * 方案层：唯一防治建议数据源（方案 B 结构）
 */
const CITRUS_SOLUTIONS = {
  LEAF_SOOTY_MOLD: {
    title: '叶片煤污（黑灰霉层）',
    actions: {
      steps: [
        { title: '加强通风', detail: '及时修剪过密枝条，改善树冠内通风透光条件。' },
        { title: '防虫治病', detail: '防治蚜虫、粉虱等分泌蜜露的害虫，阻断煤污病源。' },
        { title: '霉层清洗', detail: '发病初期喷施矿物油或相应洗涤剂辅助清洗霉层。' }
      ]
    }
  },
  // 必须确保 DEFAULT 至少有 3 条，这是系统最后的防线
  DEFAULT: {
    title: '诊断待确认',
    actions: {
      steps: [
        { title: '持续观察', detail: '记录症状变化及是否扩散至全株，并拍摄清晰照片。' },
        { title: '补充信息', detail: '回顾近期肥水管理及天气变化，协助精准判断。' },
        { title: '专家咨询', detail: '若症状加重，请咨询当地农技站获取针对性方案。' }
      ]
    }
  }
};
module.exports = CITRUS_SOLUTIONS;