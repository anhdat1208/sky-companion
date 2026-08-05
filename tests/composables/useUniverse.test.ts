import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { useUniverse } from '../../app/composables/useUniverse'
import type { Coordinates } from '../../types/location'

const FIXED = new Date('2024-06-15T12:00:00.000Z')

describe('useUniverse', () => {
  it('advances simulation time while playing with warp', () => {
    const coordinates = ref<Coordinates | null>({ lat: 21, lng: 105 })
    const api = useUniverse(coordinates, FIXED)

    api.play()
    api.setWarp(10)
    api.tick(1000)

    const deltaDays = (api.simulationTime.value.getTime() - FIXED.getTime()) / 86_400_000
    expect(deltaDays).toBeCloseTo(10, 5)
  })

  it('does not advance while paused', () => {
    const coordinates = ref<Coordinates | null>(null)
    const api = useUniverse(coordinates, FIXED)
    api.pause()
    api.setWarp(1000)
    api.tick(5000)
    expect(api.simulationTime.value.getTime()).toBe(FIXED.getTime())
  })

  it('jumps to a date and changes level clearing follow', () => {
    const coordinates = ref<Coordinates | null>(null)
    const api = useUniverse(coordinates, FIXED)
    const target = new Date('2025-01-01T00:00:00.000Z')
    api.jumpToDate(target)
    expect(api.simulationTime.value.toISOString()).toBe(target.toISOString())

    api.setCameraMode('follow', 'mars')
    expect(api.cameraMode.value).toBe('follow')
    expect(api.selectedBodyId.value).toBe('mars')

    api.setLevel(5)
    expect(api.level.value).toBe(5)
    expect(api.cameraMode.value).toBe('free')
  })

  it('builds a snapshot with solar bodies', () => {
    const coordinates = ref<Coordinates | null>({ lat: 10, lng: 106 })
    const api = useUniverse(coordinates, FIXED)
    expect(api.snapshot.value.bodies.length).toBeGreaterThanOrEqual(10)
    expect(api.snapshot.value.earth?.userLat).toBe(10)
  })
})
