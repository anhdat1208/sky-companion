import { describe, expect, it } from 'vitest'
import { getNightWindow } from '../../../lib/photo/nightWindow'
import {
  getBlueHourInfo,
  getGoldenHourInfo,
  getTwilightInfo
} from '../../../lib/photo/sunEvents'

const LAT = 21.0285
const LNG = 105.8542
const WHEN = new Date(Date.UTC(2026, 7, 3, 8, 0, 0))

describe('sunEvents', () => {
  it('orders evening golden before blue before astronomical dusk', () => {
    const night = getNightWindow(LAT, LNG, WHEN)!
    const golden = getGoldenHourInfo(LAT, LNG, night)
    const blue = getBlueHourInfo(LAT, LNG, night)
    const twilight = getTwilightInfo(LAT, LNG, night)

    expect(golden.evening).not.toBeNull()
    expect(blue.evening).not.toBeNull()
    expect(twilight.astronomical.evening).not.toBeNull()

    expect(new Date(golden.evening!.start).getTime()).toBeLessThan(
      new Date(blue.evening!.start).getTime()
    )
    expect(new Date(blue.evening!.end!).getTime()).toBeLessThanOrEqual(
      new Date(twilight.astronomical.evening!.end!).getTime()
    )
    expect(golden.durationMinutes).toBeGreaterThan(0)
  })
})
