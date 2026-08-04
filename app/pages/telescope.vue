<script setup lang="ts">
import type { Coordinates } from '../../types/location'
import type { DevicePointing } from '../../types/telescope'

const { t } = useI18n()

useHead({
  title: () => t('pages.telescope.title')
})

const route = useRoute()
const geo = useGeolocationInput()

function parseCoordinate(value: unknown): number | null {
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }

  if (Array.isArray(value) && value.length > 0) {
    return parseCoordinate(value[0])
  }

  return null
}

const queryCoordinates = computed<Coordinates | null>(() => {
  const lat = parseCoordinate(route.query.lat)
  const lng = parseCoordinate(route.query.lng)

  if (lat === null || lng === null) {
    return null
  }

  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return null
  }

  return { lat, lng }
})

const locationSource = ref<'gps' | 'manual' | 'query' | null>(null)
const hasAttemptedLocation = ref(false)

const coordinates = computed<Coordinates | null>(() => {
  return queryCoordinates.value ?? geo.coordinates.value
})

const hasQueryCoordinates = computed(() => queryCoordinates.value !== null)
const hasCoordinates = computed(() => coordinates.value !== null)

const showManualFallback = computed(() => {
  return !hasQueryCoordinates.value
    && hasAttemptedLocation.value
    && !geo.loading.value
    && !hasCoordinates.value
    && (geo.permissionDenied.value || geo.error.value !== null)
})

const isBootstrapping = computed(() => {
  if (hasQueryCoordinates.value) {
    return false
  }

  return !hasAttemptedLocation.value || geo.loading.value
})

const locationSourceLabel = computed(() => {
  if (locationSource.value === 'manual') {
    return t('pages.home.locationManual')
  }

  if (locationSource.value === 'query') {
    return t('pages.moonCalendar.locationFromQuery')
  }

  return t('pages.home.locationFromGps')
})

const permissionFallbackTitle = computed(() => {
  return geo.permissionDenied.value
    ? t('errors.location.permissionDenied')
    : t('errors.location.unavailable')
})

const permissionFallbackSubtitle = computed(() => {
  return geo.error.value ?? t('components.permissionDenied.body')
})

const {
  profiles,
  selectedProfileId,
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
  switchToManualPointing,
  error,
  refresh
} = useTelescope(coordinates)

const compassLink = computed(() => {
  if (!coordinates.value) {
    return null
  }

  return {
    path: '/compass',
    query: {
      lat: String(coordinates.value.lat),
      lng: String(coordinates.value.lng)
    }
  }
})

const deepSkyAiLink = computed(() => {
  const detail = selectedDetail.value
  if (!detail) return null
  const isDeepSky = ['galaxy', 'nebula', 'starCluster'].includes(detail.target.objectType)
  if (!isDeepSky) return null
  return {
    path: '/ai/deep-sky-object',
    query: {
      name: detail.target.name,
      altitude: String(detail.altitude),
      azimuth: String(detail.azimuth)
    }
  }
})

function handleManualSubmit(lat: number, lng: number): void {
  geo.setManualCoordinates(lat, lng)
  locationSource.value = 'manual'
}

async function retryLocation(): Promise<void> {
  const coords = await geo.requestLocation()
  if (coords) {
    locationSource.value = 'gps'
  }
}

function onPointingUpdate(next: DevicePointing): void {
  setManualPointing({
    azimuth: next.azimuth,
    altitude: next.altitude
  })
}

onMounted(async () => {
  if (queryCoordinates.value) {
    locationSource.value = 'query'
    hasAttemptedLocation.value = true
    return
  }

  const coords = await geo.requestLocation()
  hasAttemptedLocation.value = true
  if (coords) {
    locationSource.value = 'gps'
  }
})

watch(queryCoordinates, (next, previous) => {
  if (!next) {
    return
  }

  if (
    previous
    && previous.lat === next.lat
    && previous.lng === next.lng
  ) {
    return
  }

  locationSource.value = 'query'
  hasAttemptedLocation.value = true
})
</script>

<template>
  <div class="space-y-6">
    <header class="space-y-3">
      <p class="text-sm font-medium uppercase tracking-[0.2em] text-sky-400/80">
        {{ t('pages.home.brand') }}
      </p>
      <h1 class="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        {{ t('pages.telescope.heading') }}
      </h1>
      <p class="max-w-2xl text-base leading-7 text-slate-400">
        {{ t('pages.telescope.subtitle') }}
      </p>
      <div class="flex flex-wrap gap-3">
        <NuxtLink
          to="/"
          class="inline-flex rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-sm font-medium text-sky-300 transition hover:border-sky-500/50 hover:bg-slate-900 hover:text-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
        >
          ← {{ t('common.backHome') }}
        </NuxtLink>
        <NuxtLink
          v-if="compassLink"
          :to="compassLink"
          class="inline-flex rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-sm font-medium text-sky-300 transition hover:border-sky-500/50 hover:bg-slate-900 hover:text-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
        >
          {{ t('nav.openCompass') }}
        </NuxtLink>
      </div>
    </header>

    <LoadingLocation
      v-if="isBootstrapping"
      :message="t('components.loadingLocation.default')"
    />

    <PermissionDenied
      v-else-if="showManualFallback"
      :title="permissionFallbackTitle"
      :subtitle="permissionFallbackSubtitle"
      @submit="handleManualSubmit"
    />

    <template v-else-if="coordinates">
      <CurrentLocation
        :coordinates="coordinates"
        :source-label="locationSourceLabel"
      />

      <div class="flex flex-wrap gap-3">
        <button
          type="button"
          class="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
          @click="refresh()"
        >
          {{ t('pages.telescope.refreshTargets') }}
        </button>
        <button
          v-if="!hasQueryCoordinates"
          type="button"
          class="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
          @click="retryLocation"
        >
          {{ t('pages.home.retryLocation') }}
        </button>
      </div>

      <SkyCard
        v-if="error"
        role="alert"
      >
        <SectionTitle
          :title="t('pages.telescope.loadError')"
          :subtitle="error"
        />
        <button
          type="button"
          class="rounded-xl bg-sky-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-900"
          @click="refresh()"
        >
          {{ t('pages.telescope.refreshTargets') }}
        </button>
      </SkyCard>

      <template v-else>
        <TelescopeProfilePicker
          v-if="selectedProfileId"
          :profiles="profiles"
          :model-value="selectedProfileId"
          @update:model-value="selectProfile"
        />

        <TelescopeTonightTargetsList
          :targets="rankedTargets"
          :selected-id="selectedTargetId"
          @select="selectTarget"
        />

        <TelescopeTargetDetailCard :detail="selectedDetail" />
        <NuxtLink
          v-if="deepSkyAiLink"
          :to="deepSkyAiLink"
          class="inline-flex w-fit rounded-xl border border-violet-400/40 bg-violet-500/15 px-4 py-2.5 text-sm font-semibold text-violet-100 transition hover:border-violet-300/60 hover:bg-violet-500/20 focus:outline-none focus:ring-2 focus:ring-violet-400/40"
        >
          ✨ {{ t('pages.telescope.explainWithAi') }}
        </NuxtLink>

        <TelescopeGuidancePanel
          :guidance="guidance"
          :pointing="pointing"
          :sensor-error="sensorError"
          @enable-sensor="enableSensor"
          @disable-sensor="switchToManualPointing"
          @update:pointing="onPointingUpdate"
        />

        <TelescopeStarHopPlaceholder />
      </template>
    </template>
  </div>
</template>
