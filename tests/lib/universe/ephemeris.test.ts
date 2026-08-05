import { describe, expect, it } from 'vitest'
import { buildUniverseSnapshot, moonDistanceKm } from '../../../lib/universe/ephemeris'

const FIXED = new Date('2024-01-01T00:00:00.000Z')
const AU_KM = 149_597_870.7

describe('universe ephemeris', () => {
  it('places Earth about 1 AU from the Sun on a fixed date', () => {
    const snapshot = buildUniverseSnapshot(FIXED)
    const earth = snapshot.bodies.find((body) => body.id === 'earth')
    expect(earth).toBeDefined()
    const distanceKm = Math.hypot(
      earth!.positionKm.x,
      earth!.positionKm.y,
      earth!.positionKm.z
    )
    expect(distanceKm / AU_KM).toBeGreaterThan(0.97)
    expect(distanceKm / AU_KM).toBeLessThan(1.03)
  })

  it('keeps Moon distance in a plausible range', () => {
    const distance = moonDistanceKm(FIXED)
    expect(distance).toBeGreaterThan(350_000)
    expect(distance).toBeLessThan(410_000)
  })

  it('includes sun, planets, and moon with earth/moon extras', () => {
    const snapshot = buildUniverseSnapshot(FIXED, { lat: 21.03, lng: 105.85 })
    const ids = snapshot.bodies.map((body) => body.id)
    expect(ids).toContain('sun')
    expect(ids).toContain('jupiter')
    expect(ids).toContain('moon')
    expect(snapshot.earth?.userLat).toBe(21.03)
    expect(snapshot.moon?.phaseFraction).toBeGreaterThanOrEqual(0)
    expect(snapshot.moon?.phaseFraction).toBeLessThanOrEqual(1)
    expect(snapshot.earth?.seasonKey).toBeTruthy()
  })
})
