import { describe, expect, it, vi, afterEach } from 'vitest'
import { ref } from 'vue'
import type { Coordinates } from '../../types/location'
import { useMeteor } from '../../app/composables/useMeteor'
import * as peak from '../../lib/meteor/peak'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useMeteor', () => {
  const fixed = new Date(2026, 7, 3, 12, 0, 0)

  it('builds upcoming and year calendar without coordinates; scores stay null', () => {
    const coordinates = ref<Coordinates | null>(null)
    const api = useMeteor(coordinates, fixed)

    expect(api.error.value).toBeNull()
    expect(api.upcoming.value.length).toBeGreaterThan(0)
    expect(api.yearEvents.value).toHaveLength(8)
    expect(api.upcoming.value.every((c) => c.visibilityScore === null)).toBe(true)
    expect(api.selectedId.value).toBe(api.upcoming.value[0]!.id)
    expect(api.selectedDetail.value).not.toBeNull()
    expect(api.selectedGuide.value).not.toBeNull()
    expect(api.selectedScore.value).toBeNull()
    expect(api.notificationHooks.value.length).toBeGreaterThan(0)
  })

  it('fills visibility score when coordinates are set', () => {
    const coordinates = ref<Coordinates | null>({ lat: 21.0285, lng: 105.8542 })
    const api = useMeteor(coordinates, fixed)

    expect(api.error.value).toBeNull()
    expect(api.upcoming.value.some((c) => c.visibilityScore !== null)).toBe(true)
    expect(api.selectedScore.value).not.toBeNull()
    expect(api.selectedScore.value?.stars).toBeGreaterThanOrEqual(1)
  })

  it('navigates years and re-defaults selection to first event of that year', () => {
    const coordinates = ref<Coordinates | null>(null)
    const api = useMeteor(coordinates, fixed)

    expect(api.viewedYear.value).toBe(2026)
    const initialSelected = api.selectedId.value

    api.goToNextYear()
    expect(api.viewedYear.value).toBe(2027)
    expect(api.yearEvents.value).toHaveLength(8)
    expect(api.selectedId.value).toBe(api.yearEvents.value[0]!.id)

    api.goToPrevYear()
    expect(api.viewedYear.value).toBe(2026)
    expect(api.selectedId.value).toBe(api.yearEvents.value[0]!.id)
    expect(api.selectedId.value).not.toBe(initialSelected)
  })

  it('selects and clears a shower', () => {
    const coordinates = ref<Coordinates | null>(null)
    const api = useMeteor(coordinates, fixed)

    const target = api.yearEvents.value[2]!
    api.selectShower(target.id)
    expect(api.selectedId.value).toBe(target.id)
    expect(api.selectedDetail.value?.id).toBe(target.id)
    expect(api.selectedGuide.value).not.toBeNull()
    expect(api.notificationHooks.value.every((h) => h.showerId === target.id)).toBe(true)

    api.clearSelected()
    expect(api.selectedId.value).toBeNull()
    expect(api.selectedDetail.value).toBeNull()
    expect(api.selectedGuide.value).toBeNull()
    expect(api.selectedScore.value).toBeNull()
  })

  it('surfaces calculation errors', () => {
    const coordinates = ref<Coordinates | null>(null)
    vi.spyOn(peak, 'listUpcomingShowerEvents').mockImplementationOnce(() => {
      throw new Error('boom meteor')
    })
    const api = useMeteor(coordinates, fixed)
    expect(api.error.value).toBe('boom meteor')
  })

  it('uses Vietnamese fallback when thrown value is not an Error', () => {
    const coordinates = ref<Coordinates | null>(null)
    vi.spyOn(peak, 'listUpcomingShowerEvents').mockImplementationOnce(() => {
      throw 'fail'
    })
    const api = useMeteor(coordinates, fixed)
    expect(api.error.value).toBe('Không thể tính lịch mưa sao băng. Hãy thử làm mới.')
  })

  it('keeps list and calendar when coordinates become null', () => {
    const coordinates = ref<Coordinates | null>({ lat: 21.0285, lng: 105.8542 })
    const api = useMeteor(coordinates, fixed)
    const prevUpcomingLen = api.upcoming.value.length
    const prevYearLen = api.yearEvents.value.length

    coordinates.value = null

    expect(api.upcoming.value.length).toBe(prevUpcomingLen)
    expect(api.yearEvents.value.length).toBe(prevYearLen)
    expect(api.selectedScore.value).toBeNull()
    expect(api.upcoming.value.every((c) => c.visibilityScore === null)).toBe(true)
    expect(api.error.value).toBeNull()
  })
})
