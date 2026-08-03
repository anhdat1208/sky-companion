import { describe, expect, it } from 'vitest'
import { readFallbackTle } from '../../../lib/iss/tle'
import { findNextVisiblePass } from '../../../lib/iss/passes'

describe('findNextVisiblePass', () => {
  it('returns a well-formed visible pass for Hanoi near fixture epoch', () => {
    const tle = readFallbackTle()
    // Fixture TLE epoch ≈ 2026-08-02. Frozen `now` yields a real Hanoi visible pass
    // (max elev ~10.9°, night + sunlit) within the 36h window.
    const pass = findNextVisiblePass(
      tle,
      { lat: 21.0285, lng: 105.8542 },
      new Date('2026-08-02T12:00:00Z')
    )

    expect(pass).not.toBeNull()
    expect(pass!.durationSeconds).toBeGreaterThan(0)
    expect(pass!.maxElevationDeg).toBeGreaterThanOrEqual(10)
    expect(Date.parse(pass!.setTime)).toBeGreaterThan(Date.parse(pass!.riseTime))
    expect(Date.parse(pass!.maxTime)).toBeGreaterThanOrEqual(Date.parse(pass!.riseTime))
    expect(Date.parse(pass!.maxTime)).toBeLessThanOrEqual(Date.parse(pass!.setTime))
    expect(pass!.direction).toContain('→')
    expect(pass!.magnitude).not.toBeNull()
  })
})
