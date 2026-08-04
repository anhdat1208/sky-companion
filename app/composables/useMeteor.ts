import { ref, watch, type Ref } from 'vue'
import type { Coordinates } from '../../types/location'
import type {
  MeteorEventDetail,
  MeteorNotificationHook,
  MeteorObservationGuide,
  MeteorShowerEvent,
  MeteorShowerId,
  MeteorUpcomingCard,
  MeteorVisibilityScore
} from '../../types/meteor'
import {
  buildEventDetail,
  buildMeteorNotificationHooks,
  buildMeteorObservationGuide,
  buildUpcomingCard,
  listShowerEventsForYear,
  listUpcomingShowerEvents
} from '../../lib/meteor'

const CALC_ERROR = 'Không thể tính lịch mưa sao băng. Hãy thử làm mới.'

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

export function useMeteor(
  coordinates: Ref<Coordinates | null>,
  when?: Date | (() => Date)
) {
  const whenSource = resolveWhenSource(when)
  const refreshToken = ref(0)
  const error = ref<string | null>(null)

  const initial = whenSource()
  const viewedYear = ref(initial.getFullYear())
  const selectedId = ref<MeteorShowerId | null>(null)
  let suppressDefaultSelection = false

  const upcoming = ref<MeteorUpcomingCard[]>([])
  const yearEvents = ref<MeteorShowerEvent[]>([])
  const selectedDetail = ref<MeteorEventDetail | null>(null)
  const selectedGuide = ref<MeteorObservationGuide | null>(null)
  const selectedScore = ref<MeteorVisibilityScore | null>(null)
  const notificationHooks = ref<MeteorNotificationHook[]>([])

  let upcomingEvents: MeteorShowerEvent[] = []

  function currentWhen(): Date {
    void refreshToken.value
    return whenSource()
  }

  function defaultSelectedId(): MeteorShowerId | null {
    const nowYear = currentWhen().getFullYear()
    if (viewedYear.value === nowYear) {
      return upcoming.value[0]?.id ?? yearEvents.value[0]?.id ?? null
    }
    return yearEvents.value[0]?.id ?? null
  }

  function findSelectedEvent(): MeteorShowerEvent | null {
    if (!selectedId.value) return null
    return (
      yearEvents.value.find((e) => e.id === selectedId.value) ??
      upcomingEvents.find((e) => e.id === selectedId.value) ??
      null
    )
  }

  function resolveSelectedDerived(coords: Coordinates | null) {
    const event = findSelectedEvent()
    if (!event) {
      selectedDetail.value = null
      selectedGuide.value = null
      selectedScore.value = null
      const next = upcomingEvents[0]
      notificationHooks.value = next ? buildMeteorNotificationHooks(next) : []
      return
    }

    const card =
      upcoming.value.find((c) => c.id === event.id) ??
      buildUpcomingCard(event, coords)

    selectedDetail.value = buildEventDetail(event)
    selectedGuide.value = buildMeteorObservationGuide({
      recommendedTime: card.bestObservationTimeLabel,
      interference: card.moonInterference
    })
    selectedScore.value = card.visibilityScore
    notificationHooks.value = buildMeteorNotificationHooks(event)
  }

  function recompute(opts?: { defaultTo?: 'auto' | 'firstOfYear' }) {
    try {
      const now = currentWhen()
      const coords = coordinates.value

      upcomingEvents = listUpcomingShowerEvents(now)
      upcoming.value = upcomingEvents.map((event) => buildUpcomingCard(event, coords))
      yearEvents.value = listShowerEventsForYear(viewedYear.value)

      if (selectedId.value == null) {
        if (opts?.defaultTo === 'firstOfYear') {
          selectedId.value = yearEvents.value[0]?.id ?? null
          suppressDefaultSelection = false
        } else if (!suppressDefaultSelection) {
          selectedId.value = defaultSelectedId()
        }
      }

      resolveSelectedDerived(coords)
      error.value = null
    } catch (caught) {
      error.value = toErrorMessage(caught)
    }
  }

  function goToPrevYear() {
    viewedYear.value -= 1
    selectedId.value = null
    recompute({ defaultTo: 'firstOfYear' })
  }

  function goToNextYear() {
    viewedYear.value += 1
    selectedId.value = null
    recompute({ defaultTo: 'firstOfYear' })
  }

  function selectShower(id: MeteorShowerId) {
    const exists =
      yearEvents.value.some((e) => e.id === id) ||
      upcomingEvents.some((e) => e.id === id)
    if (!exists) return
    selectedId.value = id
    suppressDefaultSelection = false
    resolveSelectedDerived(coordinates.value)
  }

  function clearSelected() {
    selectedId.value = null
    suppressDefaultSelection = true
    resolveSelectedDerived(coordinates.value)
  }

  function refresh() {
    refreshToken.value += 1
    recompute()
  }

  watch(coordinates, () => recompute(), { immediate: true, flush: 'sync' })

  return {
    viewedYear,
    selectedId,
    error,
    upcoming,
    yearEvents,
    selectedDetail,
    selectedGuide,
    selectedScore,
    notificationHooks,
    goToPrevYear,
    goToNextYear,
    selectShower,
    clearSelected,
    refresh
  }
}
