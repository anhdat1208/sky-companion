import { computed, ref, type Ref } from 'vue'
import { buildUniverseSnapshot } from '../../lib/universe/ephemeris'
import { getBodyContent } from '../../lib/universe/content'
import type {
  CameraMode,
  CelestialBodyId,
  OverlayFlags,
  TimeWarpFactor,
  UniverseLevel,
  UniverseObserver,
  UniverseSnapshot
} from '../../types/universe'
import type { Coordinates } from '../../types/location'

const MS_PER_DAY = 86_400_000

function toObserver(coords: Coordinates | null): UniverseObserver | undefined {
  if (!coords) return undefined
  return { lat: coords.lat, lng: coords.lng }
}

export function useUniverse(
  coordinates: Ref<Coordinates | null>,
  initialTime: Date = new Date()
) {
  const level = ref<UniverseLevel>(4)
  const selectedBodyId = ref<CelestialBodyId | null>(null)
  const overlays = ref<OverlayFlags>({
    labels: true,
    orbits: true,
    distances: false
  })
  const cameraMode = ref<CameraMode>('free')
  const playing = ref(false)
  const warp = ref<TimeWarpFactor>(1)
  const simulationTime = ref(new Date(initialTime.getTime()))

  const snapshot = computed<UniverseSnapshot>(() => {
    return buildUniverseSnapshot(simulationTime.value, toObserver(coordinates.value))
  })

  const selectedContent = computed(() => {
    if (!selectedBodyId.value) return null
    try {
      return getBodyContent(selectedBodyId.value)
    } catch {
      return null
    }
  })

  const selectedBodyState = computed(() => {
    if (!selectedBodyId.value) return null
    return snapshot.value.bodies.find((body) => body.id === selectedBodyId.value) ?? null
  })

  function setLevel(next: UniverseLevel): void {
    level.value = next
    if (cameraMode.value === 'follow' || cameraMode.value === 'focus') {
      cameraMode.value = 'free'
    }
  }

  function play(): void {
    playing.value = true
  }

  function pause(): void {
    playing.value = false
  }

  function setWarp(factor: TimeWarpFactor): void {
    warp.value = factor
  }

  function jumpToDate(date: Date): void {
    simulationTime.value = new Date(date.getTime())
  }

  function resetToNow(): void {
    simulationTime.value = new Date()
  }

  function selectBody(id: CelestialBodyId | null): void {
    selectedBodyId.value = id
  }

  function setOverlays(partial: Partial<OverlayFlags>): void {
    overlays.value = { ...overlays.value, ...partial }
  }

  function setCameraMode(mode: CameraMode, bodyId?: CelestialBodyId): void {
    cameraMode.value = mode
    if (bodyId) {
      selectedBodyId.value = bodyId
    }
  }

  /**
   * Advance simulation clock. `dtMs` is real elapsed milliseconds.
   * When playing, advances `warp` simulated days per real second.
   */
  function tick(dtMs: number): void {
    if (!playing.value || dtMs <= 0) return
    const advanceMs = (dtMs / 1000) * warp.value * MS_PER_DAY
    simulationTime.value = new Date(simulationTime.value.getTime() + advanceMs)
  }

  return {
    level,
    selectedBodyId,
    overlays,
    cameraMode,
    playing,
    warp,
    simulationTime,
    snapshot,
    selectedContent,
    selectedBodyState,
    setLevel,
    play,
    pause,
    setWarp,
    jumpToDate,
    resetToNow,
    selectBody,
    setOverlays,
    setCameraMode,
    tick
  }
}
