import { ref } from 'vue'
import type { Coordinates } from '../../types/location'

function mapGeolocationError(
  error: GeolocationPositionError,
  t: (key: string) => string
): {
  permissionDenied: boolean
  message: string
} {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return {
        permissionDenied: true,
        message: t('errors.location.permissionDenied')
      }
    case error.POSITION_UNAVAILABLE:
      return {
        permissionDenied: false,
        message: t('errors.location.unavailable')
      }
    case error.TIMEOUT:
      return {
        permissionDenied: false,
        message: t('errors.location.timeout')
      }
    default:
      return {
        permissionDenied: false,
        message: t('errors.location.unknown')
      }
  }
}

export function useGeolocationInput() {
  const { t } = useI18n()
  const coordinates = ref<Coordinates | null>(null)
  const loading = ref(false)
  const permissionDenied = ref(false)
  const error = ref<string | null>(null)

  async function requestLocation(): Promise<Coordinates | null> {
    loading.value = true
    permissionDenied.value = false
    error.value = null

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      loading.value = false
      error.value = t('errors.location.unsupported')
      return null
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10_000,
          maximumAge: 60_000
        })
      })

      const next: Coordinates = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }

      coordinates.value = next
      return next
    } catch (caught) {
      if (isGeolocationPositionError(caught)) {
        const mapped = mapGeolocationError(caught, t)
        permissionDenied.value = mapped.permissionDenied
        error.value = mapped.message
      } else {
        error.value = t('errors.location.unknown')
      }

      return null
    } finally {
      loading.value = false
    }
  }

  function setManualCoordinates(lat: number, lng: number): Coordinates {
    const next: Coordinates = { lat, lng }
    coordinates.value = next
    permissionDenied.value = false
    error.value = null
    return next
  }

  return {
    coordinates,
    loading,
    permissionDenied,
    error,
    requestLocation,
    setManualCoordinates
  }
}

function isGeolocationPositionError(error: unknown): error is GeolocationPositionError {
  return (
    typeof error === 'object'
    && error !== null
    && 'code' in error
    && typeof (error as GeolocationPositionError).code === 'number'
  )
}
