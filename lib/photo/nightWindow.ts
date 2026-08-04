import { Body, Observer, SearchRiseSet } from 'astronomy-engine'
import type { NightWindow } from '../../types/photo'

function startOfLocalDay(when: Date, lng: number): Date {
  // Approximate local day using longitude offset (hours)
  const offsetMs = (lng / 15) * 3600_000
  const local = new Date(when.getTime() + offsetMs)
  const y = local.getUTCFullYear()
  const m = local.getUTCMonth()
  const d = local.getUTCDate()
  // local midnight → UTC
  return new Date(Date.UTC(y, m, d, 0, 0, 0) - offsetMs)
}

function windowFromDayStart(
  observer: Observer,
  dayStart: Date
): NightWindow | null {
  const sunset = SearchRiseSet(Body.Sun, observer, -1, dayStart, 2)
  if (!sunset) return null
  const sunrise = SearchRiseSet(Body.Sun, observer, +1, sunset.date, 2)
  if (!sunrise) return null
  if (sunrise.date.getTime() <= sunset.date.getTime()) return null
  return {
    sunset: sunset.date.toISOString(),
    sunrise: sunrise.date.toISOString()
  }
}

function containsInstant(window: NightWindow, when: Date): boolean {
  const t = when.getTime()
  return (
    t >= new Date(window.sunset).getTime() &&
    t < new Date(window.sunrise).getTime()
  )
}

/**
 * Product “tonight”: if `when` is already after sunset and before sunrise,
 * return that ongoing night — not the next calendar day's sunset.
 */
export function getNightWindow(
  lat: number,
  lng: number,
  when: Date
): NightWindow | null {
  const observer = new Observer(lat, lng, 0)
  const dayStart = startOfLocalDay(when, lng)
  const candidate = windowFromDayStart(observer, dayStart)

  if (candidate) {
    if (containsInstant(candidate, when)) {
      return candidate
    }

    // Before tonight's sunset: prefer previous night if still ongoing.
    if (when.getTime() < new Date(candidate.sunset).getTime()) {
      const prevDayStart = new Date(dayStart.getTime() - 24 * 3600_000)
      const previous = windowFromDayStart(observer, prevDayStart)
      if (previous && containsInstant(previous, when)) {
        return previous
      }
    }

    return candidate
  }

  // No sunset for this calendar day (polar edge): still try previous night.
  const prevDayStart = new Date(dayStart.getTime() - 24 * 3600_000)
  const previous = windowFromDayStart(observer, prevDayStart)
  if (previous && containsInstant(previous, when)) {
    return previous
  }

  return null
}
