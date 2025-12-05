/**
 * sample_tests.js
 * 用于快速验证 diagnosticEngine.js 是否正常运行
 * 在开发者工具控制台输入：
 *
 * const t = require('../../utils/sample_tests.js')
 * t.run()
 *
 * 能看到 PASS / FAIL
 */

const Engine = require('./diagnosticEngine.js')

function run() {
  const tests = [
    {
      name: "测试 1：果蝇特征应该强制识别为 fruit_fly",
      input: {
        type: "fruit",
        phenology: 6,
        features: {
          "visible_holes_or_larvae": true,
          "recent_rain": true
        }
      },
      expect: "fruit_fly"
    },

    {
      name: "测试 2：油斑应优先判定 greasy_spot",
      input: {
        type: "fruit",
        phenology: 6,
        features: {
          "oily_spots": true
        }
      },
      expect: "greasy_spot"
    },

    {
      name: "测试 3：裂果应判为 cracking_water_imbalance",
      input: {
        type: "fruit",
        phenology: 10,
        features: {
          "cracking_split": true
        }
      },
      expect: "cracking_water_imbalance"
    },

    {
      name: "测试 4：幼叶失绿应判为 Fe 缺乏",
      input: {
        type: "leaf",
        phenology: 9,
        features: {
          "leaf_age_young": true,
          "interveinal_chlorosis": true
        }
      },
      expect: "Fe"
    },

    {
      name: "测试 5：煤污+虫应判为 insect",
      input: {
        type: "leaf",
        phenology: 9,
        features: {
          "honeydew_sooty": true,
          "insects_visible": true
        }
      },
      expect: "insect"
    }
  ]

  let passCount = 0

  tests.forEach(t => {
    const r = Engine.run(t.input)
    if (r === t.expect) {
      console.log("PASS:", t.name)
      passCount++
    } else {
      console.error("FAIL:", t.name, " expected:", t.expect, " got:", r)
    }
  })

  console.log(`测试结束：${passCount}/${tests.length} 通过`)
}

module.exports = {
  run
}
