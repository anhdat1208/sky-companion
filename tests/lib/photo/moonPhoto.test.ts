import { describe, expect, it } from 'vitest'
import { buildMoonPhotoInfo } from '../../../lib/photo/moonPhoto'
import { getNightWindow } from '../../../lib/photo/nightWindow'

describe('buildMoonPhotoInfo', () => {
  it('returns phase illumination and moon settings', () => {
    const lat = 21.0285
    const lng = 105.8542
    const when = new Date(Date.UTC(2026, 7, 3, 12, 0, 0))
    const night = getNightWindow(lat, lng, when)
    const info = buildMoonPhotoInfo(lat, lng, when, night)
    expect(info.phase.length).toBeGreaterThan(0)
    expect(info.illuminationPct).toBeGreaterThanOrEqual(0)
    expect(info.settings.focalLengthMm.min).toBeGreaterThanOrEqual(200)
    expect(info.recommendedLensLabel).toMatch(/mm/)
  })
})
