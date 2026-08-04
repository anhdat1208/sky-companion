import { describe, expect, it } from 'vitest'
import {
  getMoonAngularDiameterDeg,
  getMoonDistanceKm,
  getMoonHorizontal,
  getMoonRiseSet
} from '../../../lib/moon/position'

const WHEN = new Date('2026-08-03T14:00:00Z')
const LAT = 21.0285
const LNG = 105.8542

describe('moon position helpers', () => {
  it('returns finite altitude and azimuth', () => {
    const { altitude, azimuth } = getMoonHorizontal(LAT, LNG, WHEN)
    expect(Number.isFinite(altitude)).toBe(true)
    expect(Number.isFinite(azimuth)).toBe(true)
    expect(azimuth).toBeGreaterThanOrEqual(0)
    expect(azimuth).toBeLessThan(360)
  })

  it('returns ISO rise/set or null', () => {
    const { riseTime, setTime } = getMoonRiseSet(LAT, LNG, WHEN)
    if (riseTime !== null) {
      expect(Number.isNaN(Date.parse(riseTime))).toBe(false)
    }
    if (setTime !== null) {
      expect(Number.isNaN(Date.parse(setTime))).toBe(false)
    }
  })

  it('returns Earth–Moon distance and angular diameter in expected bands', () => {
    const distanceKm = getMoonDistanceKm(WHEN)
    expect(distanceKm).toBeGreaterThan(350000)
    expect(distanceKm).toBeLessThan(420000)
    const diameter = getMoonAngularDiameterDeg(distanceKm)
    expect(diameter).toBeGreaterThan(0.4)
    expect(diameter).toBeLessThan(0.6)
  })
})
