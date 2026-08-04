// tests/lib/meteor/peak.test.ts
import { describe, expect, it } from 'vitest'
import {
  buildShowerEvent,
  findSolarLongitudeTime,
  listShowerEventsForYear,
  listUpcomingShowerEvents,
  solarLongitudeDeg
} from '../../../lib/meteor/peak'
import { getShowerDefinition } from '../../../lib/meteor/catalog'

describe('meteor peak timing', () => {
  it('reads solar longitude via SunPosition', () => {
    const lon = solarLongitudeDeg(new Date(Date.UTC(2026, 0, 1, 12, 0, 0)))
    expect(lon).toBeGreaterThan(270)
    expect(lon).toBeLessThan(290)
  })

  it('places 2026 Perseids peak near mid-August (±1.5 days)', () => {
    const peak = findSolarLongitudeTime(2026, 140.0)
    expect(peak.getUTCFullYear()).toBe(2026)
    expect(peak.getUTCMonth()).toBe(7) // August
    expect(peak.getUTCDate()).toBeGreaterThanOrEqual(11)
    expect(peak.getUTCDate()).toBeLessThanOrEqual(14)
  })

  it('places Quadrantids peak in early January for the given year', () => {
    const peak = findSolarLongitudeTime(2026, 283.15)
    expect(peak.getUTCFullYear()).toBe(2026)
    expect(peak.getUTCMonth()).toBe(0)
    expect(peak.getUTCDate()).toBeLessThanOrEqual(5)
  })

  it('builds a shower event with active window around peak', () => {
    const event = buildShowerEvent(getShowerDefinition('perseids'), 2026)
    expect(event.id).toBe('perseids')
    expect(event.year).toBe(2026)
    expect(new Date(event.activeStart).getTime()).toBeLessThan(new Date(event.peakAt).getTime())
    expect(new Date(event.activeEnd).getTime()).toBeGreaterThan(new Date(event.peakAt).getTime())
  })

  it('resolves Quadrantids active window across the year boundary', () => {
    const def = getShowerDefinition('quadrantids')
    const event = buildShowerEvent(def, 2026)
    const activeStart = new Date(event.activeStart)
    const peakAt = new Date(event.peakAt)
    const activeEnd = new Date(event.activeEnd)
    const expectedStart = findSolarLongitudeTime(2025, def.activeSolarLongitudeDeg.start)

    expect(activeStart.getUTCFullYear()).toBe(2025)
    expect(activeStart.getUTCMonth()).toBe(11) // December
    expect(activeStart.getTime()).toBeLessThan(peakAt.getTime())
    expect(activeEnd.getTime()).toBeGreaterThan(peakAt.getTime())
    expect(activeEnd.getUTCFullYear()).toBe(2026)

    // Must be λ-resolved previous-year crossing, not a peak−5d calendar clamp
    expect(Math.abs(activeStart.getTime() - expectedStart.getTime())).toBeLessThan(60_000)
    expect(Math.abs(activeStart.getTime() - (peakAt.getTime() - 5 * 86_400_000))).toBeGreaterThan(
      60 * 60_000
    )

    const startLon = solarLongitudeDeg(activeStart)
    expect(startLon).toBeGreaterThanOrEqual(277)
    expect(startLon).toBeLessThanOrEqual(279)
  })

  it('lists eight events sorted by peak for a year', () => {
    const events = listShowerEventsForYear(2026)
    expect(events).toHaveLength(8)
    for (let i = 1; i < events.length; i++) {
      expect(new Date(events[i]!.peakAt).getTime()).toBeGreaterThanOrEqual(
        new Date(events[i - 1]!.peakAt).getTime()
      )
    }
  })

  it('upcoming list crosses year end', () => {
    const late = new Date(Date.UTC(2026, 11, 28, 12, 0, 0))
    const upcoming = listUpcomingShowerEvents(late, 3)
    expect(upcoming.length).toBeGreaterThan(0)
    expect(upcoming.every((e) => new Date(e.peakAt).getTime() >= late.getTime())).toBe(true)
  })
})
