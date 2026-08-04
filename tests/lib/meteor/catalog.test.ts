// tests/lib/meteor/catalog.test.ts
import { describe, expect, it } from 'vitest'
import { METEOR_SHOWER_CATALOG, getShowerDefinition } from '../../../lib/meteor/catalog'

const EXPECTED_IDS = [
  'quadrantids',
  'lyrids',
  'eta-aquariids',
  'perseids',
  'orionids',
  'leonids',
  'geminids',
  'ursids'
] as const

describe('meteor catalog', () => {
  it('contains exactly the eight major showers with unique ids', () => {
    expect(METEOR_SHOWER_CATALOG).toHaveLength(8)
    const ids = METEOR_SHOWER_CATALOG.map((s) => s.id)
    expect(ids).toEqual([...EXPECTED_IDS])
    expect(new Set(ids).size).toBe(8)
  })

  it('has required IMO fields populated for every shower', () => {
    for (const shower of METEOR_SHOWER_CATALOG) {
      expect(shower.name.length).toBeGreaterThan(0)
      expect(shower.iauCode.length).toBeGreaterThan(0)
      expect(shower.zhr).toBeGreaterThan(0)
      expect(Number.isFinite(shower.peakSolarLongitudeDeg)).toBe(true)
      expect(Number.isFinite(shower.activeSolarLongitudeDeg.start)).toBe(true)
      expect(Number.isFinite(shower.activeSolarLongitudeDeg.end)).toBe(true)
      expect(Number.isFinite(shower.radiantRaHours)).toBe(true)
      expect(Number.isFinite(shower.radiantDecDeg)).toBe(true)
      expect(shower.speedKmS).toBeGreaterThan(0)
      expect(shower.peakDurationHours).toBeGreaterThan(0)
      expect(shower.sourceNote.toLowerCase()).toContain('imo')
    }
  })

  it('looks up definitions by id', () => {
    expect(getShowerDefinition('perseids').name).toBe('Perseids')
    expect(() => getShowerDefinition('nope' as never)).toThrow()
  })
})
