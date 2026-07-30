import { $fetch } from 'ofetch'
import { ref } from 'vue'
import type { SkySnapshot } from '../../types/astronomy'
import type { Coordinates } from '../../types/location'

const FETCH_SKY_FAILED = 'Failed to fetch sky data.'

function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null) {
    const maybeData = error as {
      data?: { message?: unknown }
      statusMessage?: unknown
      message?: unknown
    }

    if (typeof maybeData.data?.message === 'string' && maybeData.data.message.length > 0) {
      return maybeData.data.message
    }

    if (typeof maybeData.statusMessage === 'string' && maybeData.statusMessage.length > 0) {
      return maybeData.statusMessage
    }

    if (typeof maybeData.message === 'string' && maybeData.message.length > 0) {
      return maybeData.message
    }
  }

  return FETCH_SKY_FAILED
}

export function useSkyData() {
  const snapshot = ref<SkySnapshot | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchSky(coords: Coordinates, time?: string): Promise<SkySnapshot | null> {
    loading.value = true
    error.value = null

    try {
      const data = await $fetch<SkySnapshot>('/api/sky', {
        query: {
          lat: coords.lat,
          lng: coords.lng,
          ...(time ? { time } : {})
        }
      })

      snapshot.value = data
      return data
    } catch (caught) {
      error.value = getErrorMessage(caught)
      snapshot.value = null
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    snapshot,
    loading,
    error,
    fetchSky
  }
}
