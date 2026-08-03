import {
  Body,
  Equator,
  Horizon,
  Observer
} from 'astronomy-engine'
import * as satellite from 'satellite.js'
import type { BrightnessLabel, IssBrightness } from '../../types/iss'
import type { ParsedTle } from './tle'

/** ISS standard visual magnitude at 1000 km, 90° phase (MVP constant). */
export const ISS_STD_MAG = -1.3

const MAG_RANGE_OFFSET = 15.4
const MAG_RANGE_COEFF = 5
const MAG_PHASE_COEFF = 2.5
const PHASE_SIN_EPSILON = 1e-6

const CIVIL_TWILIGHT_ALT_DEG = -6
const KM_PER_AU = 149597870.7

export function estimateIssMagnitude(rangeKm: number, phaseAngleDeg: number): number {
  // stdMag ≈  -1.3  (ISS std magnitude constant used for MVP)
  // mag = stdMag - 15.4 + 5*log10(rangeKm) - 2.5*log10(sin(phase)+ε phase term)
  const phaseRad = (phaseAngleDeg * Math.PI) / 180
  const phaseTerm = Math.sin(phaseRad) + PHASE_SIN_EPSILON
  return (
    ISS_STD_MAG
    - MAG_RANGE_OFFSET
    + MAG_RANGE_COEFF * Math.log10(rangeKm)
    - MAG_PHASE_COEFF * Math.log10(phaseTerm)
  )
}

export function magnitudeToLabel(
  magnitude: number | null,
  opts?: { sunlit?: boolean; darkSky?: boolean }
): BrightnessLabel {
  const sunlit = opts?.sunlit ?? true
  const darkSky = opts?.darkSky ?? true

  if (!sunlit || !darkSky || magnitude === null) {
    return 'Not Visible'
  }

  if (magnitude <= -2) return 'Bright'
  if (magnitude <= 0) return 'Moderate'
  if (magnitude <= 3) return 'Dim'
  return 'Not Visible'
}

export function getIssBrightness(input: {
  rangeKm: number
  phaseAngleDeg: number
  sunlit: boolean
  sunAltitudeDeg: number
}): IssBrightness {
  const magnitude = estimateIssMagnitude(input.rangeKm, input.phaseAngleDeg)
  const darkSky = input.sunAltitudeDeg < CIVIL_TWILIGHT_ALT_DEG
  const label = magnitudeToLabel(magnitude, {
    sunlit: input.sunlit,
    darkSky
  })

  return { magnitude, label }
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

function observerGeodetic(lat: number, lng: number) {
  return {
    latitude: satellite.degreesToRadians(lat),
    longitude: satellite.degreesToRadians(lng),
    height: 0
  }
}

function isIssSunlit(positionEci: satellite.EciVec3<number>, when: Date): boolean {
  const sun = satellite.sunPos(julianDay(when))
  const fraction = satellite.shadowFraction(sun.rsun, positionEci)
  return Number.isFinite(fraction) && fraction < 1
}

function sunAltitudeDeg(lat: number, lng: number, when: Date): number {
  const obs = new Observer(lat, lng, 0)
  const equatorial = Equator(Body.Sun, when, obs, true, true)
  const horizontal = Horizon(when, obs, equatorial.ra, equatorial.dec, 'normal')
  return horizontal.altitude
}

function phaseAngleDeg(
  satEci: satellite.EciVec3<number>,
  sunEciAu: satellite.EciVec3<number>,
  observerEci: satellite.EciVec3<number>
): number {
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

/**
 * Current visual brightness for an observer at `when`
 * (range + phase + sunlit + sun altitude → magnitude/label).
 */
export function computeCurrentBrightness(
  tle: ParsedTle,
  lat: number,
  lng: number,
  when: Date
): IssBrightness {
  const satrec = satellite.twoline2satrec(tle.line1, tle.line2)
  const pv = satellite.propagate(satrec, when)
  if (!pv || typeof pv.position === 'boolean' || !pv.position) {
    throw new Error('ISS propagation failed for brightness.')
  }

  const gmst = satellite.gstime(when)
  const geodetic = observerGeodetic(lat, lng)
  const ecf = satellite.eciToEcf(pv.position, gmst)
  const look = satellite.ecfToLookAngles(geodetic, ecf)
  const observerEcf = satellite.geodeticToEcf(geodetic)
  const observerEci = satellite.ecfToEci(observerEcf, gmst)
  const sun = satellite.sunPos(julianDay(when))
  const phase = phaseAngleDeg(pv.position, sun.rsun, observerEci)

  return getIssBrightness({
    rangeKm: look.rangeSat,
    phaseAngleDeg: phase,
    sunlit: isIssSunlit(pv.position, when),
    sunAltitudeDeg: sunAltitudeDeg(lat, lng, when)
  })
}
