// utils/diseaseRadar.js
export function diseaseRadar(symptoms, climate, stage) {
  let risk = 0

  if (symptoms.includes('spot')) risk += 0.3
  if (climate === 'south_humid') risk += 0.3
  if (stage === 'fruiting') risk += 0.2

  if (risk >= 0.7) return 'high'
  if (risk >= 0.4) return 'medium'
  return 'low'
}
