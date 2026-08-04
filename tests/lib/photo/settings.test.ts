import { describe, expect, it } from 'vitest'
import {
  getCameraSettings,
  lensLabelFromSettings
} from '../../../lib/photo/settings'
import type { CameraSubject } from '../../../types/photo'

const SUBJECTS: CameraSubject[] = [
  'milky-way',
  'moon',
  'planet',
  'golden-hour',
  'blue-hour'
]

describe('getCameraSettings', () => {
  it('returns complete settings for every subject', () => {
    for (const subject of SUBJECTS) {
      const s = getCameraSettings(subject)
      expect(s.iso.min).toBeGreaterThan(0)
      expect(s.iso.max).toBeGreaterThanOrEqual(s.iso.min)
      expect(s.aperture.length).toBeGreaterThan(0)
      expect(s.exposureTime.length).toBeGreaterThan(0)
      expect(s.focalLengthMm.min).toBeGreaterThan(0)
      expect(typeof s.tripodRequired).toBe('boolean')
      expect(typeof s.remoteShutter).toBe('boolean')
    }
  })

  it('recommends wide lens for milky way and tripod', () => {
    const s = getCameraSettings('milky-way')
    expect(s.focalLengthMm.max).toBeLessThanOrEqual(50)
    expect(s.tripodRequired).toBe(true)
    expect(s.remoteShutter).toBe(true)
    expect(lensLabelFromSettings(s, 'wide')).toMatch(/mm/)
  })
})
