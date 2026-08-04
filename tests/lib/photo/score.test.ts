import { describe, expect, it } from 'vitest'
import { computePhotographyScore } from '../../../lib/photo/score'

describe('computePhotographyScore', () => {
  it('scores high on excellent MW with dark sky and no moon', () => {
    const s = computePhotographyScore({
      milkyWayVisibility: 'Excellent',
      hasAstronomicalDarkness: true,
      moonAltitudeDeg: -10,
      moonIlluminationPct: 5,
      coreVisible: true
    })
    expect(s.stars).toBe(5)
    expect(s.label).toBe('Excellent')
    expect(s.cloudCoverPct).toBeNull()
  })

  it('caps when no astronomical darkness', () => {
    const s = computePhotographyScore({
      milkyWayVisibility: 'Good',
      hasAstronomicalDarkness: false,
      moonAltitudeDeg: -10,
      moonIlluminationPct: 0,
      coreVisible: null
    })
    expect(s.stars).toBe(1)
    expect(s.label).toBe('Poor')
  })

  it('penalizes bright moon above horizon', () => {
    const s = computePhotographyScore({
      milkyWayVisibility: 'Excellent',
      hasAstronomicalDarkness: true,
      moonAltitudeDeg: 40,
      moonIlluminationPct: 90,
      coreVisible: true
    })
    expect(s.stars).toBeLessThanOrEqual(4)
  })
})
