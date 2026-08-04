import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

const storage = new Map<string, string>()
const stateMap = new Map<string, ReturnType<typeof ref>>()

beforeEach(() => {
  storage.clear()
  stateMap.clear()
  vi.resetModules()
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      storage.set(key, value)
    },
    removeItem: (key: string) => {
      storage.delete(key)
    }
  })
  vi.stubGlobal('useState', <T>(key: string, init: () => T) => {
    if (!stateMap.has(key)) {
      stateMap.set(key, ref(init()))
    }
    return stateMap.get(key)!
  })
  vi.stubGlobal('useI18n', () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'units.km': 'km',
        'units.mi': 'mi',
        'units.kmh': 'km/h',
        'units.mph': 'mph',
        'units.celsius': '°C',
        'units.fahrenheit': '°F'
      }
      return map[key] ?? key
    }
  }))
})

describe('useUnits', () => {
  it('defaults to metric and formats km', async () => {
    const { useUnits } = await import('../../app/composables/useUnits')
    const units = useUnits()
    expect(units.unitSystem.value).toBe('metric')
    expect(units.formatDistanceFromKm(10)).toContain('km')
  })

  it('persists imperial preference and formats miles', async () => {
    const { useUnits } = await import('../../app/composables/useUnits')
    const units = useUnits()
    units.setUnitSystem('imperial')
    expect(storage.get('sky_companion_units')).toBe('imperial')
    expect(units.formatDistanceFromKm(1.609344)).toMatch(/1(\.0+)? mi/)
  })
})
