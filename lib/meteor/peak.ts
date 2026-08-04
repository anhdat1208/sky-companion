// lib/meteor/peak.ts
import { SearchSunLongitude, SunPosition } from 'astronomy-engine'
import type { MeteorShowerDefinition, MeteorShowerEvent } from '../../types/meteor'
import { METEOR_SHOWER_CATALOG } from './catalog'

export function solarLongitudeDeg(when: Date): number {
  return SunPosition(when).elon
}

/** Approximate UTC date when λ☉ ≈ targetLonDeg in `year` (Jan 1 ≈ 280°). */
function estimateSolarLongitudeDate(year: number, targetLonDeg: number): Date {
  const lon = ((targetLonDeg % 360) + 360) % 360
  const daysFromJan1 = (lon - 280 + 360) % 360
  return new Date(Date.UTC(year, 0, 1, 0, 0, 0) + daysFromJan1 * 86_400_000)
}

/**
 * Find UTC instant in `year` when apparent solar longitude ≈ targetLonDeg.
 * For targets that fall in early January (e.g. Quadrantids ~283°), search
 * from late December of the previous year and prefer the crossing whose
 * calendar year matches `year`.
 */
export function findSolarLongitudeTime(year: number, targetLonDeg: number): Date {
  const lon = ((targetLonDeg % 360) + 360) % 360
  const approx = estimateSolarLongitudeDate(year, lon)
  const start = new Date(approx.getTime() - 15 * 86_400_000)
  const time = SearchSunLongitude(lon, start, 30)

  if (!time) {
    throw new Error(`Could not find solar longitude ${targetLonDeg}° in year ${year}`)
  }

  const date = time.date
  // If search returned previous-year December for a January shower meant for `year`,
  // re-search strictly inside `year`.
  if (date.getUTCFullYear() < year) {
    const yearStart = new Date(Date.UTC(year, 0, 1, 0, 0, 0))
    const retry = SearchSunLongitude(lon, yearStart, 30)
    if (retry) return retry.date
  }

  return date
}

export function buildShowerEvent(
  def: MeteorShowerDefinition,
  year: number
): MeteorShowerEvent {
  const peak = findSolarLongitudeTime(year, def.peakSolarLongitudeDeg)
  let activeStart = findSolarLongitudeTime(year, def.activeSolarLongitudeDeg.start)
  let activeEnd = findSolarLongitudeTime(year, def.activeSolarLongitudeDeg.end)

  // Handle wrap: if start λ > end λ (e.g. spans new year), start may be previous year.
  if (def.activeSolarLongitudeDeg.start > def.activeSolarLongitudeDeg.end) {
    activeStart = findSolarLongitudeTime(year, def.activeSolarLongitudeDeg.start)
    // If start landed after peak, use previous year's start crossing.
    if (activeStart.getTime() > peak.getTime()) {
      activeStart = findSolarLongitudeTime(year - 1, def.activeSolarLongitudeDeg.start)
    }
    if (activeEnd.getTime() < peak.getTime()) {
      activeEnd = findSolarLongitudeTime(year + 1, def.activeSolarLongitudeDeg.end)
    }
  }

  // Clamp ordering safety for non-wrapping ranges
  if (activeStart.getTime() > peak.getTime()) {
    activeStart = new Date(peak.getTime() - 5 * 24 * 3600 * 1000)
  }
  if (activeEnd.getTime() < peak.getTime()) {
    activeEnd = new Date(peak.getTime() + 5 * 24 * 3600 * 1000)
  }

  return {
    id: def.id,
    year,
    name: def.name,
    peakAt: peak.toISOString(),
    activeStart: activeStart.toISOString(),
    activeEnd: activeEnd.toISOString(),
    zhr: def.zhr,
    difficulty: def.difficulty
  }
}

export function listShowerEventsForYear(year: number): MeteorShowerEvent[] {
  return METEOR_SHOWER_CATALOG
    .map((def) => buildShowerEvent(def, year))
    .sort((a, b) => new Date(a.peakAt).getTime() - new Date(b.peakAt).getTime())
}

export function listUpcomingShowerEvents(
  now: Date,
  limit = 8
): MeteorShowerEvent[] {
  const year = now.getUTCFullYear()
  const pool = [
    ...listShowerEventsForYear(year),
    ...listShowerEventsForYear(year + 1)
  ]
  return pool
    .filter((e) => new Date(e.peakAt).getTime() >= now.getTime())
    .sort((a, b) => new Date(a.peakAt).getTime() - new Date(b.peakAt).getTime())
    .slice(0, limit)
}
