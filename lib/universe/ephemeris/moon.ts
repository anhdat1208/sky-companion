import { Body, GeoVector, Illumination, MoonPhase } from 'astronomy-engine'
import type { BodyState, MoonExtras } from '../../../types/universe'
import { getBodyContent } from '../content'
import { moonPhaseIconKey } from '../../moon/phase'
import { AU_KM, auVectorToKm, auVectorToScene, kmVectorToScene, vec3 } from './bodies'

export function moonGeoKm(time: Date): { x: number, y: number, z: number } {
  const vector = GeoVector(Body.Moon, time, true)
  return auVectorToKm(vector.x, vector.y, vector.z)
}

export function moonDistanceKm(time: Date): number {
  const m = moonGeoKm(time)
  return Math.hypot(m.x, m.y, m.z)
}

export function buildMoonExtras(time: Date): MoonExtras {
  const illumination = Illumination(Body.Moon, time)
  const phaseAngle = MoonPhase(time)
  return {
    phaseFraction: illumination.phase_fraction,
    phaseNameKey: moonPhaseIconKey(phaseAngle),
    distanceKm: moonDistanceKm(time)
  }
}

/**
 * Moon body state in heliocentric scene space = Earth helio + geo moon.
 */
export function moonBodyState(
  time: Date,
  earthPositionKm: { x: number, y: number, z: number },
  earthScene: { x: number, y: number, z: number }
): BodyState {
  const geo = GeoVector(Body.Moon, time, true)
  const moonKm = auVectorToKm(geo.x, geo.y, geo.z)
  const content = getBodyContent('moon')

  // For Solar System view: place moon near Earth using exaggerated Earth–Moon separation
  const geoScene = auVectorToScene(geo.x, geo.y, geo.z)
  // Boost Moon separation so it is visible next to exaggerated Earth
  const boost = 8
  const position = vec3(
    earthScene.x + geoScene.x * boost,
    earthScene.y + geoScene.y * boost,
    earthScene.z + geoScene.z * boost
  )

  return {
    id: 'moon',
    position,
    positionKm: vec3(
      earthPositionKm.x + moonKm.x,
      earthPositionKm.y + moonKm.y,
      earthPositionKm.z + moonKm.z
    ),
    radiusKm: content.radiusKm,
    rotationRad: 0
  }
}

/** Earth–Moon system local scene: Earth at origin, Moon on geo vector. */
export function moonRelativeToEarthScene(time: Date): BodyState {
  const geo = GeoVector(Body.Moon, time, true)
  const content = getBodyContent('moon')
  const moonKm = auVectorToKm(geo.x, geo.y, geo.z)
  // Educational Earth–Moon distance in local scene units
  const distanceScene = Math.max(6, Math.hypot(moonKm.x, moonKm.y, moonKm.z) / 50_000)
  const len = Math.hypot(moonKm.x, moonKm.y, moonKm.z) || 1
  return {
    id: 'moon',
    position: vec3(
      (moonKm.x / len) * distanceScene,
      (moonKm.z / len) * distanceScene,
      (-moonKm.y / len) * distanceScene
    ),
    positionKm: moonKm,
    radiusKm: content.radiusKm,
    rotationRad: 0
  }
}

export { kmVectorToScene }
