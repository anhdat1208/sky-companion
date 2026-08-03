import { describe, expect, it, vi, afterEach } from 'vitest'
import { ref } from 'vue'
import type { Coordinates } from '../../types/location'
import { useMoonCalendar } from '../../app/composables/useMoonCalendar'
import * as calendar from '../../lib/moon/calendar'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useMoonCalendar', () => {
  const fixed = new Date(2026, 7, 3, 12, 0, 0)

  it('builds today, month days, and upcoming events for coordinates', () => {
    const coordinates = ref<Coordinates | null>({ lat: 21.0285, lng: 105.8542 })
    const api = useMoonCalendar(coordinates, fixed)

    expect(api.error.value).toBeNull()
    expect(api.today.value).not.toBeNull()
    expect(api.monthDays.value.length).toBeGreaterThanOrEqual(35)
    expect(api.upcomingEvents.value).toHaveLength(4)
    expect(api.todayScore.value?.stars).toBeGreaterThanOrEqual(1)
    expect(api.todayPhotography.value).not.toBeNull()
  })

  it('navigates months and selects an in-month day', () => {
    const coordinates = ref<Coordinates | null>({ lat: 21.0285, lng: 105.8542 })
    const api = useMoonCalendar(coordinates, fixed)

    expect(api.viewedMonth.value).toBe(8)
    api.goToNextMonth()
    expect(api.viewedMonth.value).toBe(9)
    api.goToPrevMonth()
    expect(api.viewedMonth.value).toBe(8)

    api.selectDay('2026-08-03')
    expect(api.selectedDateISO.value).toBe('2026-08-03')
    expect(api.selectedDetail.value?.dateISO).toBe('2026-08-03')

    api.selectDay('2026-07-27') // padding day — ignored
    expect(api.selectedDateISO.value).toBe('2026-08-03')

    api.clearSelectedDay()
    expect(api.selectedDetail.value).toBeNull()
  })

  it('clears derived state when coordinates become null', () => {
    const coordinates = ref<Coordinates | null>({ lat: 21.0285, lng: 105.8542 })
    const api = useMoonCalendar(coordinates, fixed)
    coordinates.value = null
    expect(api.today.value).toBeNull()
    expect(api.monthDays.value).toEqual([])
    expect(api.upcomingEvents.value).toEqual([])
  })

  it('surfaces calculation errors', () => {
    const coordinates = ref<Coordinates | null>({ lat: 21.0285, lng: 105.8542 })
    vi.spyOn(calendar, 'buildMoonTodaySnapshot').mockImplementationOnce(() => {
      throw new Error('boom moon')
    })
    const api = useMoonCalendar(coordinates, fixed)
    expect(api.error.value).toBe('boom moon')
  })
})
