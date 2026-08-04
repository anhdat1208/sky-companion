import type {
  AstroPhotographySnapshot,
  NightWindow,
  TimeRange,
  TwilightInfo
} from '../../types/photo'
import { getMoonInfo } from '../moon'
import { getNightWindow } from './nightWindow'
import {
  getBlueHourInfo,
  getGoldenHourInfo,
  getTwilightInfo
} from './sunEvents'
import {
  buildMilkyWayPhotoInfo,
  evaluateMilkyWayConditionsAt
} from './milkyWay'
import { buildMoonPhotoInfo } from './moonPhoto'
import { listPlanetPhotoInfos } from './planets'
import { computePhotographyScore } from './score'
import { getCameraSettings } from './settings'
import { buildPhotoTimeline } from './timeline'

function astronomicalDarkRange(twilight: TwilightInfo): TimeRange | null {
  const eve = twilight.astronomical.evening
  const morn = twilight.astronomical.morning
  if (!eve || !morn) return null
  const start = eve.end
  const end = morn.start
  if (new Date(end).getTime() <= new Date(start).getTime()) return null
  return { start, end }
}

function midpoint(startIso: string, endIso: string): Date {
  const a = new Date(startIso).getTime()
  const b = new Date(endIso).getTime()
  return new Date((a + b) / 2)
}

/** Prefer mid astronomical dark, else midnight between sunset/sunrise, else `when`. */
function pickRepresentativeInstant(
  night: NightWindow,
  dark: TimeRange | null,
  when: Date
): Date {
  if (dark) {
    return midpoint(dark.start, dark.end)
  }
  const sunsetMs = new Date(night.sunset).getTime()
  const sunriseMs = new Date(night.sunrise).getTime()
  if (sunriseMs > sunsetMs) {
    return new Date((sunsetMs + sunriseMs) / 2)
  }
  return when
}

function withinNightWindow(
  iso: string | null,
  night: NightWindow
): string | null {
  if (!iso) return null
  const t = new Date(iso).getTime()
  if (
    t >= new Date(night.sunset).getTime() &&
    t <= new Date(night.sunrise).getTime()
  ) {
    return iso
  }
  return null
}

function emptySnapshot(when: Date): AstroPhotographySnapshot {
  return {
    timestamp: when.toISOString(),
    nightWindow: null,
    score: null,
    milkyWay: null,
    goldenHour: null,
    blueHour: null,
    twilight: null,
    moon: null,
    planets: null,
    timeline: null,
    suggestedSettings: getCameraSettings('milky-way')
  }
}

export function buildAstroPhotographySnapshot(
  lat: number,
  lng: number,
  when: Date
): AstroPhotographySnapshot {
  const nightWindow = getNightWindow(lat, lng, when)
  if (!nightWindow) {
    return emptySnapshot(when)
  }

  const goldenHour = getGoldenHourInfo(lat, lng, nightWindow)
  const blueHour = getBlueHourInfo(lat, lng, nightWindow)
  const twilight = getTwilightInfo(lat, lng, nightWindow)
  const dark = astronomicalDarkRange(twilight)
  const hasAstronomicalDarkness = dark !== null
  const representative = pickRepresentativeInstant(nightWindow, dark, when)

  // Card: peak-oriented MW fields. Score: visibility/core at representative.
  const milkyWay = buildMilkyWayPhotoInfo(
    lat,
    lng,
    when,
    nightWindow,
    dark
  )
  const mwAtRep = evaluateMilkyWayConditionsAt(lat, lng, representative)
  const moon = buildMoonPhotoInfo(lat, lng, when, nightWindow)
  const planets = listPlanetPhotoInfos(lat, lng, representative)

  const moonAtRep = getMoonInfo(lat, lng, representative)
  const score = computePhotographyScore({
    milkyWayVisibility: mwAtRep.visibility,
    hasAstronomicalDarkness,
    moonAltitudeDeg: moonAtRep.altitude,
    moonIlluminationPct: moonAtRep.illuminatedPercentage,
    coreVisible: mwAtRep.coreVisible
  })

  const anyPlanetVisible = planets.some((p) => p.isVisible)
  const timeline = buildPhotoTimeline({
    window: nightWindow,
    golden: goldenHour,
    blue: blueHour,
    twilight,
    moonrise: withinNightWindow(moon.moonrise, nightWindow),
    moonset: withinNightWindow(moon.moonset, nightWindow),
    milkyWayPeak: milkyWay.bestTime,
    planetMarkerAt: anyPlanetVisible ? representative.toISOString() : null,
    planetMarkerEnd: null
  })

  return {
    timestamp: when.toISOString(),
    nightWindow,
    score,
    milkyWay,
    goldenHour,
    blueHour,
    twilight,
    moon,
    planets,
    timeline,
    suggestedSettings: getCameraSettings('milky-way')
  }
}
