import { describe, expect, it } from 'vitest'
import { getMoonInfo } from '../../../lib/moon/snapshot'

describe('getMoonInfo', () => {
  it('returns MoonInfo shape with finite metrics', () => {
    const moon = getMoonInfo(21.0285, 105.8542, new Date('2026-08-03T14:00:00Z'))
    expect(typeof moon.phase).toBe('string')
    expect(Number.isFinite(moon.altitude)).toBe(true)
    expect(Number.isFinite(moon.azimuth)).toBe(true)
    expect(moon.illuminatedPercentage).toBeGreaterThanOrEqual(0)
    expect(moon.illuminatedPercentage).toBeLessThanOrEqual(100)
    expect(moon).toHaveProperty('riseTime')
    expect(moon).toHaveProperty('setTime')
  })
})
