import { describe, expect, it } from 'vitest'
import { getCatalogTargets } from '../../../lib/telescope/catalog'
import { getTargetHorizontal, getTargetRiseSet } from '../../../lib/telescope/position'

describe('getTargetHorizontal', () => {
  it('returns finite alt/az for the Moon from Hanoi at a fixed time', () => {
    const moon = getCatalogTargets().find(t => t.id === 'moon')!
    const when = new Date('2026-08-03T14:00:00Z')
    const pos = getTargetHorizontal(moon, 21.0285, 105.8542, when)

    expect(Number.isFinite(pos.altitude)).toBe(true)
    expect(Number.isFinite(pos.azimuth)).toBe(true)
    expect(pos.azimuth).toBeGreaterThanOrEqual(0)
    expect(pos.azimuth).toBeLessThan(360)
  })

  it('returns finite alt/az for Andromeda from catalog RA/Dec', () => {
    const m31 = getCatalogTargets().find(t => t.id === 'm31')!
    const when = new Date('2026-08-03T14:00:00Z')
    const pos = getTargetHorizontal(m31, 21.0285, 105.8542, when)

    expect(Number.isFinite(pos.altitude)).toBe(true)
    expect(Number.isFinite(pos.azimuth)).toBe(true)
  })
})

describe('getTargetRiseSet', () => {
  it('returns ISO strings or null for Moon', () => {
    const moon = getCatalogTargets().find(t => t.id === 'moon')!
    const result = getTargetRiseSet(moon, 21.0285, 105.8542, new Date('2026-08-03T00:00:00Z'))

    if (result.riseTime !== null) {
      expect(Number.isNaN(Date.parse(result.riseTime))).toBe(false)
    }
    if (result.setTime !== null) {
      expect(Number.isNaN(Date.parse(result.setTime))).toBe(false)
    }
  })
})
