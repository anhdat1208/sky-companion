import { describe, expect, it, vi, afterEach } from 'vitest'
import { ref } from 'vue'
import type { Coordinates } from '../../types/location'
import { useTelescope } from '../../app/composables/useTelescope'
import * as ranking from '../../lib/telescope/ranking'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useTelescope', () => {
  it('ranks targets and builds guidance for a selected target', () => {
    const coordinates = ref<Coordinates | null>({ lat: 21.0285, lng: 105.8542 })
    const api = useTelescope(coordinates, new Date('2026-08-03T14:00:00Z'))

    expect(api.rankedTargets.value.length).toBe(9)
    expect(api.selectedProfile.value).not.toBeNull()
    expect(api.error.value).toBeNull()
    api.selectTarget(api.rankedTargets.value[0]!.target.id)
    expect(api.selectedDetail.value).not.toBeNull()
    expect(['aligning', 'locked', 'below-horizon']).toContain(api.guidance.value.status)
    expect(api.starHopSteps.value).toEqual([])
  })

  it('clears or reselects when selectedTargetId is missing from rankedTargets', () => {
    const coordinates = ref<Coordinates | null>({ lat: 21.0285, lng: 105.8542 })
    const api = useTelescope(coordinates, new Date('2026-08-03T14:00:00Z'))

    expect(api.selectedTargetId.value).not.toBeNull()
    api.selectTarget('not-a-real-target')
    api.refresh()
    expect(api.selectedTargetId.value).toBe(api.rankedTargets.value[0]!.target.id)

    coordinates.value = null
    expect(api.rankedTargets.value).toEqual([])
    expect(api.selectedTargetId.value).toBeNull()
  })

  it('surfaces ranking failures as error and recovers on refresh', () => {
    const coordinates = ref<Coordinates | null>({ lat: 21.0285, lng: 105.8542 })
    const rankSpy = vi.spyOn(ranking, 'rankTonightTargets')
      .mockImplementationOnce(() => {
        throw new Error('boom ranking')
      })

    const api = useTelescope(coordinates, new Date('2026-08-03T14:00:00Z'))

    expect(api.error.value).toBe('boom ranking')
    expect(api.rankedTargets.value).toEqual([])
    expect(api.selectedDetail.value).toBeNull()

    rankSpy.mockRestore()
    api.refresh()

    expect(api.error.value).toBeNull()
    expect(api.rankedTargets.value.length).toBe(9)
  })

  it('exposes switchToManualPointing to leave sensor mode', () => {
    const coordinates = ref<Coordinates | null>({ lat: 21.0285, lng: 105.8542 })
    const api = useTelescope(coordinates, new Date('2026-08-03T14:00:00Z'))

    api.pointing.value = { azimuth: 40, altitude: 20, source: 'sensor' }
    api.switchToManualPointing()

    expect(api.pointing.value).toMatchObject({
      azimuth: 40,
      altitude: 20,
      source: 'manual'
    })
    expect(typeof api.disableSensor).toBe('function')
  })
})
