import { describe, expect, it } from 'vitest'
import { listUpcomingMoonQuarters } from '../../../lib/moon/events'

describe('listUpcomingMoonQuarters', () => {
  it('returns four chronological quarter events', () => {
    const events = listUpcomingMoonQuarters(new Date('2026-08-03T14:00:00Z'), 4)
    expect(events).toHaveLength(4)
    for (let i = 1; i < events.length; i += 1) {
      expect(Date.parse(events[i]!.at)).toBeGreaterThan(Date.parse(events[i - 1]!.at))
    }
    for (const event of events) {
      expect(['new', 'first-quarter', 'full', 'last-quarter']).toContain(event.type)
      expect(event.daysRemaining).toBeGreaterThanOrEqual(0)
      expect(Number.isNaN(Date.parse(event.at))).toBe(false)
    }
  })
})
