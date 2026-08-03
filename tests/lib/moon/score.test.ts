import { describe, expect, it } from 'vitest'
import { computeObservationScore } from '../../../lib/moon/score'

describe('computeObservationScore', () => {
  it('caps below-horizon moons at 1 Poor', () => {
    const score = computeObservationScore(-10, 90, 50)
    expect(score.stars).toBe(1)
    expect(score.label).toBe('Poor')
  })

  it('boosts mid-illumination quarters when altitude is good', () => {
    const score = computeObservationScore(45, 90, 50)
    expect(score.stars).toBeGreaterThanOrEqual(4)
    expect(['Good', 'Excellent']).toContain(score.label)
  })

  it('forces near-new moons to Poor', () => {
    const score = computeObservationScore(50, 0, 2)
    expect(score.stars).toBe(1)
    expect(score.label).toBe('Poor')
  })

  it('maps star counts to labels per spec', () => {
    expect(computeObservationScore(-1, 180, 100).label).toBe('Poor')
  })
})
