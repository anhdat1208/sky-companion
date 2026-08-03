// tests/lib/telescope/guidance.test.ts
import { describe, expect, it } from 'vitest'
import { buildGuidanceInstruction } from '../../../lib/telescope/guidance'

const pointing = { azimuth: 100, altitude: 20, source: 'manual' as const }
const fov = { trueFovDeg: 4 } // lockThreshold = 1

describe('buildGuidanceInstruction', () => {
  it('returns need-target when target missing', () => {
    const result = buildGuidanceInstruction({
      targetAltitude: null,
      targetAzimuth: null,
      pointing,
      fieldOfView: fov
    })
    expect(result.status).toBe('need-target')
    expect(result.locked).toBe(false)
  })

  it('returns below-horizon when target altitude is negative', () => {
    const result = buildGuidanceInstruction({
      targetAltitude: -5,
      targetAzimuth: 120,
      pointing,
      fieldOfView: fov
    })
    expect(result.status).toBe('below-horizon')
  })

  it('asks to rotate left when target is counterclockwise', () => {
    const result = buildGuidanceInstruction({
      targetAltitude: 20,
      targetAzimuth: 90,
      pointing,
      fieldOfView: fov
    })
    expect(result.deltaAzimuthDeg).toBe(-10)
    expect(result.messages.some(m => m.includes('Xoay trái'))).toBe(true)
  })

  it('asks to raise telescope when target is higher', () => {
    const result = buildGuidanceInstruction({
      targetAltitude: 35,
      targetAzimuth: 100,
      pointing,
      fieldOfView: fov
    })
    expect(result.deltaAltitudeDeg).toBe(15)
    expect(result.messages.some(m => m.includes('Nâng'))).toBe(true)
  })

  it('locks when within FOV-derived threshold', () => {
    const result = buildGuidanceInstruction({
      targetAltitude: 20.4,
      targetAzimuth: 100.5,
      pointing,
      fieldOfView: fov
    })
    expect(result.status).toBe('locked')
    expect(result.locked).toBe(true)
    expect(result.messages).toContain('Target Locked')
    expect(result.messages.some(m => m.includes('Đã khóa mục tiêu'))).toBe(true)
  })
})
