import {
  Body,
  Equator,
  Horizon,
  Observer,
  SearchRiseSet
} from 'astronomy-engine'
import { azimuthToDirection } from '../direction'
import type { DynamicBody, RankedTarget, TargetDetail, TargetObject } from '../../types/telescope'

const BODY_MAP: Record<DynamicBody, Body> = {
  moon: Body.Moon,
  mercury: Body.Mercury,
  venus: Body.Venus,
  mars: Body.Mars,
  jupiter: Body.Jupiter,
  saturn: Body.Saturn
}

function round(value: number, decimals = 1): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

function resolveEquatorial(
  target: TargetObject,
  observer: Observer,
  when: Date
): { ra: number, dec: number } {
  if (target.dynamicBody) {
    const equatorial = Equator(BODY_MAP[target.dynamicBody], when, observer, true, true)
    return { ra: equatorial.ra, dec: equatorial.dec }
  }

  if (target.raHours === null || target.decDeg === null) {
    throw new Error(`Target ${target.id} is missing equatorial coordinates.`)
  }

  return { ra: target.raHours, dec: target.decDeg }
}

export function getTargetHorizontal(
  target: TargetObject,
  lat: number,
  lng: number,
  when: Date
): { altitude: number, azimuth: number } {
  const observer = new Observer(lat, lng, 0)
  const { ra, dec } = resolveEquatorial(target, observer, when)
  const horizontal = Horizon(when, observer, ra, dec, 'normal')

  return {
    altitude: round(horizontal.altitude),
    azimuth: round(horizontal.azimuth)
  }
}

function findAltitudeCrossing(
  target: TargetObject,
  lat: number,
  lng: number,
  start: Date,
  direction: 1 | -1,
  hoursLimit = 24
): Date | null {
  const stepMs = 10 * 60 * 1000
  const limitMs = hoursLimit * 60 * 60 * 1000
  let previous = getTargetHorizontal(target, lat, lng, start).altitude
  let t = start.getTime()

  for (let elapsed = stepMs; elapsed <= limitMs; elapsed += stepMs) {
    const at = new Date(t + elapsed)
    const altitude = getTargetHorizontal(target, lat, lng, at).altitude
    const crossed = direction === 1
      ? previous < 0 && altitude >= 0
      : previous >= 0 && altitude < 0

    if (crossed) {
      return at
    }

    previous = altitude
  }

  return null
}

export function getTargetRiseSet(
  target: TargetObject,
  lat: number,
  lng: number,
  when: Date
): { riseTime: string | null, setTime: string | null } {
  if (target.dynamicBody) {
    const observer = new Observer(lat, lng, 0)
    const body = BODY_MAP[target.dynamicBody]
    const rise = SearchRiseSet(body, observer, 1, when, 2)
    const set = SearchRiseSet(body, observer, -1, when, 2)

    return {
      riseTime: rise?.date.toISOString() ?? null,
      setTime: set?.date.toISOString() ?? null
    }
  }

  const rise = findAltitudeCrossing(target, lat, lng, when, 1)
  const set = findAltitudeCrossing(target, lat, lng, when, -1)

  return {
    riseTime: rise?.toISOString() ?? null,
    setTime: set?.toISOString() ?? null
  }
}

export function buildTargetDetail(
  ranked: RankedTarget,
  lat: number,
  lng: number,
  when: Date
): TargetDetail {
  const riseSet = getTargetRiseSet(ranked.target, lat, lng, when)

  return {
    ...ranked,
    direction: azimuthToDirection(ranked.azimuth),
    riseTime: riseSet.riseTime,
    setTime: riseSet.setTime
  }
}
