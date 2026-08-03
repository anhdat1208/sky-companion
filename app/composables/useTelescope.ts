import { computed, ref, watch, type Ref } from 'vue'
import type { Coordinates } from '../../types/location'
import type { HopStep, TelescopeProfile } from '../../types/telescope'
import { buildGuidanceInstruction } from '../../lib/telescope/guidance'
import { buildTargetDetail } from '../../lib/telescope/position'
import { getMockProfiles } from '../../lib/telescope/profiles'
import { rankTonightTargets } from '../../lib/telescope/ranking'
import { buildStarHopPlan } from '../../lib/telescope/starHop'
import { useDevicePointing } from './useDevicePointing'

function resolveWhenSource(when?: Date | (() => Date)): () => Date {
  if (typeof when === 'function') return when
  if (when instanceof Date) return () => when
  return () => new Date()
}

export function useTelescope(
  coordinates: Ref<Coordinates | null>,
  when?: Date | (() => Date)
) {
  const whenSource = resolveWhenSource(when)
  const refreshToken = ref(0)
  const whenOverride = ref<Date | null>(null)

  const profiles = ref<TelescopeProfile[]>(getMockProfiles())
  const selectedProfileId = ref<string | null>(null)
  const selectedTargetId = ref<string | null>(null)

  const {
    pointing,
    setManualPointing,
    enableSensor
  } = useDevicePointing()

  function currentWhen(): Date {
    void refreshToken.value
    return whenOverride.value ?? whenSource()
  }

  const selectedProfile = computed(() => {
    const id = selectedProfileId.value
    if (!id) return null
    return profiles.value.find(profile => profile.id === id) ?? null
  })

  const rankedTargets = computed(() => {
    const coords = coordinates.value
    if (!coords) return []

    return rankTonightTargets(
      coords.lat,
      coords.lng,
      currentWhen(),
      selectedProfile.value ?? undefined
    )
  })

  const selectedDetail = computed(() => {
    const coords = coordinates.value
    const targetId = selectedTargetId.value
    if (!coords || !targetId) return null

    const ranked = rankedTargets.value.find(item => item.target.id === targetId)
    if (!ranked) return null

    return buildTargetDetail(ranked, coords.lat, coords.lng, currentWhen())
  })

  const guidance = computed(() => {
    const detail = selectedDetail.value
    const profile = selectedProfile.value

    return buildGuidanceInstruction({
      targetAltitude: detail?.altitude ?? null,
      targetAzimuth: detail?.azimuth ?? null,
      pointing: pointing.value,
      fieldOfView: profile?.fieldOfView ?? { trueFovDeg: 1 }
    })
  })

  const starHopSteps = computed<HopStep[]>(() => {
    const detail = selectedDetail.value
    if (!detail) return []
    return buildStarHopPlan(detail.target)
  })

  watch(
    coordinates,
    (coords) => {
      if (!coords) return
      if (selectedProfileId.value === null && profiles.value.length > 0) {
        selectedProfileId.value = profiles.value[0]!.id
      }
    },
    { immediate: true }
  )

  watch(
    rankedTargets,
    (targets) => {
      if (selectedTargetId.value === null && targets.length > 0) {
        selectedTargetId.value = targets[0]!.target.id
      }
    },
    { immediate: true }
  )

  function selectProfile(id: string) {
    selectedProfileId.value = id
  }

  function selectTarget(id: string) {
    selectedTargetId.value = id
  }

  function refresh(at?: Date) {
    whenOverride.value = at ?? null
    refreshToken.value += 1
  }

  return {
    profiles,
    selectedProfileId,
    selectedProfile,
    selectProfile,
    rankedTargets,
    selectedTargetId,
    selectedDetail,
    selectTarget,
    guidance,
    pointing,
    setManualPointing,
    enableSensor,
    starHopSteps,
    refresh
  }
}
