import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import type { Coordinates } from '../../types/location'
import { useAstroPhotography } from '../../app/composables/useAstroPhotography'

describe('useAstroPhotography', () => {
  const fixed = new Date(Date.UTC(2026, 7, 3, 8, 0, 0))

  it('needs location and null score without coordinates', () => {
    const coordinates = ref<Coordinates | null>(null)
    const api = useAstroPhotography(coordinates, fixed)
    expect(api.needsLocation.value).toBe(true)
    expect(api.snapshot.value.score).toBeNull()
    expect(api.snapshot.value.suggestedSettings).not.toBeNull()
    expect(api.error.value).toBeNull()
  })

  it('computes score with coordinates', () => {
    const coordinates = ref<Coordinates | null>({ lat: 21.0285, lng: 105.8542 })
    const api = useAstroPhotography(coordinates, fixed)
    expect(api.needsLocation.value).toBe(false)
    expect(api.snapshot.value.score).not.toBeNull()
  })
})
