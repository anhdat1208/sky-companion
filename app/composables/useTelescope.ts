import { computed, ref, watch, type Ref } from 'vue'
import type { Coordinates } from '../../types/location'
import type { HopStep, RankedTarget, TargetDetail, TelescopeProfile } from '../../types/telescope'
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

function toErrorMessage(caught: unknown, t: (key: string) => string): string {
  if (caught instanceof Error && caught.message.trim().length > 0) {
    return caught.message
  }
  return t('errors.telescope.calcFailed')
}

export function useTelescope(
  coordinates: Ref<Coordinates | null>,
  when?: Date | (() => Date)
) {
  const { t } = useI18n()
  const whenSource = resolveWhenSource(when)
  const refreshToken = ref(0)
  const whenOverride = ref<Date | null>(null)
  const error = ref<string | null>(null)

  const profiles = ref<TelescopeProfile[]>(getMockProfiles())
  const selectedProfileId = ref<string | null>(null)
  const selectedTargetId = ref<string | null>(null)
  const rankedTargets = ref<RankedTarget[]>([])
  const selectedDetail = ref<TargetDetail | null>(null)

  const {
    pointing,
    sensorError,
    setManualPointing,
    enableSensor,
    disableSensor
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

  function recompute() {
    const coords = coordinates.value
    if (!coords) {
      rankedTargets.value = []
      selectedDetail.value = null
      selectedTargetId.value = null
      return
    }

    try {
      const ranked = rankTonightTargets(
        coords.lat,
        coords.lng,
        currentWhen(),
        selectedProfile.value ?? undefined
      )
      rankedTargets.value = ranked

      if (ranked.length === 0) {
        selectedTargetId.value = null
        selectedDetail.value = null
      } else {
        const stillValid = selectedTargetId.value !== null
          && ranked.some(item => item.target.id === selectedTargetId.value)

        if (!stillValid) {
          selectedTargetId.value = ranked[0]!.target.id
        }

        const rankedItem = ranked.find(item => item.target.id === selectedTargetId.value)
        selectedDetail.value = rankedItem
          ? buildTargetDetail(rankedItem, coords.lat, coords.lng, currentWhen())
          : null
      }

      error.value = null
    } catch (caught) {
      rankedTargets.value = []
      selectedDetail.value = null
      selectedTargetId.value = null
      error.value = toErrorMessage(caught, t)
    }
  }

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
    [coordinates, selectedProfileId, selectedTargetId, refreshToken, whenOverride],
    recompute,
    { immediate: true, flush: 'sync' }
  )

  function selectProfile(id: string) {
    selectedProfileId.value = id
  }

  function selectTarget(id: string) {
    selectedTargetId.value = id
  }

  function refresh(at?: Date) {
    error.value = null
    whenOverride.value = at ?? null
    refreshToken.value += 1
  }

  function switchToManualPointing() {
    setManualPointing({
      azimuth: pointing.value.azimuth,
      altitude: pointing.value.altitude
    })
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
    sensorError,
    setManualPointing,
    enableSensor,
    disableSensor,
    switchToManualPointing,
    starHopSteps,
    error,
    refresh
  }
}
