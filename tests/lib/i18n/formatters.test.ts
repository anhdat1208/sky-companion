import { describe, expect, it } from 'vitest'
import {
  formatDate,
  formatMonth,
  formatNumber,
  formatTime,
  formatWeekday
} from '../../../lib/i18n/formatters'

const WHEN = new Date('2026-08-04T15:30:00+07:00')

describe('locale formatters', () => {
  it('formats weekday differently for en and vi', () => {
    const en = formatWeekday(WHEN, 'en-US')
    const vi = formatWeekday(WHEN, 'vi-VN')
    expect(en).toMatch(/Tuesday|Tue/)
    expect(vi.toLowerCase()).toContain('ba')
  })

  it('formats month names by locale', () => {
    expect(formatMonth(WHEN, 'en-US')).toMatch(/August|Aug/)
    expect(formatMonth(WHEN, 'vi-VN').toLowerCase()).toContain('8')
  })

  it('formats numbers with locale separators', () => {
    expect(formatNumber(1234.5, 'en-US', { maximumFractionDigits: 1 })).toBe('1,234.5')
    expect(formatNumber(1234.5, 'vi-VN', { maximumFractionDigits: 1 })).toBe('1.234,5')
  })

  it('formats date and time without throwing', () => {
    expect(formatDate(WHEN, 'en-US').length).toBeGreaterThan(0)
    expect(formatTime(WHEN, 'en-US').length).toBeGreaterThan(0)
  })
})
