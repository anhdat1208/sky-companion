<script setup lang="ts">
import type { Coordinates } from '../../types/location'

const { t } = useI18n()
const { formatDateTime } = useFormatters()

useHead({
  title: () => t('pages.home.title')
})

const geo = useGeolocationInput()
const sky = useSkyData()

const locationSource = ref<'gps' | 'manual' | null>(null)
const hasAttemptedLocation = ref(false)

const coordinates = computed(() => geo.coordinates.value)
const hasCoordinates = computed(() => coordinates.value !== null)
const showManualFallback = computed(() => {
  return hasAttemptedLocation.value
    && !geo.loading.value
    && !hasCoordinates.value
    && (geo.permissionDenied.value || geo.error.value !== null)
})
const isBootstrapping = computed(() => !hasAttemptedLocation.value || geo.loading.value)
const isFetchingSky = computed(() => sky.loading.value && hasCoordinates.value)
const showSnapshot = computed(() => sky.snapshot.value !== null && !sky.loading.value)
const locationSourceLabel = computed(() => {
  return locationSource.value === 'manual'
    ? t('pages.home.locationManual')
    : t('pages.home.locationFromGps')
})
const permissionFallbackTitle = computed(() => {
  return geo.permissionDenied.value
    ? t('errors.location.permissionDenied')
    : t('errors.location.unavailable')
})
const permissionFallbackSubtitle = computed(() => {
  return geo.error.value ?? t('components.permissionDenied.body')
})

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

const telescopeLink = computed(() => {
  if (!coordinates.value) {
    return null
  }

  return {
    path: '/telescope',
    query: {
      lat: String(coordinates.value.lat),
      lng: String(coordinates.value.lng)
    }
  }
})

const issLink = computed(() => {
  if (!coordinates.value) {
    return null
  }

  return {
    path: '/iss',
    query: {
      lat: String(coordinates.value.lat),
      lng: String(coordinates.value.lng)
    }
  }
})

const moonCalendarLink = computed(() => {
  if (!coordinates.value) {
    return null
  }

  return {
    path: '/moon-calendar',
    query: {
      lat: String(coordinates.value.lat),
      lng: String(coordinates.value.lng)
    }
  }
})

const meteorShowersLink = computed(() => {
  if (!coordinates.value) {
    return null
  }

  return {
    path: '/meteor-showers',
    query: {
      lat: String(coordinates.value.lat),
      lng: String(coordinates.value.lng)
    }
  }
})

const astrophotographyLink = computed(() => {
  if (!coordinates.value) {
    return null
  }

  return {
    path: '/astrophotography',
    query: {
      lat: String(coordinates.value.lat),
      lng: String(coordinates.value.lng)
    }
  }
})

const universeLink = computed(() => {
  if (!coordinates.value) {
    return null
  }

  return {
    path: '/universe',
    query: {
      lat: String(coordinates.value.lat),
      lng: String(coordinates.value.lng)
    }
  }
})

const moonAiLink = computed(() => {
  if (!sky.snapshot.value) return null
  return {
    path: '/ai/moon',
    query: {
      altitude: String(sky.snapshot.value.moon.altitude),
      azimuth: String(sky.snapshot.value.moon.azimuth)
    }
  }
})

const sunAiLink = computed(() => {
  if (!sky.snapshot.value) return null
  return {
    path: '/ai/sun',
    query: {
      altitude: String(sky.snapshot.value.sun.altitude),
      azimuth: String(sky.snapshot.value.sun.azimuth)
    }
  }
})

const topPlanetAiLink = computed(() => {
  if (!sky.snapshot.value) return null
  const first = sky.snapshot.value.planets.find((planet) => planet.isVisible)
  if (!first) return null
  return {
    path: '/ai/planet',
    query: {
      name: first.name,
      altitude: String(first.altitude),
      azimuth: String(first.azimuth),
      visible: String(first.isVisible)
    }
  }
})

const constellationAiLink = computed(() => {
  if (!sky.snapshot.value) return null
  return {
    path: '/ai/constellation',
    query: {
      name: sky.snapshot.value.constellation.name
    }
  }
})

function formatObservationTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return formatDateTime(date)
}

async function loadSky(coords: Coordinates): Promise<void> {
  await sky.fetchSky(coords)
}

