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

function resolveWhenSource(when?: Date | (() => Date)): () => Date {
  if (typeof when === 'function') return when
  if (when instanceof Date) return () => when
  return () => new Date()
}

function toErrorMessage(caught: unknown, t: (key: string) => string): string {
  if (caught instanceof Error && caught.message.trim().length > 0) {
    return caught.message
  }
  return t('errors.meteor.calcFailed')
}

function peakYearFromIso(peakAt: string): number {
  return new Date(peakAt).getUTCFullYear()
}

export function useMeteor(
  coordinates: Ref<Coordinates | null>,
  when?: Date | (() => Date)
) {
  const { t } = useI18n()
  const whenSource = resolveWhenSource(when)
  const refreshToken = ref(0)
  const error = ref<string | null>(null)

  const initial = whenSource()
  const viewedYear = ref(initial.getFullYear())
  const selectedId = ref<MeteorShowerId | null>(null)
  const selectedYear = ref<number | null>(null)
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

  function defaultSelection(): { id: MeteorShowerId; year: number } | null {
    const nowYear = currentWhen().getFullYear()
    if (viewedYear.value === nowYear) {
      const next = upcoming.value[0]
      if (next) {
        return { id: next.id, year: peakYearFromIso(next.peakAt) }
      }
      const first = yearEvents.value[0]
      return first ? { id: first.id, year: first.year } : null
    }
    const first = yearEvents.value[0]
    return first ? { id: first.id, year: first.year } : null
  }

  function applySelection(selection: { id: MeteorShowerId; year: number } | null) {
    selectedId.value = selection?.id ?? null
    selectedYear.value = selection?.year ?? null
  }

  function findSelectedEvent(): MeteorShowerEvent | null {
    if (!selectedId.value || selectedYear.value == null) return null
    const id = selectedId.value
    const year = selectedYear.value
    const match = (e: MeteorShowerEvent) => e.id === id && e.year === year
    return (
      upcomingEvents.find(match) ??
      yearEvents.value.find(match) ??
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
      upcoming.value.find(
        (c) => c.id === event.id && peakYearFromIso(c.peakAt) === event.year
      ) ?? buildUpcomingCard(event, coords)

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
          const first = yearEvents.value[0]
          applySelection(first ? { id: first.id, year: first.year } : null)
          suppressDefaultSelection = false
        } else if (!suppressDefaultSelection) {
          applySelection(defaultSelection())
        }
      }

      resolveSelectedDerived(coords)
      error.value = null
    } catch (caught) {
      error.value = toErrorMessage(caught, t)
    }
  }

  function goToPrevYear() {
    viewedYear.value -= 1
    applySelection(null)
    recompute({ defaultTo: 'firstOfYear' })
  }

  function goToNextYear() {
    viewedYear.value += 1
    applySelection(null)
    recompute({ defaultTo: 'firstOfYear' })
  }

  function selectShower(id: MeteorShowerId, year: number) {
    const exists =
      yearEvents.value.some((e) => e.id === id && e.year === year) ||
      upcomingEvents.some((e) => e.id === id && e.year === year)
    if (!exists) return
    applySelection({ id, year })
    suppressDefaultSelection = false
    resolveSelectedDerived(coordinates.value)
  }

  function clearSelected() {
    applySelection(null)
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
    selectedYear,
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
