import symptomChains from '../utils/symptomChainMap'
import { getChainConfidence } from '../utils/feedbackEngine'
import { diseaseRadar } from '../utils/diseaseRadar'

export function diagnose({ symptoms, stage, climate }) {
  const scores = {
    magnesium_def: 1,
    root_problem: 1
  }

  // 症状链判断
  symptomChains.forEach(chain => {
    const hit = chain.symptoms.every(s => symptoms.includes(s))
    if (hit && chain.stage.includes(stage)) {
      const confidence = getChainConfidence(chain.id)
      scores[chain.target] *= chain.bonus * confidence
    }
  })

  // 病害雷达（并行）
  const diseaseRisk = diseaseRadar(symptoms, climate, stage)

  return {
    result: scores,
    diseaseRisk
  }
}
