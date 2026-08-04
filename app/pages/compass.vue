<script setup lang="ts">
import type { Coordinates } from '../../types/location'

const { t } = useI18n()

useHead({
  title: () => t('pages.compass.title')
})

const route = useRoute()
const sky = useSkyData()

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

const coordinates = computed<Coordinates | null>(() => {
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

const hasValidCoordinates = computed(() => coordinates.value !== null)

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

const { moonAzimuth, visiblePlanets } = useCompassData(sky.snapshot)

const selectedPlanetName = computed(() => {
  const raw = route.query.planet
  if (typeof raw === 'string' && raw.trim().length > 0) {
    return raw.trim()
  }

  return visiblePlanets.value[0]?.name ?? null
})

const selectedPlanet = computed(() => {
  if (!selectedPlanetName.value) {
    return null
  }

  return visiblePlanets.value.find(planet => planet.name === selectedPlanetName.value)
    ?? visiblePlanets.value[0]
    ?? null
})

const planetAzimuth = computed(() => selectedPlanet.value?.azimuth ?? null)
const planetName = computed(() => selectedPlanet.value?.name ?? null)

async function loadCompassData(): Promise<void> {
  if (!coordinates.value) {
    return
  }

  await sky.fetchSky(coordinates.value)
}

function onPlanetChange(event: Event): void {
  const target = event.target as HTMLSelectElement
  const nextQuery: Record<string, string> = {
    lat: String(coordinates.value?.lat ?? ''),
    lng: String(coordinates.value?.lng ?? '')
  }

  if (target.value) {
    nextQuery.planet = target.value
  }

  navigateTo({
    path: '/compass',
    query: nextQuery
  })
}

onMounted(() => {
  void loadCompassData()
})

watch(coordinates, (next, previous) => {
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

  void loadCompassData()
})
</script>

<template>
  <div class="space-y-6">
    <header class="space-y-3">
      <p class="text-sm font-medium uppercase tracking-[0.2em] text-sky-400/80">
        {{ t('pages.home.brand') }}
      </p>
      <h1 class="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        {{ t('pages.compass.heading') }}
      </h1>
      <p class="max-w-2xl text-base leading-7 text-slate-400">
        {{ t('pages.compass.subtitle') }}
      </p>
      <div class="flex flex-wrap items-center gap-3">
        <NuxtLink
          to="/"
          class="inline-flex text-sm font-medium text-sky-400 transition hover:text-sky-300"
        >
          ← {{ t('common.backHome') }}
        </NuxtLink>
        <NuxtLink
          v-if="telescopeLink"
          :to="telescopeLink"
          class="inline-flex rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-sm font-medium text-sky-300 transition hover:border-sky-500/50 hover:bg-slate-900 hover:text-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
        >
          {{ t('nav.telescope') }}
        </NuxtLink>
      </div>
    </header>

    <SkyCard v-if="!hasValidCoordinates">
      <SectionTitle
        :title="t('pages.compass.noCoordinatesTitle')"
        :subtitle="t('pages.compass.noCoordinatesSubtitle')"
      />
      <p class="rounded-xl bg-slate-950/70 p-4 text-sm leading-6 text-slate-300">
        {{ t('pages.compass.noCoordinatesBody') }}
      </p>
      <NuxtLink
        to="/"
        class="mt-4 inline-flex rounded-xl bg-sky-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-900"
      >
        {{ t('common.backHome') }}
      </NuxtLink>
    </SkyCard>

    <template v-else>
      <LoadingLocation
        v-if="sky.loading.value"
        :message="t('pages.compass.loadingDirections')"
      />

      <SkyCard
        v-else-if="sky.error.value"
        role="alert"
      >
        <SectionTitle
          :title="t('pages.compass.loadError')"
          :subtitle="sky.error.value"
        />
        <button
          type="button"
          class="rounded-xl bg-sky-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-900"
          @click="loadCompassData"
        >
          {{ t('common.retry') }}
        </button>
      </SkyCard>

      <template v-else-if="sky.snapshot.value">
        <SkyCard>
          <SectionTitle
            :title="t('pages.compass.observationHeading')"
            :subtitle="t('pages.compass.observationSubtitle')"
          />

          <div
            v-if="visiblePlanets.length > 1"
            class="mb-5"
          >
            <label
              for="planet-select"
              class="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500"
            >
              {{ t('pages.compass.planet') }}
            </label>
            <select
              id="planet-select"
              class="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
              :value="selectedPlanet?.name ?? ''"
              @change="onPlanetChange"
            >
              <option
                v-for="planet in visiblePlanets"
                :key="planet.name"
                :value="planet.name"
              >
                {{ planet.name }}
              </option>
            </select>
          </div>

          <Compass
            :moon-azimuth="moonAzimuth"
            :planet-azimuth="planetAzimuth"
            :planet-name="planetName"
          />
        </SkyCard>

        <SkyCard>
          <SectionTitle
            :title="t('pages.compass.coordinatesInUse')"
            :subtitle="`${coordinates?.lat.toFixed(5)}, ${coordinates?.lng.toFixed(5)}`"
          />
          <p class="text-sm leading-6 text-slate-400">
            {{ t('pages.compass.dataSourceNote', { api: '/api/sky' }) }}
          </p>
        </SkyCard>
      </template>
    </template>
  </div>
</template>
