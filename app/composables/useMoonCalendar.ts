import { ref, watch, type Ref } from 'vue'
import type { Coordinates } from '../../types/location'
import type {
  MoonCalendarDay,
  MoonDayDetail,
  MoonQuarterEvent,
  MoonTodaySnapshot,
  ObservationScore,
  PhotographyGuide
} from '../../types/moon'
import {
  buildMonthCalendar,
  buildMoonDayDetailFromISO,
  buildMoonTodaySnapshot
} from '../../lib/moon/calendar'
import { listUpcomingMoonQuarters } from '../../lib/moon/events'
import { buildPhotographyGuide } from '../../lib/moon/photography'
import { computeObservationScore } from '../../lib/moon/score'

const CALC_ERROR = 'Không thể tính lịch Mặt Trăng. Hãy thử làm mới.'

function resolveWhenSource(when?: Date | (() => Date)): () => Date {
  if (typeof when === 'function') return when
  if (when instanceof Date) return () => when
  return () => new Date()
}

function toErrorMessage(caught: unknown): string {
  if (caught instanceof Error && caught.message.trim().length > 0) {
    return caught.message
  }
  return CALC_ERROR
}

export function useMoonCalendar(
  coordinates: Ref<Coordinates | null>,
  when?: Date | (() => Date)
) {
  const whenSource = resolveWhenSource(when)
  const refreshToken = ref(0)
  const error = ref<string | null>(null)

  const initial = whenSource()
  const viewedYear = ref(initial.getFullYear())
  const viewedMonth = ref(initial.getMonth() + 1)
  const selectedDateISO = ref<string | null>(null)

  const today = ref<MoonTodaySnapshot | null>(null)
  const monthDays = ref<MoonCalendarDay[]>([])
  const selectedDetail = ref<MoonDayDetail | null>(null)
  const upcomingEvents = ref<MoonQuarterEvent[]>([])
  const todayScore = ref<ObservationScore | null>(null)
  const todayPhotography = ref<PhotographyGuide | null>(null)

  function currentWhen(): Date {
    void refreshToken.value
    return whenSource()
  }

  function recompute() {
    const coords = coordinates.value
    if (!coords) {
      today.value = null
      monthDays.value = []
      selectedDetail.value = null
      upcomingEvents.value = []
      todayScore.value = null
      todayPhotography.value = null
      selectedDateISO.value = null
      error.value = null
      return
    }

    try {
      const now = currentWhen()
      const snapshot = buildMoonTodaySnapshot(coords.lat, coords.lng, now)
      today.value = snapshot
      todayScore.value = computeObservationScore(
        snapshot.altitude,
        snapshot.phaseAngleDeg,
        snapshot.illuminatedPercentage
      )
      todayPhotography.value = buildPhotographyGuide(
        snapshot.illuminatedPercentage,
        snapshot.riseTime
      )
      monthDays.value = buildMonthCalendar(
        coords.lat,
        coords.lng,
        viewedYear.value,
        viewedMonth.value,
        now
      )
      upcomingEvents.value = listUpcomingMoonQuarters(now, 4)

      if (selectedDateISO.value) {
        const cell = monthDays.value.find(d => d.dateISO === selectedDateISO.value)
        if (!cell || !cell.inCurrentMonth) {
          selectedDateISO.value = null
          selectedDetail.value = null
        } else {
          selectedDetail.value = buildMoonDayDetailFromISO(
            coords.lat,
            coords.lng,
            selectedDateISO.value,
            now
          )
        }
      } else {
        selectedDetail.value = null
      }

      error.value = null
    } catch (caught) {
      error.value = toErrorMessage(caught)
    }
  }

  function goToPrevMonth() {
    if (viewedMonth.value === 1) {
      viewedMonth.value = 12
      viewedYear.value -= 1
    } else {
      viewedMonth.value -= 1
    }
    selectedDateISO.value = null
    recompute()
  }

  function goToNextMonth() {
    if (viewedMonth.value === 12) {
      viewedMonth.value = 1
      viewedYear.value += 1
    } else {
      viewedMonth.value += 1
    }
    selectedDateISO.value = null
    recompute()
  }

  function selectDay(dateISO: string) {
    const cell = monthDays.value.find(d => d.dateISO === dateISO)
    if (!cell || !cell.inCurrentMonth) return
    selectedDateISO.value = dateISO
    recompute()
  }

  function clearSelectedDay() {
    selectedDateISO.value = null
    selectedDetail.value = null
  }

  function refresh() {
    refreshToken.value += 1
    recompute()
  }

  watch(coordinates, () => recompute(), { immediate: true, flush: 'sync' })

  return {
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
  }
}
