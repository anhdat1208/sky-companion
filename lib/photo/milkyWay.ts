import { Horizon, Observer } from 'astronomy-engine'
import { azimuthToDirection } from '../direction'
import { getMilkyWayVisibility } from '../milkyway'
import { getMoonInfo } from '../moon'
import { getSunInfo } from '../sun'
import type { MilkyWayPhotoInfo, NightWindow, TimeRange } from '../../types/photo'
import { getCameraSettings, lensLabelFromSettings } from './settings'

/** Approximate J2000 Galactic Center (Sgr A*) right ascension in hours. */
export const GC_RA_HOURS = 17.761

/** Approximate J2000 Galactic Center (Sgr A*) declination in degrees. */
export const GC_DEC_DEG = -29.007

function round1(value: number): number {
  return Math.round(value * 10) / 10
}

export function isGalacticCoreVisible(
  sunAltitudeDeg: number,
  gcAltitudeDeg: number,
  moonAltitudeDeg: number,
  moonIlluminationPct: number
): boolean {
  if (sunAltitudeDeg >= -18) return false
  if (gcAltitudeDeg < 20) return false
  if (moonAltitudeDeg > 0 && moonIlluminationPct >= 30) return false
  return true
}

export function getGalacticCenterHorizontal(
  lat: number,
  lng: number,
  when: Date
): { altitude: number; azimuth: number } {
  const observer = new Observer(lat, lng, 0)
  const horizontal = Horizon(when, observer, GC_RA_HOURS, GC_DEC_DEG, 'normal')
  return {
    altitude: round1(horizontal.altitude),
    azimuth: round1(horizontal.azimuth)
  }
}

function resolveSampleWindow(
  night: NightWindow,
  astronomicalDark: TimeRange | null
): { start: Date; end: Date } {
  if (astronomicalDark) {
    return {
      start: new Date(astronomicalDark.start),
      end: new Date(astronomicalDark.end)
    }
  }
  return {
    start: new Date(night.sunset),
    end: new Date(night.sunrise)
  }
}

function findBestTime(
  lat: number,
  lng: number,
  night: NightWindow,
  astronomicalDark: TimeRange | null
): Date | null {
  const { start, end } = resolveSampleWindow(night, astronomicalDark)
  const startMs = start.getTime()
  const endMs = end.getTime()
  if (!(endMs > startMs)) return null

  const stepMs = 10 * 60 * 1000
  let bestScore = -Infinity
  let bestWhen: Date | null = null

  for (let t = startMs; t <= endMs; t += stepMs) {
    const when = new Date(t)
    const { altitude: gcAlt } = getGalacticCenterHorizontal(lat, lng, when)
    if (gcAlt < 0) continue

    const moon = getMoonInfo(lat, lng, when)
    const moonPenalty =
      moon.altitude > 0 ? moon.illuminatedPercentage / 10 : 0
    const score = gcAlt - moonPenalty

    if (score > bestScore) {
      bestScore = score
      bestWhen = when
    }
  }

  return bestWhen
}

/** MW visibility + core at a specific instant (e.g. representative dark sky). */
export function evaluateMilkyWayConditionsAt(
  lat: number,
  lng: number,
  when: Date
): {
  visibility: ReturnType<typeof getMilkyWayVisibility>
  coreVisible: boolean
  altitudeDeg: number
  azimuthDeg: number
} {
  const sun = getSunInfo(lat, lng, when)
  const moon = getMoonInfo(lat, lng, when)
  const gc = getGalacticCenterHorizontal(lat, lng, when)

  return {
    visibility: getMilkyWayVisibility({
      sunAltitude: sun.altitude,
      moonAltitude: moon.altitude,
      moonIlluminatedPercentage: moon.illuminatedPercentage
    }),
    coreVisible: isGalacticCoreVisible(
      sun.altitude,
      gc.altitude,
      moon.altitude,
      moon.illuminatedPercentage
    ),
    altitudeDeg: gc.altitude,
    azimuthDeg: gc.azimuth
  }
}

export function buildMilkyWayPhotoInfo(
  lat: number,
  lng: number,
  when: Date,
  night: NightWindow,
  astronomicalDark: TimeRange | null
): MilkyWayPhotoInfo {
  const settings = getCameraSettings('milky-way')
  const recommendedLensLabel = lensLabelFromSettings(settings, 'wide')

  const bestWhen = findBestTime(lat, lng, night, astronomicalDark)
  const evalWhen = bestWhen ?? when
  const atPeak = evaluateMilkyWayConditionsAt(lat, lng, evalWhen)

  return {
    visibility: atPeak.visibility,
    direction: azimuthToDirection(atPeak.azimuthDeg),
    altitudeDeg: atPeak.altitudeDeg,
    bestTime: bestWhen?.toISOString() ?? null,
    coreVisible: atPeak.coreVisible,
    recommendedLensLabel,
    settings
  }
}
