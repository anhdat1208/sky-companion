import { afterEach, describe, expect, it, vi } from 'vitest'
import type { SkySnapshot } from '../../types/astronomy'

const { fetchMock } = vi.hoisted(() => ({
  fetchMock: vi.fn()
}))

vi.mock('ofetch', () => ({
  $fetch: fetchMock
}))

import { useSkyData } from '../../app/composables/useSkyData'

afterEach(() => {
  fetchMock.mockReset()
})

function createSnapshot(): SkySnapshot {
  return {
    timestamp: '2026-07-30T12:00:00.000Z',
    moon: {
      altitude: 45,
      azimuth: 120,
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
      { name: 'Mars', altitude: -10, azimuth: 200, isVisible: false }
    ],
    constellation: { name: 'Orion' },
    milkyWayVisibility: 'Good',
    directionToLook: 'South-East'
  }
}

describe('useSkyData', () => {
  it('stores a typed sky snapshot on successful fetch', async () => {
    const snapshot = createSnapshot()
    fetchMock.mockResolvedValueOnce(snapshot)

    const sky = useSkyData()
    const result = await sky.fetchSky({ lat: 10.7769, lng: 106.7009 })

    expect(fetchMock).toHaveBeenCalledWith('/api/sky', {
      query: {
        lat: 10.7769,
        lng: 106.7009
      }
    })
    expect(result).toEqual(snapshot)
    expect(sky.snapshot.value).toEqual(snapshot)
    expect(sky.error.value).toBeNull()
    expect(sky.loading.value).toBe(false)
  })

  it('exposes an error and clears snapshot when fetch fails', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Network down'))

    const sky = useSkyData()
    sky.snapshot.value = createSnapshot()

    const result = await sky.fetchSky({ lat: 10.7769, lng: 106.7009 })

    expect(result).toBeNull()
    expect(sky.snapshot.value).toBeNull()
    expect(sky.error.value).toBe('Network down')
    expect(sky.loading.value).toBe(false)
  })

  it('prefers API error message payloads when present', async () => {
    fetchMock.mockRejectedValueOnce({
      data: { message: 'Invalid coordinates or time parameter.' },
      message: 'Bad Request'
    })

    const sky = useSkyData()
    await sky.fetchSky({ lat: 100, lng: 0 })

    expect(sky.error.value).toBe('Invalid coordinates or time parameter.')
  })
})
