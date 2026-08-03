import { Body, Equator, Horizon, Observer } from 'astronomy-engine'
import { azimuthToDirection } from '../direction'
import type {
  RankedTarget,
  RecommendedInstrument,
  TargetObject,
  TelescopeProfile
} from '../../types/telescope'
import { getCatalogTargets } from './catalog'
import { getTargetHorizontal } from './position'

function round1(value: number): number {
  return Math.round(value * 10) / 10
}

function sunAltitude(lat: number, lng: number, when: Date): number {
  const observer = new Observer(lat, lng, 0)
  const equatorial = Equator(Body.Sun, when, observer, true, true)
  return Horizon(when, observer, equatorial.ra, equatorial.dec, 'normal').altitude
}

function angularSeparationDeg(
  a: { altitude: number, azimuth: number },
  b: { altitude: number, azimuth: number }
): number {
  const dAz = Math.min(
    Math.abs(a.azimuth - b.azimuth),
    360 - Math.abs(a.azimuth - b.azimuth)
  )
  const dAlt = Math.abs(a.altitude - b.altitude)
  return Math.hypot(dAz, dAlt)
}

function clampScore(value: number): RankedTarget['visibilityScore'] {
  const clamped = Math.min(5, Math.max(1, Math.round(value)))
  return clamped as RankedTarget['visibilityScore']
}

function scoreAt(
  target: TargetObject,
  lat: number,
  lng: number,
  when: Date
): { score: number, altitude: number, azimuth: number } {
  const pos = getTargetHorizontal(target, lat, lng, when)
  const sunAlt = sunAltitude(lat, lng, when)
  let score = 1

  if (sunAlt < -6) score += 1
  if (sunAlt < -12) score += 1
  if (sunAlt < -18) score += 1
  if (pos.altitude > 30) score += 1
  if (target.apparentMagnitude !== null && target.apparentMagnitude <= 2) score += 1

  const isDeepSky = target.objectType === 'galaxy'
    || target.objectType === 'nebula'
    || target.objectType === 'starCluster'

  if (isDeepSky) {
    const moon = getCatalogTargets().find(t => t.id === 'moon')!
    const moonPos = getTargetHorizontal(moon, lat, lng, when)
    if (moonPos.altitude > 20 && angularSeparationDeg(pos, moonPos) < 40) {
      score -= 1
    }
  }

  if (pos.altitude < 0) {
    score = 1
  }

  return { score, altitude: pos.altitude, azimuth: pos.azimuth }
}

function sampleTimes(lat: number, lng: number, start: Date): Date[] {
  const times: Date[] = []
  const stepMs = 30 * 60 * 1000
  const limitMs = 24 * 60 * 60 * 1000

  for (let elapsed = 0; elapsed <= limitMs; elapsed += stepMs) {
    const at = new Date(start.getTime() + elapsed)
    times.push(at)
    if (elapsed > 0) {
      const prev = new Date(start.getTime() + elapsed - stepMs)
      const prevSun = sunAltitude(lat, lng, prev)
      const sun = sunAltitude(lat, lng, at)
      if (prevSun < 0 && sun >= 0) {
        break
      }
    }
  }

  return times
}

function adjustInstrument(
  target: TargetObject,
  profile?: TelescopeProfile
): RecommendedInstrument {
  if (!profile) {
    return target.recommendedInstrument
  }

  if (
    profile.magnification.value >= 50
    && target.apparentMagnitude !== null
    && target.apparentMagnitude > 6
  ) {
    return 'telescope'
  }

  if (
    profile.fieldOfView.trueFovDeg < 1
    && target.recommendedInstrument === 'binocular'
  ) {
    return 'telescope'
  }

  return target.recommendedInstrument
}

export function rankTonightTargets(
  lat: number,
  lng: number,
  when: Date,
  profile?: TelescopeProfile
): RankedTarget[] {
  const times = sampleTimes(lat, lng, when)

  return getCatalogTargets().map((target) => {
    const now = scoreAt(target, lat, lng, when)
    let best = { ...now, at: when }

    for (const sample of times) {
      const candidate = scoreAt(target, lat, lng, sample)
      if (candidate.score > best.score || (
        candidate.score === best.score && candidate.altitude > best.altitude
      )) {
        best = { ...candidate, at: sample }
      }
    }

    const visibilityScore = now.altitude < 0
      ? 1 as const
      : clampScore(now.score)

    return {
      target,
      altitude: round1(now.altitude),
      azimuth: round1(now.azimuth),
      direction: azimuthToDirection(now.azimuth),
      visibilityScore,
      bestObservationTime: best.at.toISOString(),
      difficulty: target.difficulty,
      recommendedInstrument: adjustInstrument(target, profile)
    }
  }).sort((a, b) => {
    if (b.visibilityScore !== a.visibilityScore) {
      return b.visibilityScore - a.visibilityScore
    }
    if (b.altitude !== a.altitude) {
      return b.altitude - a.altitude
    }
    const magA = a.target.apparentMagnitude ?? 99
    const magB = b.target.apparentMagnitude ?? 99
    return magA - magB
  })
}
