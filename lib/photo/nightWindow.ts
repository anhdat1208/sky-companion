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

export function getNightWindow(
  lat: number,
  lng: number,
  when: Date
): NightWindow | null {
  const observer = new Observer(lat, lng, 0)
  const dayStart = startOfLocalDay(when, lng)
  // Search from local morning for sunset of this calendar day
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
