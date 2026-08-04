import { describe, expect, it } from 'vitest'
import { getShowerDefinition } from '../../../lib/meteor/catalog'
import {
  bestDirectionAtPeak,
  bestObservationTimeLabel,
  computeMeteorVisibilityScore,
  getRadiantHorizontal
} from '../../../lib/meteor/visibility'

describe('meteor visibility', () => {
  it('computes radiant horizontal coordinates', () => {
    const perseids = getShowerDefinition('perseids')
    const peak = new Date(Date.UTC(2026, 7, 12, 20, 0, 0))
    const pos = getRadiantHorizontal(perseids, 21.03, 105.85, peak)
    expect(Number.isFinite(pos.altitude)).toBe(true)
    expect(Number.isFinite(pos.azimuth)).toBe(true)
  })

  it('applies altitude, moon, and zhr rules', () => {
    const high = computeMeteorVisibilityScore({
      altitudeDeg: 50,
      interference: 'none',
      zhr: 150
    })
    expect(high.stars).toBe(5)
    expect(high.label).toBe('Excellent')
    expect(high.cloudCoverPct).toBeNull()

    const moonlit = computeMeteorVisibilityScore({
      altitudeDeg: 50,
      interference: 'severe',
      zhr: 150
    })
    expect(moonlit.stars).toBeLessThan(high.stars)

    const weak = computeMeteorVisibilityScore({
      altitudeDeg: 10,
      interference: 'none',
      zhr: 10
    })
    expect(weak.stars).toBeLessThanOrEqual(2)
  })

  it('returns the fixed best-time heuristic', () => {
    const label = bestObservationTimeLabel(
      getShowerDefinition('perseids'),
      null,
      null,
      new Date(Date.UTC(2026, 7, 12, 20, 0, 0))
    )
    expect(label.toLowerCase()).toContain('nửa đêm')
  })

  it('maps peak radiant azimuth to compass direction', () => {
    const perseids = getShowerDefinition('perseids')
    const peak = new Date(Date.UTC(2026, 7, 12, 20, 0, 0))
    const direction = bestDirectionAtPeak(perseids, 21.03, 105.85, peak)
    expect(direction.length).toBeGreaterThan(0)
  })
})
