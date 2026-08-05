import { Body, HelioVector } from 'astronomy-engine'
import type { BodyState, CelestialBodyId, Vec3 } from '../../../types/universe'
import { getBodyContent } from '../content'
import { auToScene, kmToScene, radiusKmToScene } from '../scale'

const AU_KM = 149_597_870.7

const HELIO_BODIES: Array<{ id: CelestialBodyId, body: Body }> = [
  { id: 'mercury', body: Body.Mercury },
  { id: 'venus', body: Body.Venus },
  { id: 'earth', body: Body.Earth },
  { id: 'mars', body: Body.Mars },
  { id: 'jupiter', body: Body.Jupiter },
  { id: 'saturn', body: Body.Saturn },
  { id: 'uranus', body: Body.Uranus },
  { id: 'neptune', body: Body.Neptune }
]

export function vec3(x: number, y: number, z: number): Vec3 {
  return { x, y, z }
}

export function auVectorToKm(x: number, y: number, z: number): Vec3 {
  return vec3(x * AU_KM, y * AU_KM, z * AU_KM)
}

export function auVectorToScene(x: number, y: number, z: number): Vec3 {
  const r = Math.hypot(x, y, z)
  if (r === 0) {
    return vec3(0, 0, 0)
  }
  const sceneR = auToScene(r)
  const scale = sceneR / r
  // astronomy-engine: +X ~ equinox, +Z ~ north; map Z-up for Three.js Y-up
  return vec3(x * scale, z * scale, -y * scale)
}

export function kmVectorToScene(x: number, y: number, z: number): Vec3 {
  return auVectorToScene(x / AU_KM, y / AU_KM, z / AU_KM)
}

export function sunBodyState(): BodyState {
  const content = getBodyContent('sun')
  return {
    id: 'sun',
    position: vec3(0, 0, 0),
    positionKm: vec3(0, 0, 0),
    radiusKm: content.radiusKm,
    rotationRad: 0
  }
}

export function heliocentricBodyStates(time: Date): BodyState[] {
  return HELIO_BODIES.map(({ id, body }) => {
    const vector = HelioVector(body, time)
    const content = getBodyContent(id)
    return {
      id,
      position: auVectorToScene(vector.x, vector.y, vector.z),
      positionKm: auVectorToKm(vector.x, vector.y, vector.z),
      radiusKm: content.radiusKm,
      rotationRad: 0
    }
  })
}

export function earthHelioKm(time: Date): Vec3 {
  const vector = HelioVector(Body.Earth, time)
  return auVectorToKm(vector.x, vector.y, vector.z)
}

export { AU_KM, kmToScene, radiusKmToScene }
