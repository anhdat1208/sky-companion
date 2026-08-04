import { describe, expect, it } from 'vitest'
import { buildPhotoTimeline } from '../../../lib/photo/timeline'
import { getNightWindow } from '../../../lib/photo/nightWindow'
import {
  getBlueHourInfo,
  getGoldenHourInfo,
  getTwilightInfo
} from '../../../lib/photo/sunEvents'

describe('buildPhotoTimeline', () => {
  it('sorts markers and includes dark-sky when astronomical band exists', () => {
    const lat = 21.0285
    const lng = 105.8542
    const when = new Date(Date.UTC(2026, 7, 3, 8, 0, 0))
    const window = getNightWindow(lat, lng, when)!
    const golden = getGoldenHourInfo(lat, lng, window)
    const blue = getBlueHourInfo(lat, lng, window)
    const twilight = getTwilightInfo(lat, lng, window)
    const timeline = buildPhotoTimeline({
      window,
      golden,
      blue,
      twilight,
      moonrise: null,
      moonset: null,
      milkyWayPeak: null,
      planetMarkerAt: null,
      planetMarkerEnd: null
    })
    const times = timeline.markers.map((m) => new Date(m.at).getTime())
    expect([...times].sort((a, b) => a - b)).toEqual(times)
    expect(timeline.markers.some((m) => m.kind === 'dark-sky')).toBe(true)
  })
})
