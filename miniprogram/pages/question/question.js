// miniprogram/pages/question/question.js
const app = getApp()

// ✅ 方案1：页面内直接引入调度器与题库（不依赖 app 上挂函数）
const scheduler = require('../../domain/questionnaire/scheduler')
const questionBank = require('../../domain/questionnaire/questionBank')

function safeDecode(v) {
  try { return decodeURIComponent(v) } catch (e) { return v }
}
function isAnswered(answers, key) {
  return answers && answers[key] !== undefined && answers[key] !== null
}

Page({
  data: {
    currentQuestion: null,
    answers: {},
    selectedOptions: [],
    meta: {
      crop: 'citrus',
      month: new Date().getMonth() + 1,
      mode: 'single',
      positions: []
    }
  },

  onLoad(options = {}) {
    // 1) meta：从 positionSelect 带过来的参数
    const crop = options.crop ? safeDecode(options.crop) : 'citrus'
    const month = options.month ? Number(safeDecode(options.month)) : (new Date().getMonth() + 1)
    const mode = options.mode ? safeDecode(options.mode) : 'single'
    const positionsStr = options.positions ? safeDecode(options.positions) : ''
    const positions = positionsStr ? positionsStr.split(',').filter(Boolean) : []

    const meta = { crop, month, mode, positions }

    // 2) 恢复答案：优先 last_diagnosis_answers，其次兼容旧 answers
    const savedAnswers =
      wx.getStorageSync('last_diagnosis_answers') ||
      wx.getStorageSync('answers') ||
      {}

    this.setData({ meta, answers: savedAnswers })

    // 3) 给结果页兜底
    app.globalData.diagnosisMeta = meta
    app.globalData.diagnosisAnswers = savedAnswers
    wx.setStorageSync('last_diagnosis_meta', meta)

    // 4) 加载下一题
    this.loadNextQuestion()
  },

  /**
   * ✅ 核心：加载下一题
   * - 首题必须先出主诉 Q_CHIEF_COMPLAINT（否则 scheduler 第一轮必然 null）
   * - 主诉答完后，再交给 scheduler 走“强制追问/needs”
   */
  loadNextQuestion() {
    const { answers, meta } = this.data
    const ctx = { positions: meta.positions || [] }

    // 0) 首题兜底：没回答 symptoms 就必须先问主诉
    if (!isAnswered(answers, 'symptoms')) {
      const chief = questionBank.getQuestion('Q_CHIEF_COMPLAINT', ctx)
      if (!chief) {
        wx.showToast({ title: '题库缺失：主诉题未生成', icon: 'none' })
        this.goResult()
        return
      }
      this.setData({
        currentQuestion: chief,
        selectedOptions: this.initSelectedOptions(chief)
      })
      return
    }

    // 1) 主诉已有：交给 scheduler 决定追问
    const next = scheduler(answers, [])

    // 2) scheduler 认为结束：进结果页
    if (!next || !next.questionId) {
      this.goResult()
      return
    }

    const q = questionBank.getQuestion(next.questionId, ctx)
    if (!q) {
      wx.showToast({ title: '题库缺失，直接生成结果', icon: 'none' })
      this.goResult()
      return
    }

    this.setData({
      currentQuestion: q,
      selectedOptions: this.initSelectedOptions(q)
    })
  },

  initSelectedOptions(question) {
    const v = this.data.answers[question.key]
    return Array.isArray(v) ? [...v] : []
  },

  // 单选题：点一下就保存并进入下一题
  onSelectSingle(e) {
    const { value } = e.currentTarget.dataset
    const q = this.data.currentQuestion
    if (!q) return
    this.saveAnswer(q.key, value)
    this.loadNextQuestion()
  },

  // 多选题：点选项只变更选中态
  onSelectOption(e) {
    const { value } = e.currentTarget.dataset
    const q = this.data.currentQuestion
    if (!q) return

    let arr = Array.isArray(this.data.selectedOptions) ? [...this.data.selectedOptions] : []

    // unknown 互斥（你题库里通常会有）
    if (value === 'unknown') {
      arr = ['unknown']
    } else {
      arr = arr.filter(v => v !== 'unknown')
      if (arr.includes(value)) arr = arr.filter(v => v !== value)
      else arr.push(value)
    }

    // maxSelect（默认 2）
    const maxSelect = Number(q.maxSelect) || 2
    if (arr.length > maxSelect) {
      wx.showToast({ title: `最多选择 ${maxSelect} 项`, icon: 'none' })
      return
    }

    this.setData({ selectedOptions: arr })
  },

  // 多选题：点“确定”才保存并进入下一题
  onConfirmMulti() {
    const q = this.data.currentQuestion
    if (!q) return
    const arr = Array.isArray(this.data.selectedOptions) ? this.data.selectedOptions : []
    this.saveAnswer(q.key, arr)
    this.loadNextQuestion()
  },

  saveAnswer(key, value) {
    const answers = { ...(this.data.answers || {}), [key]: value }
    this.setData({ answers })

    // ✅ 统一写入口（结果页兜底）
    app.globalData.diagnosisAnswers = answers
    wx.setStorageSync('last_diagnosis_answers', answers)

    // ✅ 兼容旧 key（你工程里还有地方在读 answers）
    wx.setStorageSync('answers', answers)
  },

  goResult() {
    const answers = this.data.answers || {}
    const meta = this.data.meta || null

    app.globalData.diagnosisAnswers = answers
    if (meta) app.globalData.diagnosisMeta = meta

    wx.setStorageSync('last_diagnosis_answers', answers)
    if (meta) wx.setStorageSync('last_diagnosis_meta', meta)

    wx.redirectTo({ url: '/pages/result/result' })
  }
})
