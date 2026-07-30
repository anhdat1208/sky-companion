import {
  Body,
  Equator,
  Horizon,
  Observer,
  SearchRiseSet
} from 'astronomy-engine'
import type { SunInfo } from '../types/astronomy'

function round(value: number): number {
  return Math.round(value * 10) / 10
}

export function getSunInfo(
  lat: number,
  lng: number,
  when: Date
): SunInfo {
  const observer = new Observer(lat, lng, 0)
  const equatorial = Equator(Body.Sun, when, observer, true, true)
  const horizontal = Horizon(
    when,
    observer,
    equatorial.ra,
    equatorial.dec,
    'normal'
  )
  const sunrise = SearchRiseSet(Body.Sun, observer, 1, when, 2)
  const sunset = SearchRiseSet(Body.Sun, observer, -1, when, 2)

  return {
    altitude: round(horizontal.altitude),
    azimuth: round(horizontal.azimuth),
    sunrise: sunrise?.date.toISOString() ?? null,
    sunset: sunset?.date.toISOString() ?? null
  }
}
