import type {
  BodyState,
  UniverseObserver,
  UniverseSnapshot
} from '../../../types/universe'
import { getBodyContent } from '../content'
import {
  earthHelioKm,
  heliocentricBodyStates,
  sunBodyState,
  vec3
} from './bodies'
import { buildEarthExtras, earthRotationRad } from './earth'
import { buildMoonExtras, moonBodyState } from './moon'

export function buildUniverseSnapshot(
  time: Date,
  observer?: UniverseObserver
): UniverseSnapshot {
  const sun = sunBodyState()
  const planets = heliocentricBodyStates(time)
  const earthKm = earthHelioKm(time)
  const earthState = planets.find((body) => body.id === 'earth')
  const earthScene = earthState?.position ?? vec3(0, 0, 0)

  const moon = moonBodyState(time, earthKm, earthScene)

  const bodies: BodyState[] = [
    sun,
    ...planets.map((body) => {
      if (body.id === 'earth') {
        return {
          ...body,
          rotationRad: earthRotationRad(time),
          radiusKm: getBodyContent('earth').radiusKm
        }
      }
      return body
    }),
    moon
  ]

  return {
    timeIso: time.toISOString(),
    bodies,
    earth: buildEarthExtras(time, observer),
    moon: buildMoonExtras(time)
  }
}
