<script setup lang="ts">
import type { Coordinates } from '../../types/location'

useHead({
  title: 'Compass · What\'s Above Me?'
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
        Sky Companion
      </p>
      <h1 class="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        Compass
      </h1>
      <p class="max-w-2xl text-base leading-7 text-slate-400">
        La bàn tĩnh với hướng N/S/E/W và marker theo phương vị Mặt Trăng cùng hành tinh đang chọn.
      </p>
      <NuxtLink
        to="/"
        class="inline-flex text-sm font-medium text-sky-400 transition hover:text-sky-300"
      >
        ← Về trang chủ
      </NuxtLink>
    </header>

    <SkyCard v-if="!hasValidCoordinates">
      <SectionTitle
        title="Chưa có tọa độ"
        subtitle="Trang Compass cần vĩ độ và kinh độ hợp lệ từ query hoặc từ trang chủ."
      />
      <p class="rounded-xl bg-slate-950/70 p-4 text-sm leading-6 text-slate-300">
        Hãy quay lại Home để lấy vị trí GPS hoặc nhập tọa độ thủ công, rồi mở lại Compass.
      </p>
      <NuxtLink
        to="/"
        class="mt-4 inline-flex rounded-xl bg-sky-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-900"
      >
        Về trang chủ
      </NuxtLink>
    </SkyCard>

    <template v-else>
      <LoadingLocation
        v-if="sky.loading.value"
        message="Đang tải hướng bầu trời..."
      />

      <SkyCard
        v-else-if="sky.error.value"
        role="alert"
      >
        <SectionTitle
          title="Không tải được dữ liệu la bàn"
          :subtitle="sky.error.value"
        />
        <button
          type="button"
          class="rounded-xl bg-sky-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-900"
          @click="loadCompassData"
        >
          Thử lại
        </button>
      </SkyCard>

      <template v-else-if="sky.snapshot.value">
        <SkyCard>
          <SectionTitle
            title="Hướng quan sát"
            subtitle="Marker xoay theo azimuth; không dùng cảm biến DeviceOrientation."
          />

          <div
            v-if="visiblePlanets.length > 1"
            class="mb-5"
          >
            <label
              for="planet-select"
              class="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500"
            >
              Hành tinh
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
            title="Tọa độ đang dùng"
            :subtitle="`${coordinates?.lat.toFixed(5)}, ${coordinates?.lng.toFixed(5)}`"
          />
          <p class="text-sm leading-6 text-slate-400">
            Dữ liệu lấy từ
            <code class="rounded bg-slate-950 px-1.5 py-0.5 text-slate-300">/api/sky</code>
            tại thời điểm quan sát hiện tại.
          </p>
        </SkyCard>
      </template>
    </template>
  </div>
</template>
