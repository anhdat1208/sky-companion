<script setup lang="ts">
import type { Coordinates } from '../../types/location'
import MoonTodayCard from '../components/moon/MoonTodayCard.vue'
import MoonObservationScore from '../components/moon/MoonObservationScore.vue'
import MoonPhotographyGuide from '../components/moon/MoonPhotographyGuide.vue'
import MoonMonthCalendar from '../components/moon/MoonMonthCalendar.vue'
import MoonDayDetailPanel from '../components/moon/MoonDayDetailPanel.vue'
import MoonUpcomingEvents from '../components/moon/MoonUpcomingEvents.vue'
import SkyAIExplainPanel from '../components/ai/SkyAIExplainPanel.vue'

useHead({
  title: 'Moon Calendar · What\'s Above Me?'
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
    return 'Nhập thủ công sau khi không dùng được GPS.'
  }

  if (locationSource.value === 'query') {
    return 'Lấy từ tham số URL.'
  }

  return 'Lấy từ GPS trình duyệt.'
})

const {
  viewedYear,
  viewedMonth,
  selectedDateISO,
  error,
  today,
  monthDays,
  selectedDetail,
  upcomingEvents,
  todayScore,
  todayPhotography,
  goToPrevMonth,
  goToNextMonth,
  selectDay,
  clearSelectedDay,
  refresh
} = useMoonCalendar(coordinates)

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
        Sky Companion
      </p>
      <h1 class="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        Lịch Mặt Trăng
      </h1>
      <p class="max-w-2xl text-base leading-7 text-slate-400">
        Pha hôm nay, lịch tháng, điểm quan sát và gợi ý chụp ảnh theo vị trí của bạn.
      </p>
      <div class="flex flex-wrap gap-3">
        <NuxtLink
          to="/"
          class="inline-flex rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-sm font-medium text-sky-300 transition hover:border-sky-500/50 hover:bg-slate-900 hover:text-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
        >
          ← Về trang chủ
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
          Làm mới
        </button>
        <button
          v-if="!hasQueryCoordinates && hasAttemptedLocation"
          type="button"
          class="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
          @click="retryLocation"
        >
          Lấy lại vị trí
        </button>
      </div>

      <SkyCard
        v-if="error"
        role="alert"
      >
        <SectionTitle
          title="Không tính được lịch Mặt Trăng"
          :subtitle="error"
        />
        <button
          type="button"
          class="rounded-xl bg-sky-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-900"
          @click="refresh()"
        >
          Thử lại
        </button>
      </SkyCard>

      <template v-else-if="today && todayScore && todayPhotography">
        <MoonTodayCard :today="today" />
        <SkyAIExplainPanel
          object-type="moon-calendar"
          name="Moon Calendar"
          :altitude="today.altitude"
          :azimuth="today.azimuth"
          :distance-km="today.distanceKm"
          :context="{
            phase: today.phase,
            illuminatedPercentage: today.illuminatedPercentage,
            score: todayScore.label
          }"
        />
        <MoonObservationScore :score="todayScore" />
        <MoonPhotographyGuide :guide="todayPhotography" />

        <MoonMonthCalendar
          :year="viewedYear"
          :month="viewedMonth"
          :days="monthDays"
          :selectedDateISO="selectedDateISO"
          @prev="goToPrevMonth"
          @next="goToNextMonth"
          @select="selectDay"
        />

        <MoonDayDetailPanel
          v-if="selectedDetail"
          :detail="selectedDetail"
          @close="clearSelectedDay"
        />

        <MoonUpcomingEvents :events="upcomingEvents" />
      </template>
    </template>
  </div>
</template>
