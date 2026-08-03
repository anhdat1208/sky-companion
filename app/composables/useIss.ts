import { $fetch } from 'ofetch'
import { getCurrentInstance, onMounted, onUnmounted, ref, type Ref } from 'vue'
import type { IssSnapshot } from '../../types/iss'
import type { Coordinates } from '../../types/location'

const POLL_MS = 20_000
const FETCH_ISS_FAILED = 'Failed to fetch ISS data.'

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

  return FETCH_ISS_FAILED
}

export function useIss(coordinates: Ref<Coordinates | null>) {
  const snapshot = ref<IssSnapshot | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  let pollTimer: ReturnType<typeof setInterval> | null = null
  let requestId = 0

  async function refresh(): Promise<IssSnapshot | null> {
    const thisRequest = ++requestId
    loading.value = true
    error.value = null

    try {
      const coords = coordinates.value
      const data = await $fetch<IssSnapshot>('/api/iss', {
        query: coords
          ? { lat: coords.lat, lng: coords.lng }
          : undefined
      })

      if (thisRequest !== requestId) {
        return snapshot.value
      }

      snapshot.value = data
      return data
    } catch (caught) {
      if (thisRequest !== requestId) {
        return snapshot.value
      }

      error.value = getErrorMessage(caught)
      // Keep previous snapshot if one exists; only leave null when never loaded.
      return snapshot.value
    } finally {
      if (thisRequest === requestId) {
        loading.value = false
      }
    }
  }

  function stopPolling() {
    if (pollTimer !== null) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  function startPolling() {
    stopPolling()
    if (typeof document !== 'undefined' && document.hidden) {
      return
    }

    pollTimer = setInterval(() => {
      void refresh()
    }, POLL_MS)
  }

  function onVisibilityChange() {
    if (typeof document === 'undefined') {
      return
    }

    if (document.hidden) {
      stopPolling()
    } else {
      startPolling()
    }
  }

  if (typeof document !== 'undefined') {
    startPolling()
    document.addEventListener('visibilitychange', onVisibilityChange)
  }

  if (getCurrentInstance()) {
    onMounted(() => {
      void refresh()
    })
    onUnmounted(() => {
      stopPolling()
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', onVisibilityChange)
      }
    })
  }

  return {
    snapshot,
    loading,
    error,
    refresh,
    stopPolling
  }
}
