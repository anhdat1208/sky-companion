import { NextMoonQuarter, SearchMoonQuarter } from 'astronomy-engine'
import type { MoonQuarterEvent, MoonQuarterType } from '../../types/moon'

const QUARTER_TYPES: readonly MoonQuarterType[] = [
  'new',
  'first-quarter',
  'full',
  'last-quarter'
] as const

function daysRemaining(at: Date, now: Date): number {
  const ms = at.getTime() - now.getTime()
  return Math.max(0, Math.ceil(ms / 86_400_000))
}

export function listUpcomingMoonQuarters(
  now: Date,
  count = 4
): MoonQuarterEvent[] {
  const events: MoonQuarterEvent[] = []
  let cursor = SearchMoonQuarter(now)

  for (let i = 0; i < count; i += 1) {
    const at = cursor.time.date
    events.push({
      type: QUARTER_TYPES[cursor.quarter]!,
      at: at.toISOString(),
      daysRemaining: daysRemaining(at, now)
    })
    cursor = NextMoonQuarter(cursor)
  }

  return events
}
