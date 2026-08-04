import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { useGeolocationInput } from '../../app/composables/useGeolocationInput'

const locationMessages: Record<string, string> = {
  'errors.location.permissionDenied': 'Location permission was denied.',
  'errors.location.unavailable': 'Unable to determine your location.',
  'errors.location.timeout': 'Location request timed out.',
  'errors.location.unsupported': 'Geolocation is not supported by this browser.',
  'errors.location.unknown': 'Failed to get your location.'
}

beforeEach(() => {
  vi.stubGlobal('useI18n', () => ({
    t: (key: string) => locationMessages[key] ?? key
  }))
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('useGeolocationInput', () => {
  it('sets coordinates via manual fallback and clears errors', () => {
    const geo = useGeolocationInput()
    geo.permissionDenied.value = true
    geo.error.value = 'Location permission was denied.'

    const coords = geo.setManualCoordinates(10.7769, 106.7009)

    expect(coords).toEqual({ lat: 10.7769, lng: 106.7009 })
    expect(geo.coordinates.value).toEqual({ lat: 10.7769, lng: 106.7009 })
    expect(geo.permissionDenied.value).toBe(false)
    expect(geo.error.value).toBeNull()
    expect(geo.loading.value).toBe(false)
  })

  it('marks permissionDenied when browser geolocation is denied', async () => {
    vi.stubGlobal('navigator', {
      geolocation: {
        getCurrentPosition: (
          _success: PositionCallback,
          error: PositionErrorCallback
        ) => {
          error({
            code: 1,
            PERMISSION_DENIED: 1,
            POSITION_UNAVAILABLE: 2,
            TIMEOUT: 3,
            message: 'User denied Geolocation'
          } as GeolocationPositionError)
        }
      }
    })

    const geo = useGeolocationInput()
    const result = await geo.requestLocation()

    expect(result).toBeNull()
    expect(geo.coordinates.value).toBeNull()
    expect(geo.permissionDenied.value).toBe(true)
    expect(geo.error.value).toBe('Location permission was denied.')
    expect(geo.loading.value).toBe(false)
  })

  it('stores GPS coordinates on success', async () => {
    vi.stubGlobal('navigator', {
      geolocation: {
        getCurrentPosition: (success: PositionCallback) => {
          success({
            coords: {
              latitude: 21.0285,
              longitude: 105.8542,
              accuracy: 10,
              altitude: null,
              altitudeAccuracy: null,
              heading: null,
              speed: null
            },
            timestamp: Date.now()
          } as GeolocationPosition)
        }
      }
    })

    const geo = useGeolocationInput()
    const result = await geo.requestLocation()

    expect(result).toEqual({ lat: 21.0285, lng: 105.8542 })
    expect(geo.coordinates.value).toEqual({ lat: 21.0285, lng: 105.8542 })
    expect(geo.permissionDenied.value).toBe(false)
    expect(geo.error.value).toBeNull()
  })
})
