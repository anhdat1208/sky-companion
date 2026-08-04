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
})
