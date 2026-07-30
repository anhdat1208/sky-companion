import {
  Body,
  Equator,
  Horizon,
  Observer
} from 'astronomy-engine'
import type { PlanetInfo } from '../types/astronomy'

const OBSERVABLE_PLANETS = [
  Body.Mercury,
  Body.Venus,
  Body.Mars,
  Body.Jupiter,
  Body.Saturn
] as const

function round(value: number): number {
  return Math.round(value * 10) / 10
}

function altitudeFor(
  body: Body,
  observer: Observer,
  time: Date
): { altitude: number, azimuth: number } {
  const equatorial = Equator(body, time, observer, true, true)
  const horizontal = Horizon(
    time,
    observer,
    equatorial.ra,
    equatorial.dec,
    'normal'
  )

  return {
    altitude: horizontal.altitude,
    azimuth: horizontal.azimuth
  }
}

export function getPlanetInfos(
  lat: number,
  lng: number,
  when: Date
): PlanetInfo[] {
  const observer = new Observer(lat, lng, 0)
  const sun = altitudeFor(Body.Sun, observer, when)

  return OBSERVABLE_PLANETS.map((body) => {
    const position = altitudeFor(body, observer, when)

    return {
      name: body,
      altitude: round(position.altitude),
      azimuth: round(position.azimuth),
      // Visible when above horizon during astronomical twilight or darker.
      isVisible: position.altitude > 0 && sun.altitude < -6
    }
  })
}
