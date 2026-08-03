import { describe, expect, it } from 'vitest'
import { readFallbackTle } from '../../../lib/iss/tle'
import { propagateIss } from '../../../lib/iss/propagate'

describe('propagateIss', () => {
  it('returns ISS-class altitude and finite coordinates', () => {
    const tle = readFallbackTle()
    // Fixture TLE epoch is year-day 26214... (2026 day 214 ≈ 2026-08-02)
    const when = new Date('2026-08-02T12:00:00Z')
    const pos = propagateIss(tle, when)

    expect(pos.latitude).toBeGreaterThanOrEqual(-90)
    expect(pos.latitude).toBeLessThanOrEqual(90)
    expect(pos.longitude).toBeGreaterThanOrEqual(-180)
    expect(pos.longitude).toBeLessThanOrEqual(180)
    expect(pos.altitudeKm).toBeGreaterThan(300)
    expect(pos.altitudeKm).toBeLessThan(500)
    expect(pos.velocityKph).toBeGreaterThan(20000)
    expect(pos.velocityKph).toBeLessThan(30000)
    expect(Number.isNaN(Date.parse(pos.timestamp))).toBe(false)
  })
})