async function handleManualSubmit(lat: number, lng: number): Promise<void> {
  const coords = geo.setManualCoordinates(lat, lng)
  locationSource.value = 'manual'
  await loadSky(coords)
}

async function retryLocation(): Promise<void> {
  const coords = await geo.requestLocation()
  if (coords) {
    locationSource.value = 'gps'
    await loadSky(coords)
  }
}

async function retrySky(): Promise<void> {
  if (!coordinates.value) {
    return
  }

  await loadSky(coordinates.value)
}

onMounted(async () => {
  const coords = await geo.requestLocation()
  hasAttemptedLocation.value = true
  if (coords) {
    locationSource.value = 'gps'
    await loadSky(coords)
  }
})
</script>

<template>
  <div class="space-y-6">
    <header class="space-y-3">
      <p class="text-sm font-medium uppercase tracking-[0.2em] text-sky-400/80">
        {{ t('pages.home.brand') }}
      </p>
      <h1 class="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        {{ t('pages.home.title') }}
      </h1>
      <p class="max-w-2xl text-base leading-7 text-slate-400">
        {{ t('pages.home.subtitle') }}
      </p>
      <div class="flex flex-wrap gap-3">
        <NuxtLink
          v-if="compassLink"
          :to="compassLink"
          class="inline-flex rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-sm font-medium text-sky-300 transition hover:border-sky-500/50 hover:bg-slate-900 hover:text-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
        >
          {{ t('nav.openCompass') }}
        </NuxtLink>
        <NuxtLink
          v-if="telescopeLink"
          :to="telescopeLink"
          class="inline-flex rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-sm font-medium text-sky-300 transition hover:border-sky-500/50 hover:bg-slate-900 hover:text-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
        >
          {{ t('nav.telescope') }}
        </NuxtLink>
        <NuxtLink
          v-if="issLink"
          :to="issLink"
          class="inline-flex rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-sm font-medium text-sky-300 transition hover:border-sky-500/50 hover:bg-slate-900 hover:text-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
        >
          {{ t('nav.iss') }}
        </NuxtLink>
        <NuxtLink
          v-if="moonCalendarLink"
          :to="moonCalendarLink"
          class="inline-flex rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-sm font-medium text-sky-300 transition hover:border-sky-500/50 hover:bg-slate-900 hover:text-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
        >
          {{ t('nav.moonCalendar') }}
        </NuxtLink>
        <NuxtLink
          v-if="meteorShowersLink"
          :to="meteorShowersLink"
          class="inline-flex rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-sm font-medium text-sky-300 transition hover:border-sky-500/50 hover:bg-slate-900 hover:text-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
        >
          {{ t('nav.meteorShowers') }}
        </NuxtLink>
        <NuxtLink
          v-if="astrophotographyLink"
          :to="astrophotographyLink"
          class="inline-flex rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-sm font-medium text-sky-300 transition hover:border-sky-500/50 hover:bg-slate-900 hover:text-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
        >
          {{ t('nav.astrophotography') }}
        </NuxtLink>
        <NuxtLink
          v-if="universeLink"
          :to="universeLink"
          class="inline-flex rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-sm font-medium text-sky-300 transition hover:border-sky-500/50 hover:bg-slate-900 hover:text-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
        >
          {{ t('nav.universe') }}
        </NuxtLink>
      </div>
    </header>

    <LoadingLocation v-if="isBootstrapping" />

    <PermissionDenied
      v-else-if="showManualFallback"
      :title="permissionFallbackTitle"
      :subtitle="permissionFallbackSubtitle"
      :submitting="sky.loading.value"
      @submit="handleManualSubmit"
    />

    <template v-else-if="coordinates">
      <CurrentLocation
        :coordinates="coordinates"
        :source-label="locationSourceLabel"
      />

      <LoadingLocation
        v-if="isFetchingSky"
        :message="t('pages.home.loadingSky')"
      />

      <SkyCard
        v-else-if="sky.error.value"
        role="alert"
      >
        <SectionTitle
          :title="t('pages.home.skyLoadError')"
          :subtitle="sky.error.value"
        />
        <div class="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            class="rounded-xl bg-sky-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-900"
            @click="retrySky"
          >
            {{ t('common.retry') }}
          </button>
          <button
            type="button"
            class="rounded-xl border border-slate-700 bg-slate-950 px-5 py-3 font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
            @click="retryLocation"
          >
            {{ t('pages.home.retryLocation') }}
          </button>
        </div>
      </SkyCard>

      <template v-else-if="showSnapshot && sky.snapshot.value">
        <SkyCard>
          <SectionTitle
            :title="t('pages.home.observationTime.title')"
            :subtitle="t('pages.home.observationTime.subtitle')"
          />
          <p class="rounded-xl bg-slate-950/70 p-4 text-base text-slate-100">
            {{ formatObservationTime(sky.snapshot.value.timestamp) }}
          </p>
        </SkyCard>

        <SkyMap2D
          :moon="sky.snapshot.value.moon"
          :planets="sky.snapshot.value.planets"
        />

        <MoonCard :moon="sky.snapshot.value.moon" />
        <NuxtLink
          v-if="moonAiLink"
          :to="moonAiLink"
          class="inline-flex w-fit rounded-xl border border-violet-400/40 bg-violet-500/15 px-4 py-2.5 text-sm font-semibold text-violet-100 transition hover:border-violet-300/60 hover:bg-violet-500/20 focus:outline-none focus:ring-2 focus:ring-violet-400/40"
        >
          ✨ {{ t('components.skyAI.explain') }}
        </NuxtLink>
        <SunCard :sun="sky.snapshot.value.sun" />
        <NuxtLink
          v-if="sunAiLink"
          :to="sunAiLink"
          class="inline-flex w-fit rounded-xl border border-violet-400/40 bg-violet-500/15 px-4 py-2.5 text-sm font-semibold text-violet-100 transition hover:border-violet-300/60 hover:bg-violet-500/20 focus:outline-none focus:ring-2 focus:ring-violet-400/40"
        >
          ✨ {{ t('components.skyAI.explain') }}
        </NuxtLink>
        <PlanetCard :planets="sky.snapshot.value.planets" />
        <NuxtLink
          v-if="topPlanetAiLink"
          :to="topPlanetAiLink"
          class="inline-flex w-fit rounded-xl border border-violet-400/40 bg-violet-500/15 px-4 py-2.5 text-sm font-semibold text-violet-100 transition hover:border-violet-300/60 hover:bg-violet-500/20 focus:outline-none focus:ring-2 focus:ring-violet-400/40"
        >
          ✨ {{ t('components.skyAI.explain') }}
        </NuxtLink>

        <SkyCard>
          <SectionTitle
            :title="t('pages.home.constellation.title')"
            :subtitle="t('pages.home.constellation.subtitle')"
          />
          <p class="rounded-xl bg-slate-950/70 p-4 text-lg font-medium text-slate-100">
            {{ sky.snapshot.value.constellation.name }}
          </p>
          <NuxtLink
            v-if="constellationAiLink"
            :to="constellationAiLink"
            class="mt-4 inline-flex w-fit rounded-xl border border-violet-400/40 bg-violet-500/15 px-4 py-2.5 text-sm font-semibold text-violet-100 transition hover:border-violet-300/60 hover:bg-violet-500/20 focus:outline-none focus:ring-2 focus:ring-violet-400/40"
          >
            ✨ {{ t('components.skyAI.explain') }}
          </NuxtLink>
        </SkyCard>

        <SkyCard>
          <SectionTitle
            :title="t('pages.home.milkyWay.title')"
            :subtitle="t('pages.home.milkyWay.subtitle')"
          />
          <p class="rounded-xl bg-slate-950/70 p-4 text-lg font-medium text-slate-100">
            {{ sky.snapshot.value.milkyWayVisibility }}
          </p>
        </SkyCard>

        <SkyCard>
          <SectionTitle
            :title="t('pages.home.direction.title')"
            :subtitle="t('pages.home.direction.subtitle')"
          />
          <p class="rounded-xl bg-slate-950/70 p-4 text-lg font-medium text-sky-300">
            {{ sky.snapshot.value.directionToLook }}
          </p>
          <NuxtLink
            v-if="compassLink"
            :to="compassLink"
            class="mt-4 inline-flex rounded-xl bg-sky-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            {{ t('pages.home.direction.viewOnCompass') }}
          </NuxtLink>
        </SkyCard>
      </template>
    </template>
  </div>
</template>
