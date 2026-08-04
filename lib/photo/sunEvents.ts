import { Body, Observer, SearchAltitude } from 'astronomy-engine'
import type {
  BlueHourInfo,
  GoldenHourInfo,
  NightWindow,
  TimeRange,
  TwilightInfo
} from '../../types/photo'

function iso(d: Date): string {
  return d.toISOString()
}

function rangeOrNull(start: Date | null, end: Date | null): TimeRange | null {
  if (!start || !end) return null
  if (end.getTime() <= start.getTime()) return null
  return { start: iso(start), end: iso(end) }
}

function searchSunAlt(
  observer: Observer,
  direction: 1 | -1,
  from: Date,
  altitude: number,
  limitDays = 1
): Date | null {
  const t = SearchAltitude(Body.Sun, observer, direction, from, limitDays, altitude)
  return t ? t.date : null
}

function durationMinutes(a: TimeRange | null, b: TimeRange | null): number | null {
  let total = 0
  let any = false
  for (const r of [a, b]) {
    if (!r) continue
    any = true
    total += (new Date(r.end).getTime() - new Date(r.start).getTime()) / 60_000
  }
  return any ? Math.round(total) : null
}

export function getGoldenHourInfo(
  lat: number,
  lng: number,
  night: NightWindow
): GoldenHourInfo {
  const observer = new Observer(lat, lng, 0)
  const sunset = new Date(night.sunset)
  const sunrise = new Date(night.sunrise)

  // Evening: sun descends +6 → -4, search backward/forward around sunset
  const eveStart = searchSunAlt(observer, -1, new Date(sunset.getTime() - 3 * 3600_000), 6, 1)
  const eveEnd = searchSunAlt(observer, -1, eveStart ?? new Date(sunset.getTime() - 2 * 3600_000), -4, 1)
  const evening = rangeOrNull(eveStart, eveEnd)

  // Morning: sun ascends -4 → +6 near sunrise
  const mornStart = searchSunAlt(observer, +1, new Date(sunrise.getTime() - 3 * 3600_000), -4, 1)
  const mornEnd = searchSunAlt(observer, +1, mornStart ?? new Date(sunrise.getTime() - 2 * 3600_000), 6, 1)
  const morning = rangeOrNull(mornStart, mornEnd)

  return {
    morning,
    evening,
    durationMinutes: durationMinutes(morning, evening)
  }
}

export function getBlueHourInfo(
  lat: number,
  lng: number,
  night: NightWindow
): BlueHourInfo {
  const observer = new Observer(lat, lng, 0)
  const sunset = new Date(night.sunset)
  const sunrise = new Date(night.sunrise)

  const eveStart = searchSunAlt(observer, -1, new Date(sunset.getTime() - 2 * 3600_000), -4, 1)
  const eveEnd = searchSunAlt(observer, -1, eveStart ?? sunset, -6, 1)
  const morningStart = searchSunAlt(observer, +1, new Date(sunrise.getTime() - 2 * 3600_000), -6, 1)
  const morningEnd = searchSunAlt(observer, +1, morningStart ?? sunrise, -4, 1)

  return {
    evening: rangeOrNull(eveStart, eveEnd),
    morning: rangeOrNull(morningStart, morningEnd)
  }
}

function twilightBand(
  observer: Observer,
  night: NightWindow,
  upperAlt: number,
  lowerAlt: number
): { morning: TimeRange | null; evening: TimeRange | null } {
  const sunset = new Date(night.sunset)
  const sunrise = new Date(night.sunrise)
  const eveStart = searchSunAlt(observer, -1, new Date(sunset.getTime() - 2 * 3600_000), upperAlt, 1)
  const eveEnd = searchSunAlt(observer, -1, eveStart ?? sunset, lowerAlt, 1)
  const mornStart = searchSunAlt(observer, +1, new Date(sunrise.getTime() - 3 * 3600_000), lowerAlt, 1)
  const mornEnd = searchSunAlt(observer, +1, mornStart ?? sunrise, upperAlt, 1)
  return {
    evening: rangeOrNull(eveStart, eveEnd),
    morning: rangeOrNull(mornStart, mornEnd)
  }
}

export function getTwilightInfo(
  lat: number,
  lng: number,
  night: NightWindow
): TwilightInfo {
  const observer = new Observer(lat, lng, 0)
  return {
    civil: twilightBand(observer, night, 0, -6),
    nautical: twilightBand(observer, night, -6, -12),
    astronomical: twilightBand(observer, night, -12, -18)
  }
}
