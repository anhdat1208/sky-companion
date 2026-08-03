import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import type { Coordinates } from '../../types/location'
import { useTelescope } from '../../app/composables/useTelescope'

describe('useTelescope', () => {
  it('ranks targets and builds guidance for a selected target', () => {
    const coordinates = ref<Coordinates | null>({ lat: 21.0285, lng: 105.8542 })
    const api = useTelescope(coordinates, new Date('2026-08-03T14:00:00Z'))

    expect(api.rankedTargets.value.length).toBe(9)
    expect(api.selectedProfile.value).not.toBeNull()
    api.selectTarget(api.rankedTargets.value[0]!.target.id)
    expect(api.selectedDetail.value).not.toBeNull()
    expect(['aligning', 'locked', 'below-horizon']).toContain(api.guidance.value.status)
    expect(api.starHopSteps.value).toEqual([])
  })
})
