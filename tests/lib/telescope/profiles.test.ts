// tests/lib/telescope/profiles.test.ts
import { describe, expect, it } from 'vitest'
import {
  computeMagnification,
  computeTrueFov,
  getMockProfiles,
  lockThresholdDeg
} from '../../../lib/telescope/profiles'

describe('optics helpers', () => {
  it('computes magnification from focal lengths', () => {
    expect(computeMagnification(
      { id: 't', name: 'T', apertureMm: 130, focalLengthMm: 650, type: 'reflector' },
      { id: 'e', name: 'E', focalLengthMm: 25, apparentFovDeg: 50 }
    )).toEqual({ value: 26 })
  })

  it('computes true FOV from apparent FOV / magnification', () => {
    expect(computeTrueFov(
      { id: 'e', name: 'E', focalLengthMm: 25, apparentFovDeg: 50 },
      { value: 26 }
    ).trueFovDeg).toBeCloseTo(50 / 26, 5)
  })

  it('clamps lock threshold between 0.5 and 2.0', () => {
    expect(lockThresholdDeg(1)).toBe(0.5)
    expect(lockThresholdDeg(4)).toBe(1)
    expect(lockThresholdDeg(20)).toBe(2)
  })

  it('returns three mock profiles including binoculars', () => {
    const profiles = getMockProfiles()
    expect(profiles.length).toBeGreaterThanOrEqual(3)
    expect(profiles.some(p => p.telescope.type === 'binocular')).toBe(true)
  })
})
