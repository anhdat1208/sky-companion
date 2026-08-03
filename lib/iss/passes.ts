import {
  Body,
  Equator,
  Horizon,
  Observer
} from 'astronomy-engine'
import * as satellite from 'satellite.js'
import { azimuthToDirection } from '../direction'
import { estimateIssMagnitude } from './brightness'
import type { IssPassPrediction } from '../../types/iss'
import type { ParsedTle } from './tle'

/** Search forward window from `now` (spec §7). */
export const PASS_SEARCH_MS = 36 * 60 * 60 * 1000
/** Coarse elevation sampling step. */
export const PASS_COARSE_STEP_MS = 60 * 1000
/** Rise/set / peak refine step (~5 s). */
export const PASS_REFINE_STEP_MS = 5 * 1000

const MIN_MAX_ELEVATION_DEG = 10
const MAX_SUN_ALTITUDE_AT_MAX_DEG = -6
const HORIZON_ELEVATION_DEG = 0

type ObserverCoords = { lat: number, lng: number }

type LookSample = {
  timeMs: number
  elevationDeg: number
  azimuthDeg: number
  rangeKm: number
  sunlit: boolean
}

function julianDay(when: Date): number {
  return satellite.jday(
    when.getUTCFullYear(),
    when.getUTCMonth() + 1,
    when.getUTCDate(),
    when.getUTCHours(),
    when.getUTCMinutes(),
    when.getUTCSeconds() + when.getUTCMilliseconds() / 1000
  )
}

function observerGeodetic(observer: ObserverCoords) {
  return {
    latitude: satellite.degreesToRadians(observer.lat),
    longitude: satellite.degreesToRadians(observer.lng),
    height: 0
  }
}

/**
 * ISS sunlit check via satellite.js umbra/penumbra model.
 * `shadowFraction` is 0 = fully lit, 1 = full umbra; treat fully eclipsed as not sunlit.
 */
function isIssSunlit(positionEci: satellite.EciVec3<number>, when: Date): boolean {
  const sun = satellite.sunPos(julianDay(when))
  const fraction = satellite.shadowFraction(sun.rsun, positionEci)
  return Number.isFinite(fraction) && fraction < 1
}

function sampleLook(
  satrec: satellite.SatRec,
  observer: ObserverCoords,
  timeMs: number
): LookSample | null {
  const when = new Date(timeMs)
  const pv = satellite.propagate(satrec, when)
  if (typeof pv.position === 'boolean' || !pv.position) {
    return null
  }

  const gmst = satellite.gstime(when)
  const ecf = satellite.eciToEcf(pv.position, gmst)
  const look = satellite.ecfToLookAngles(observerGeodetic(observer), ecf)

  return {
    timeMs,
    elevationDeg: (look.elevation * 180) / Math.PI,
    azimuthDeg: ((look.azimuth * 180) / Math.PI + 360) % 360,
    rangeKm: look.rangeSat,
    sunlit: isIssSunlit(pv.position, when)
  }
}

function sunAltitudeDeg(observer: ObserverCoords, when: Date): number {
  const obs = new Observer(observer.lat, observer.lng, 0)
  const equatorial = Equator(Body.Sun, when, obs, true, true)
  const horizontal = Horizon(when, obs, equatorial.ra, equatorial.dec, 'normal')
  return horizontal.altitude
}

/** Phase angle at satellite between Sun and observer (degrees). */
function phaseAngleDeg(
  satEci: satellite.EciVec3<number>,
  sunEciAu: satellite.EciVec3<number>,
  observerEci: satellite.EciVec3<number>
): number {
  const KM_PER_AU = 149597870.7
  const toSun = {
    x: sunEciAu.x * KM_PER_AU - satEci.x,
    y: sunEciAu.y * KM_PER_AU - satEci.y,
    z: sunEciAu.z * KM_PER_AU - satEci.z
  }
  const toObs = {
    x: observerEci.x - satEci.x,
    y: observerEci.y - satEci.y,
    z: observerEci.z - satEci.z
  }
  const sunLen = Math.hypot(toSun.x, toSun.y, toSun.z)
  const obsLen = Math.hypot(toObs.x, toObs.y, toObs.z)
  if (sunLen === 0 || obsLen === 0) return 0
  const cos = (toSun.x * toObs.x + toSun.y * toObs.y + toSun.z * toObs.z) / (sunLen * obsLen)
  return (Math.acos(Math.min(1, Math.max(-1, cos))) * 180) / Math.PI
}

function magnitudeAtMax(
  satrec: satellite.SatRec,
  observer: ObserverCoords,
  maxTimeMs: number,
  rangeKm: number
): number | null {
  const when = new Date(maxTimeMs)
  const pv = satellite.propagate(satrec, when)
  if (typeof pv.position === 'boolean' || !pv.position) {
    return null
  }

  const gmst = satellite.gstime(when)
  const observerEcf = satellite.geodeticToEcf(observerGeodetic(observer))
  const observerEci = satellite.ecfToEci(observerEcf, gmst)
  const sun = satellite.sunPos(julianDay(when))
  const phase = phaseAngleDeg(pv.position, sun.rsun, observerEci)
  return estimateIssMagnitude(rangeKm, phase)
}

