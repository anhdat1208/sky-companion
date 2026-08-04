<script setup lang="ts">
import type { Coordinates } from '../../types/location'

useHead({
  title: "What's Above Me?"
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
    ? 'Nhập thủ công sau khi không dùng được GPS.'
    : 'Lấy từ GPS trình duyệt.'
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

function formatObservationTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'full',
    timeStyle: 'medium'
  }).format(date)
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
        Sky Companion
      </p>
      <h1 class="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        What's Above Me?
      </h1>
      <p class="max-w-2xl text-base leading-7 text-slate-400">
        Xem nhanh Mặt Trăng, Mặt Trời, hành tinh và hướng nhìn bầu trời dựa trên vị trí của bạn.
      </p>
      <div class="flex flex-wrap gap-3">
        <NuxtLink
          v-if="compassLink"
          :to="compassLink"
          class="inline-flex rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-sm font-medium text-sky-300 transition hover:border-sky-500/50 hover:bg-slate-900 hover:text-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
        >
          Mở Compass
        </NuxtLink>
        <NuxtLink
          v-if="telescopeLink"
          :to="telescopeLink"
          class="inline-flex rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-sm font-medium text-sky-300 transition hover:border-sky-500/50 hover:bg-slate-900 hover:text-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
        >
          Telescope Mode
        </NuxtLink>
        <NuxtLink
          v-if="issLink"
          :to="issLink"
          class="inline-flex rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-sm font-medium text-sky-300 transition hover:border-sky-500/50 hover:bg-slate-900 hover:text-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
        >
          ISS Now
        </NuxtLink>
        <NuxtLink
          v-if="moonCalendarLink"
          :to="moonCalendarLink"
          class="inline-flex rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-sm font-medium text-sky-300 transition hover:border-sky-500/50 hover:bg-slate-900 hover:text-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
        >
          Lịch Mặt Trăng
        </NuxtLink>
        <NuxtLink
          v-if="meteorShowersLink"
          :to="meteorShowersLink"
          class="inline-flex rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-sm font-medium text-sky-300 transition hover:border-sky-500/50 hover:bg-slate-900 hover:text-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
        >
          Mưa sao băng
        </NuxtLink>
        <NuxtLink
          v-if="astrophotographyLink"
          :to="astrophotographyLink"
          class="inline-flex rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-sm font-medium text-sky-300 transition hover:border-sky-500/50 hover:bg-slate-900 hover:text-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
        >
          Astrophotography
        </NuxtLink>
      </div>
    </header>

    <LoadingLocation
      v-if="isBootstrapping"
      message="Đang xác định vị trí của bạn..."
    />

    <PermissionDenied
      v-else-if="showManualFallback"
      :title="geo.permissionDenied.value ? 'Không thể truy cập vị trí' : 'Không lấy được vị trí'"
      :subtitle="geo.error.value ?? 'Hãy nhập vĩ độ và kinh độ thủ công để tiếp tục.'"
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
        message="Đang tải dữ liệu bầu trời..."
      />

      <SkyCard
        v-else-if="sky.error.value"
        role="alert"
      >
        <SectionTitle
          title="Không tải được dữ liệu bầu trời"
          :subtitle="sky.error.value"
        />
        <div class="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            class="rounded-xl bg-sky-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-900"
            @click="retrySky"
          >
            Thử lại
          </button>
          <button
            type="button"
            class="rounded-xl border border-slate-700 bg-slate-950 px-5 py-3 font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
            @click="retryLocation"
          >
            Lấy lại vị trí
          </button>
        </div>
      </SkyCard>

      <template v-else-if="showSnapshot && sky.snapshot.value">
        <SkyCard>
          <SectionTitle
            title="Thời gian quan sát"
            subtitle="Thời điểm máy chủ dùng để tính toán bầu trời."
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
        <SunCard :sun="sky.snapshot.value.sun" />
        <PlanetCard :planets="sky.snapshot.value.planets" />

        <SkyCard>
          <SectionTitle
            title="Chòm sao hiện tại"
            subtitle="Ngữ cảnh chòm sao gần thiên đỉnh."
          />
          <p class="rounded-xl bg-slate-950/70 p-4 text-lg font-medium text-slate-100">
            {{ sky.snapshot.value.constellation.name }}
          </p>
        </SkyCard>

        <SkyCard>
          <SectionTitle
            title="Khả năng thấy Ngân Hà"
            subtitle="Đánh giá nhanh dựa trên ngữ cảnh Mặt Trời/Mặt Trăng."
          />
          <p class="rounded-xl bg-slate-950/70 p-4 text-lg font-medium text-slate-100">
            {{ sky.snapshot.value.milkyWayVisibility }}
          </p>
        </SkyCard>

        <SkyCard>
          <SectionTitle
            title="Hướng nên nhìn"
            subtitle="Hướng gợi ý để quan sát bầu trời."
          />
          <p class="rounded-xl bg-slate-950/70 p-4 text-lg font-medium text-sky-300">
            {{ sky.snapshot.value.directionToLook }}
          </p>
          <NuxtLink
            v-if="compassLink"
            :to="compassLink"
            class="mt-4 inline-flex rounded-xl bg-sky-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            Xem trên Compass
          </NuxtLink>
        </SkyCard>
      </template>
    </template>
  </div>
</template>
