import { describe, expect, it } from 'vitest'
import { buildPhotographyGuide } from '../../../lib/moon/photography'

describe('buildPhotographyGuide', () => {
  it('flags landscape for high illumination', () => {
    const guide = buildPhotographyGuide(95, '2026-08-03T11:00:00Z')
    expect(guide.bestForLandscape).toBe(true)
    expect(guide.bestForCraters).toBe(false)
    expect(guide.recommendedFocalLengthMm).toEqual({ min: 24, max: 70 })
  })

  it('flags craters for mid illumination', () => {
    const guide = buildPhotographyGuide(50, null)
    expect(guide.bestForCraters).toBe(true)
    expect(guide.bestForLandscape).toBe(false)
    expect(guide.recommendedFocalLengthMm).toEqual({ min: 200, max: 600 })
  })

  it('flags moonrise when rise exists and illumination is sufficient', () => {
    const guide = buildPhotographyGuide(60, '2026-08-03T11:00:00Z')
    expect(guide.bestForMoonrise).toBe(true)
  })

  it('disables moonrise when rise is null', () => {
    const guide = buildPhotographyGuide(80, null)
    expect(guide.bestForMoonrise).toBe(false)
  })
})
