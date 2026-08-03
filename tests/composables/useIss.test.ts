import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import type { IssSnapshot } from '../../types/iss'
import type { Coordinates } from '../../types/location'

const { fetchMock } = vi.hoisted(() => ({
  fetchMock: vi.fn()
}))

vi.mock('ofetch', () => ({
  $fetch: fetchMock
}))

import { useIss } from '../../app/composables/useIss'

const POLL_MS = 20_000

function createSnapshot(): IssSnapshot {
  return {
    position: {
      timestamp: '2026-08-02T12:00:00.000Z',
      latitude: 10.5,
      longitude: 106.7,
      altitudeKm: 420,
      velocityKph: 27600
    },
    groundTrack: [],
    nextPass: null,
    brightness: null,
    tleEpoch: '2026-08-02T00:00:00.000Z',
    source: 'fallback-tle'
  }
}

type VisibilityListener = () => void

function stubDocument(hidden = false) {
  const listeners = new Set<VisibilityListener>()
  let isHidden = hidden

  const documentStub = {
    get hidden() {
      return isHidden
    },
    get visibilityState() {
      return isHidden ? 'hidden' : 'visible'
    },
    setHidden(next: boolean) {
      isHidden = next
    },
    addEventListener: vi.fn((type: string, handler: VisibilityListener) => {
      if (type === 'visibilitychange') {
        listeners.add(handler)
      }
    }),
    removeEventListener: vi.fn((type: string, handler: VisibilityListener) => {
      if (type === 'visibilitychange') {
        listeners.delete(handler)
      }
    }),
    dispatchVisibilityChange() {
      for (const handler of listeners) {
        handler()
      }
    }
  }

  vi.stubGlobal('document', documentStub)
  return documentStub
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  fetchMock.mockReset()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('useIss', () => {
  it('stores a typed ISS snapshot on successful refresh without coordinates', async () => {
    stubDocument()
    const snapshot = createSnapshot()
    fetchMock.mockResolvedValueOnce(snapshot)

    const coords = ref<Coordinates | null>(null)
    const iss = useIss(coords)
    const result = await iss.refresh()

    expect(fetchMock).toHaveBeenCalledWith('/api/iss', {
      query: undefined
    })
    expect(result).toEqual(snapshot)
    expect(iss.snapshot.value).toEqual(snapshot)
    expect(iss.error.value).toBeNull()
    expect(iss.loading.value).toBe(false)

    iss.stopPolling()
  })

  it('sends lat/lng query when coordinates are present', async () => {
    stubDocument()
    const snapshot = createSnapshot()
    fetchMock.mockResolvedValueOnce(snapshot)

    const coords = ref<Coordinates | null>({ lat: 10.7769, lng: 106.7009 })
    const iss = useIss(coords)
    await iss.refresh()

    expect(fetchMock).toHaveBeenCalledWith('/api/iss', {
      query: {
        lat: 10.7769,
        lng: 106.7009
      }
    })

    iss.stopPolling()
  })

  it('keeps previous snapshot and sets error when refresh fails', async () => {
    stubDocument()
    const previous = createSnapshot()
    fetchMock.mockRejectedValueOnce(new Error('Network down'))

    const iss = useIss(ref<Coordinates | null>(null))
    iss.snapshot.value = previous

    const result = await iss.refresh()

    expect(result).toEqual(previous)
    expect(iss.snapshot.value).toEqual(previous)
    expect(iss.error.value).toBe('Network down')
    expect(iss.loading.value).toBe(false)

    iss.stopPolling()
  })

  it('leaves snapshot null when first refresh fails with no prior data', async () => {
    stubDocument()
    fetchMock.mockRejectedValueOnce(new Error('Network down'))

    const iss = useIss(ref<Coordinates | null>(null))
    const result = await iss.refresh()

    expect(result).toBeNull()
    expect(iss.snapshot.value).toBeNull()
    expect(iss.error.value).toBe('Network down')

    iss.stopPolling()
  })

  it('ignores a stale failed response after a newer success', async () => {
    stubDocument()
    let rejectSlow: (reason?: unknown) => void = () => {}
    const slowFailure = new Promise<IssSnapshot>((_resolve, reject) => {
      rejectSlow = reject
    })

    const fresh = createSnapshot()
    fresh.position = { ...fresh.position, latitude: 99 }

    fetchMock
      .mockReturnValueOnce(slowFailure)
      .mockResolvedValueOnce(fresh)

    const iss = useIss(ref<Coordinates | null>(null))
    const first = iss.refresh()
    const second = await iss.refresh()

    expect(second).toEqual(fresh)
    expect(iss.snapshot.value).toEqual(fresh)
    expect(iss.error.value).toBeNull()

    rejectSlow(new Error('stale failure'))
    await first

    expect(iss.snapshot.value).toEqual(fresh)
    expect(iss.error.value).toBeNull()

    iss.stopPolling()
  })

  it('prefers API error message payloads when present', async () => {
    stubDocument()
    fetchMock.mockRejectedValueOnce({
      data: { message: 'Invalid coordinates.' },
      message: 'Bad Request'
    })

    const iss = useIss(ref<Coordinates | null>(null))
    await iss.refresh()

    expect(iss.error.value).toBe('Invalid coordinates.')

    iss.stopPolling()
  })

  it('polls every 20 seconds while visible', async () => {
    stubDocument(false)
    fetchMock.mockResolvedValue(createSnapshot())

    const iss = useIss(ref<Coordinates | null>(null))
    expect(fetchMock).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(POLL_MS)
    expect(fetchMock).toHaveBeenCalledTimes(1)

    await vi.advanceTimersByTimeAsync(POLL_MS)
    expect(fetchMock).toHaveBeenCalledTimes(2)

    iss.stopPolling()
  })

  it('pauses polling when document is hidden and resumes when visible', async () => {
    const doc = stubDocument(false)
    fetchMock.mockResolvedValue(createSnapshot())

    const iss = useIss(ref<Coordinates | null>(null))

    doc.setHidden(true)
    doc.dispatchVisibilityChange()

    await vi.advanceTimersByTimeAsync(POLL_MS * 2)
    expect(fetchMock).not.toHaveBeenCalled()

    doc.setHidden(false)
    doc.dispatchVisibilityChange()

    await vi.advanceTimersByTimeAsync(POLL_MS)
    expect(fetchMock).toHaveBeenCalledTimes(1)

    iss.stopPolling()
  })

  it('stopPolling clears the interval', async () => {
    stubDocument(false)
    fetchMock.mockResolvedValue(createSnapshot())

    const iss = useIss(ref<Coordinates | null>(null))
    iss.stopPolling()

    await vi.advanceTimersByTimeAsync(POLL_MS * 2)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
