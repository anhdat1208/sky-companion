import { describe, expect, it } from 'vitest'
import {
  magnitudeToLabel,
  estimateIssMagnitude,
  getIssBrightness
} from '../../../lib/iss/brightness'

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
