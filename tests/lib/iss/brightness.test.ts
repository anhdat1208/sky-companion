import { describe, expect, it } from 'vitest'
import {
  computeCurrentBrightness,
  magnitudeToLabel,
  estimateIssMagnitude,
  getIssBrightness
} from '../../../lib/iss/brightness'
import { readFallbackTle } from '../../../lib/iss/tle'

describe('magnitudeToLabel', () => {
  it('maps thresholds', () => {
    expect(magnitudeToLabel(-3, { sunlit: true, darkSky: true })).toBe('Bright')
    expect(magnitudeToLabel(-1, { sunlit: true, darkSky: true })).toBe('Moderate')
    expect(magnitudeToLabel(2, { sunlit: true, darkSky: true })).toBe('Dim')
    expect(magnitudeToLabel(4, { sunlit: true, darkSky: true })).toBe('Not Visible')
    expect(magnitudeToLabel(-3, { sunlit: false, darkSky: true })).toBe('Not Visible')
    expect(magnitudeToLabel(-3, { sunlit: true, darkSky: false })).toBe('Not Visible')
  })
})

describe('estimateIssMagnitude', () => {
  it('returns a finite number that brightens when closer', () => {
    const far = estimateIssMagnitude(1500, 60)
    const near = estimateIssMagnitude(500, 60)
    expect(Number.isFinite(far)).toBe(true)
    expect(near).toBeLessThan(far)
  })
})

describe('getIssBrightness', () => {
  it('returns magnitude and a brightness label', () => {
    const result = getIssBrightness({
      rangeKm: 800,
      phaseAngleDeg: 60,
      sunlit: true,
      sunAltitudeDeg: -20
    })
    expect(typeof result.magnitude).toBe('number')
    expect(['Bright', 'Moderate', 'Dim', 'Not Visible']).toContain(result.label)
  })
})

describe('computeCurrentBrightness', () => {
  it('returns IssBrightness for observer geometry', () => {
    const tle = readFallbackTle()
    const result = computeCurrentBrightness(
      tle,
      10.7769,
      106.7009,
      new Date('2026-07-30T12:00:00.000Z')
    )
    expect(typeof result.magnitude).toBe('number')
    expect(['Bright', 'Moderate', 'Dim', 'Not Visible']).toContain(result.label)
  })
})
