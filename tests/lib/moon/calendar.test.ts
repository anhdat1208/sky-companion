import { describe, expect, it } from 'vitest'
import {
  buildMonthCalendar,
  buildMoonDayDetail,
  buildMoonTodaySnapshot,
  toDateISO
} from '../../../lib/moon/calendar'

describe('moon calendar', () => {
  // Local noon keeps isToday stable across timezones (vs UTC ISO fixtures).
  const now = new Date(2026, 7, 3, 12, 0, 0)

  it('formats dateISO as YYYY-MM-DD', () => {
    expect(toDateISO(2026, 8, 3)).toBe('2026-08-03')
  })

  it('builds a Monday-start grid covering August 2026', () => {
    const days = buildMonthCalendar(21.0285, 105.8542, 2026, 8, now)
    expect(days.length === 35 || days.length === 42).toBe(true)
    const inMonth = days.filter(d => d.inCurrentMonth)
    expect(inMonth).toHaveLength(31)
    expect(inMonth.some(d => d.isToday)).toBe(true)
    // 2026-08-01 is Saturday → first cell should be 2026-07-27 (Monday)
    expect(days[0]!.dateISO).toBe('2026-07-27')
    expect(days[0]!.inCurrentMonth).toBe(false)
  })

  it('builds day detail with score and photography', () => {
    const detail = buildMoonDayDetail(21.0285, 105.8542, 2026, 8, 3, now)
    expect(detail.dateISO).toBe('2026-08-03')
    expect(detail.observationScore.stars).toBeGreaterThanOrEqual(1)
    expect(detail.photography.notes.length).toBeGreaterThan(0)
    expect(detail.distanceKm).toBeGreaterThan(0)
  })

  it('builds today snapshot with timestamp', () => {
    const today = buildMoonTodaySnapshot(21.0285, 105.8542, now)
    expect(today.timestamp).toBe(now.toISOString())
    expect(today.ageDays).toBeGreaterThanOrEqual(0)
    expect(today.angularDiameterDeg).toBeGreaterThan(0)
  })
})
