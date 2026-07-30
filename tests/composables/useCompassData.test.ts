import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { useCompassData } from '../../app/composables/useCompassData'
import type { SkySnapshot } from '../../types/astronomy'

function createSnapshot(overrides: Partial<SkySnapshot> = {}): SkySnapshot {
  return {
    timestamp: '2026-07-30T12:00:00.000Z',
    moon: {
      altitude: 45,
      azimuth: 135,
      riseTime: null,
      setTime: null,
      illuminatedPercentage: 62,
      phase: 'Waxing Gibbous'
    },
    sun: {
      altitude: 60,
      azimuth: 180,
      sunrise: null,
      sunset: null
    },
    planets: [
      { name: 'Venus', altitude: 20, azimuth: 90, isVisible: true },
      { name: 'Mars', altitude: -10, azimuth: 200, isVisible: false },
      { name: 'Jupiter', altitude: 35, azimuth: 250, isVisible: true }
    ],
    constellation: { name: 'Orion' },
    milkyWayVisibility: 'Good',
    directionToLook: 'South-East',
    ...overrides
  }
}

describe('useCompassData', () => {
  it('derives moon azimuth and visible planets from a snapshot', () => {
    const snapshot = ref<SkySnapshot | null>(createSnapshot())
    const { moonAzimuth, visiblePlanets } = useCompassData(snapshot)

    expect(moonAzimuth.value).toBe(135)
    expect(visiblePlanets.value).toEqual([
      { name: 'Venus', altitude: 20, azimuth: 90, isVisible: true },
      { name: 'Jupiter', altitude: 35, azimuth: 250, isVisible: true }
    ])
  })

  it('falls back safely when snapshot is null', () => {
    const snapshot = ref<SkySnapshot | null>(null)
    const { moonAzimuth, visiblePlanets } = useCompassData(snapshot)

    expect(moonAzimuth.value).toBe(0)
    expect(visiblePlanets.value).toEqual([])
  })
})
