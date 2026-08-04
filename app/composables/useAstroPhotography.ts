import { computed, ref, watch, type Ref } from 'vue'
import type { Coordinates } from '../../types/location'
import type { AstroPhotographySnapshot } from '../../types/photo'
import {
  buildAstroPhotographySnapshot,
  getCameraSettings
} from '../../lib/photo'

const CALC_ERROR = 'Không thể tính lịch chụp ảnh. Hãy thử làm mới.'

function resolveWhenSource(when?: Date | (() => Date)): () => Date {
  if (typeof when === 'function') return when
  if (when instanceof Date) return () => when
  return () => new Date()
}

function toErrorMessage(caught: unknown): string {
  if (caught instanceof Error && caught.message.trim().length > 0) {
    return caught.message
  }
  return CALC_ERROR
}

function emptySnapshotShell(when: Date): AstroPhotographySnapshot {
  return {
    timestamp: when.toISOString(),
    nightWindow: null,
    score: null,
    milkyWay: null,
    goldenHour: null,
    blueHour: null,
    twilight: null,
    moon: null,
    planets: null,
    timeline: null,
    suggestedSettings: getCameraSettings('milky-way')
  }
}

export function useAstroPhotography(
  coordinates: Ref<Coordinates | null>,
  when?: Date | (() => Date)
) {
  const whenSource = resolveWhenSource(when)
  const refreshToken = ref(0)
  const error = ref<string | null>(null)
  const loading = ref(false)
  const snapshot = ref<AstroPhotographySnapshot>(emptySnapshotShell(whenSource()))

  const needsLocation = computed(() => coordinates.value === null)

  function currentWhen(): Date {
    void refreshToken.value
    return whenSource()
  }

  function recompute() {
    const coords = coordinates.value
    if (!coords) {
      snapshot.value = emptySnapshotShell(currentWhen())
      error.value = null
      return
    }

    try {
      snapshot.value = buildAstroPhotographySnapshot(
        coords.lat,
        coords.lng,
        currentWhen()
      )
      error.value = null
    } catch (caught) {
      error.value = toErrorMessage(caught)
    }
  }

  function refresh() {
    refreshToken.value += 1
    recompute()
  }

  watch(coordinates, () => recompute(), { immediate: true, flush: 'sync' })

  return {
    snapshot,
    needsLocation,
    error,
    refresh,
    loading
  }
}
