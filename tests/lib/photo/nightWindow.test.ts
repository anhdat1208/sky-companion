import { describe, expect, it } from 'vitest'
import { getNightWindow } from '../../../lib/photo/nightWindow'

const LAT = 21.0285
const LNG = 105.8542
// Hanoi afternoon — night is evening of Aug 3 → morning Aug 4, 2026
const WHEN = new Date(Date.UTC(2026, 7, 3, 8, 0, 0))

describe('getNightWindow', () => {
  it('returns sunset before sunrise for mid-latitude', () => {
    const window = getNightWindow(LAT, LNG, WHEN)
    expect(window).not.toBeNull()
    expect(new Date(window!.sunset).getTime()).toBeLessThan(
      new Date(window!.sunrise).getTime()
    )
  })

  it('returns null near north pole in polar day window', () => {
    const polar = getNightWindow(89, 0, new Date(Date.UTC(2026, 5, 21, 12, 0, 0)))
    expect(polar).toBeNull()
  })

  it('keeps ongoing night when when is after local midnight', () => {
    // ~02:00 ICT on Aug 4 = 19:00 UTC Aug 3 — still inside Aug 3 sunset → Aug 4 sunrise
    const afterMidnight = new Date(Date.UTC(2026, 7, 3, 19, 0, 0))
    const window = getNightWindow(LAT, LNG, afterMidnight)
    expect(window).not.toBeNull()

    const sunsetMs = new Date(window!.sunset).getTime()
    const sunriseMs = new Date(window!.sunrise).getTime()
    expect(afterMidnight.getTime()).toBeGreaterThanOrEqual(sunsetMs)
    expect(afterMidnight.getTime()).toBeLessThan(sunriseMs)

    // Must be previous evening's sunset, not the next calendar day's sunset.
    expect(window!.sunset.startsWith('2026-08-03')).toBe(true)
    expect(new Date(window!.sunset).getUTCDate()).toBe(3)
  })

  it('returns upcoming night during local afternoon', () => {
    const afternoon = getNightWindow(LAT, LNG, WHEN)!
    const afterMidnight = getNightWindow(
      LAT,
      LNG,
      new Date(Date.UTC(2026, 7, 3, 19, 0, 0))
    )!
    expect(afternoon.sunset).toBe(afterMidnight.sunset)
    expect(afternoon.sunrise).toBe(afterMidnight.sunrise)
  })
})
