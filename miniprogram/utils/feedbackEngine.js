// utils/feedbackEngine.js
const feedbackStore = {}

export function updateChainConfidence(chainId, result) {
  if (!feedbackStore[chainId]) {
    feedbackStore[chainId] = 1.0
  }

  if (result === 'better') feedbackStore[chainId] += 0.01
  if (result === 'worse') feedbackStore[chainId] -= 0.02

  feedbackStore[chainId] = Math.min(
    1.2,
    Math.max(0.8, feedbackStore[chainId])
  )
}

export function getChainConfidence(chainId) {
  return feedbackStore[chainId] || 1.0
}