/** Binary-search the horizon crossing to ~PASS_REFINE_STEP_MS. */
function refineCrossing(
  satrec: satellite.SatRec,
  observer: ObserverCoords,
  leftMs: number,
  rightMs: number,
  rising: boolean
): number {
  let lo = leftMs
  let hi = rightMs
  while (hi - lo > PASS_REFINE_STEP_MS) {
    const mid = Math.floor((lo + hi) / 2)
    const sample = sampleLook(satrec, observer, mid)
    if (!sample) {
      return rising ? hi : lo
    }
    const above = sample.elevationDeg >= HORIZON_ELEVATION_DEG
    if (rising) {
      if (above) hi = mid
      else lo = mid
    } else if (above) {
      lo = mid
    } else {
      hi = mid
    }
  }
  return rising ? hi : lo
}

function findPeakInPass(
  satrec: satellite.SatRec,
  observer: ObserverCoords,
  riseMs: number,
  setMs: number
): LookSample {
  let best: LookSample | null = null
  for (let t = riseMs; t <= setMs; t += PASS_COARSE_STEP_MS) {
    const sample = sampleLook(satrec, observer, t)
    if (sample && (!best || sample.elevationDeg > best.elevationDeg)) {
      best = sample
    }
  }
  // Always sample set endpoint.
  const setSample = sampleLook(satrec, observer, setMs)
  if (setSample && (!best || setSample.elevationDeg > best.elevationDeg)) {
    best = setSample
  }
  if (!best) {
    throw new Error('Unable to sample ISS elevation during pass.')
  }

  // Refine ±1 coarse step around peak at 5 s.
  const windowStart = Math.max(riseMs, best.timeMs - PASS_COARSE_STEP_MS)
  const windowEnd = Math.min(setMs, best.timeMs + PASS_COARSE_STEP_MS)
  for (let t = windowStart; t <= windowEnd; t += PASS_REFINE_STEP_MS) {
    const sample = sampleLook(satrec, observer, t)
    if (sample && sample.elevationDeg > best.elevationDeg) {
      best = sample
    }
  }
  return best
}

function isVisiblePass(
  observer: ObserverCoords,
  peak: LookSample
): boolean {
  if (peak.elevationDeg < MIN_MAX_ELEVATION_DEG) return false
  if (!peak.sunlit) return false
  const sunAlt = sunAltitudeDeg(observer, new Date(peak.timeMs))
  return sunAlt < MAX_SUN_ALTITUDE_AT_MAX_DEG
}

/**
 * Find the soonest visible ISS pass for an observer within 36 hours.
 * Visible = max elev ≥ 10°, sun altitude at max < −6°, ISS sunlit at max.
 */
export function findNextVisiblePass(
  tle: ParsedTle,
  observer: ObserverCoords,
  now: Date
): IssPassPrediction | null {
  const satrec = satellite.twoline2satrec(tle.line1, tle.line2)
  const startMs = now.getTime()
  const endMs = startMs + PASS_SEARCH_MS

  let prev = sampleLook(satrec, observer, startMs)
  if (!prev) return null

  // If already above horizon at `now`, walk back to approximate rise within search start.
  let inPass = prev.elevationDeg >= HORIZON_ELEVATION_DEG
  let riseMs = inPass ? startMs : null

  for (let t = startMs + PASS_COARSE_STEP_MS; t <= endMs; t += PASS_COARSE_STEP_MS) {
    const curr = sampleLook(satrec, observer, t)
    if (!curr) {
      continue
    }

    const wasBelow = !prev || prev.elevationDeg < HORIZON_ELEVATION_DEG
    const isAbove = curr.elevationDeg >= HORIZON_ELEVATION_DEG

    if (!inPass && wasBelow && isAbove && prev) {
      riseMs = refineCrossing(satrec, observer, prev.timeMs, curr.timeMs, true)
      inPass = true
    }

    if (inPass && riseMs !== null && prev && !wasBelow && !isAbove) {
      const setMs = refineCrossing(satrec, observer, prev.timeMs, curr.timeMs, false)
      const peak = findPeakInPass(satrec, observer, riseMs, setMs)

      if (isVisiblePass(observer, peak)) {
        const riseSample = sampleLook(satrec, observer, riseMs)
        const setSample = sampleLook(satrec, observer, setMs)
        const riseAz = riseSample?.azimuthDeg ?? peak.azimuthDeg
        const setAz = setSample?.azimuthDeg ?? peak.azimuthDeg
        const magnitude = magnitudeAtMax(satrec, observer, peak.timeMs, peak.rangeKm)

        return {
          riseTime: new Date(riseMs).toISOString(),
          maxTime: new Date(peak.timeMs).toISOString(),
          setTime: new Date(setMs).toISOString(),
          durationSeconds: Math.floor((setMs - riseMs) / 1000),
          maxElevationDeg: Math.round(peak.elevationDeg * 10) / 10,
          direction: `${azimuthToDirection(riseAz)} → ${azimuthToDirection(setAz)}`,
          magnitude
        }
      }

      inPass = false
      riseMs = null
    }

    prev = curr
  }

  return null
}
