import { describe, expect, it } from 'vitest'
import { rankTonightTargets } from '../../../lib/telescope/ranking'

describe('rankTonightTargets', () => {
  it('returns nine ranked targets with scores 1–5', () => {
    const ranked = rankTonightTargets(21.0285, 105.8542, new Date('2026-08-03T14:00:00Z'))
    expect(ranked).toHaveLength(9)
    for (const item of ranked) {
      expect(item.visibilityScore).toBeGreaterThanOrEqual(1)
      expect(item.visibilityScore).toBeLessThanOrEqual(5)
      expect(Number.isNaN(Date.parse(item.bestObservationTime))).toBe(false)
    }
  })

  it('sorts higher scores before lower scores', () => {
    const ranked = rankTonightTargets(21.0285, 105.8542, new Date('2026-08-03T14:00:00Z'))
    for (let i = 1; i < ranked.length; i += 1) {
      const prev = ranked[i - 1]!
      const curr = ranked[i]!
      expect(prev.visibilityScore).toBeGreaterThanOrEqual(curr.visibilityScore)
    }
  })

  it('caps below-horizon targets at score 1', () => {
    const ranked = rankTonightTargets(21.0285, 105.8542, new Date('2026-08-03T14:00:00Z'))
    const belowHorizon = ranked.filter(item => item.altitude < 0)
    expect(belowHorizon.length).toBeGreaterThan(0)
    for (const item of belowHorizon) {
      expect(item.visibilityScore).toBe(1)
    }
  })
})
