<script setup lang="ts">
import type { Coordinates } from '../../types/location'
import type { CelestialBodyId, OverlayFlags, TimeWarpFactor, UniverseLevel } from '../../types/universe'
import UniverseCameraControls from '../components/universe/UniverseCameraControls.vue'
import UniverseCanvas from '../components/universe/UniverseCanvas.vue'
import UniverseDetailCard from '../components/universe/UniverseDetailCard.vue'
import UniverseLevelRail from '../components/universe/UniverseLevelRail.vue'
import UniverseLocationPrompt from '../components/universe/UniverseLocationPrompt.vue'
import UniverseOverlayToggles from '../components/universe/UniverseOverlayToggles.vue'
import UniverseTimelineControls from '../components/universe/UniverseTimelineControls.vue'

const { t } = useI18n()

useHead({
  title: () => t('pages.universe.title')
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
  if (lat === null || lng === null) return null
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null
  return { lat, lng }
})

const locationSource = ref<'gps' | 'manual' | 'query' | null>(null)
const hasAttemptedLocation = ref(false)

const coordinates = computed<Coordinates | null>(() => {
  return queryCoordinates.value ?? geo.coordinates.value
})

const hasCoordinates = computed(() => coordinates.value !== null)

const {
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
} = useUniverse(coordinates)

const schematicCaption = computed(() => {
  if (level.value < 5) return null
  return t(`universe.schematic.${level.value}`)
})

const seasonLabel = computed(() => {
  const key = snapshot.value.earth?.seasonKey
  if (!key) return null
  return t(`universe.season.${key}`)
})

let raf = 0
let lastTs = 0

function loop(ts: number): void {
  const dt = lastTs ? ts - lastTs : 16
  lastTs = ts
  tick(dt)
  raf = requestAnimationFrame(loop)
}

function onLevelUpdate(next: UniverseLevel): void {
  setLevel(next)
}

function onOverlaysUpdate(flags: OverlayFlags): void {
  setOverlays(flags)
}

function onWarpUpdate(next: TimeWarpFactor): void {
  setWarp(next)
}

function onSelectBody(id: CelestialBodyId | null): void {
  selectBody(id)
}

function onFollow(): void {
  if (!selectedBodyId.value) return
  setCameraMode('follow', selectedBodyId.value)
}

function onFocus(): void {
  if (!selectedBodyId.value) return
  setCameraMode('focus', selectedBodyId.value)
}

function onResetCamera(): void {
  setCameraMode('free')
  setLevel(level.value)
}

function handleManualSubmit(lat: number, lng: number): void {
  geo.setManualCoordinates(lat, lng)
  locationSource.value = 'manual'
}

async function retryLocation(): Promise<void> {
  const coords = await geo.requestLocation()
  if (coords) locationSource.value = 'gps'
}

onMounted(async () => {
  if (queryCoordinates.value) {
    locationSource.value = 'query'
    hasAttemptedLocation.value = true
  } else {
    const coords = await geo.requestLocation()
    hasAttemptedLocation.value = true
    if (coords) locationSource.value = 'gps'
  }
  raf = requestAnimationFrame(loop)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
})
</script>

<template>
  <div class="space-y-4">
    <header class="space-y-2">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-2xl font-semibold text-white sm:text-3xl">
            {{ t('pages.universe.heading') }}
          </h1>
          <p class="mt-1 max-w-2xl text-sm text-slate-400">
            {{ t('pages.universe.subtitle') }}
          </p>
        </div>
        <NuxtLink
          to="/"
          class="text-sm text-sky-300 hover:text-sky-200"
        >
          {{ t('common.backHome') }}
        </NuxtLink>
      </div>
      <p
        v-if="seasonLabel && level <= 2"
        class="text-xs text-slate-400"
      >
        {{ t('pages.universe.season') }}: {{ seasonLabel }}
      </p>
    </header>

    <UniverseLocationPrompt
      v-if="hasAttemptedLocation && !hasCoordinates && !geo.loading.value"
      @submit="handleManualSubmit"
      @retry="retryLocation"
    />

    <ClientOnly>
      <div class="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)_minmax(240px,300px)]">
        <UniverseLevelRail
          :level="level"
          :can-use-level1="hasCoordinates"
          @update:level="onLevelUpdate"
        />

        <div class="space-y-3">
          <UniverseTimelineControls
            :playing="playing"
            :warp="warp"
            :simulation-time="simulationTime"
            @play="play()"
            @pause="pause()"
            @update:warp="onWarpUpdate"
            @jump="jumpToDate($event)"
            @reset-now="resetToNow()"
          />
          <UniverseCameraControls
            :camera-mode="cameraMode"
            :selected-body-id="selectedBodyId"
            :level="level"
            @reset="onResetCamera"
            @follow="onFollow"
            @focus="onFocus"
          />
          <UniverseOverlayToggles
            :overlays="overlays"
            @update:overlays="onOverlaysUpdate"
          />
          <UniverseCanvas
            :level="level"
            :snapshot="snapshot"
            :overlays="overlays"
            :camera-mode="cameraMode"
            :follow-body-id="selectedBodyId"
            @select-body="onSelectBody"
          />
          <p
            v-if="schematicCaption"
            class="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-300"
          >
            {{ schematicCaption }}
          </p>
        </div>

        <UniverseDetailCard
          :content="selectedContent"
          :body-state="selectedBodyState"
          :moon="snapshot.moon ?? null"
          @close="selectBody(null)"
        />
      </div>
      <template #fallback>
        <p class="text-sm text-slate-400">
          {{ t('common.loading') }}
        </p>
      </template>
    </ClientOnly>
  </div>
</template>
