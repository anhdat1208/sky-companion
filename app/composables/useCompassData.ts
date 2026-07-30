import { computed, type Ref } from 'vue'
import type { PlanetInfo, SkySnapshot } from '../../types/astronomy'

export function useCompassData(snapshot: Ref<SkySnapshot | null>) {
  const moonAzimuth = computed(() => snapshot.value?.moon.azimuth ?? 0)

  const visiblePlanets = computed<PlanetInfo[]>(
    () => snapshot.value?.planets.filter((planet) => planet.isVisible) ?? []
  )

  return {
    moonAzimuth,
    visiblePlanets
  }
}
