import { SiderealTime, SunPosition } from 'astronomy-engine'
import type { EarthExtras, SeasonKey, UniverseObserver, Vec3 } from '../../../types/universe'
import { earthHelioKm, vec3 } from './bodies'

export function seasonKeyFromEclipticLon(lonDeg: number): SeasonKey {
  const lon = ((lonDeg % 360) + 360) % 360
  if (lon < 90) return 'spring'
  if (lon < 180) return 'summer'
  if (lon < 270) return 'autumn'
  return 'winter'
}

export function earthRotationRad(time: Date): number {
  // SiderealTime returns hours; convert to radians (15° per hour).
  return SiderealTime(time) * (Math.PI / 12)
}

/**
 * Unit sun direction in Earth-centered frame for terminator lighting.
 * Points from Earth toward the Sun (in scene-mapped axes).
 */
export function earthSunDirection(time: Date): Vec3 {
  const earth = earthHelioKm(time)
  const len = Math.hypot(earth.x, earth.y, earth.z)
  if (len === 0) {
    return vec3(1, 0, 0)
  }
  // Sun is at origin heliocentric → direction to sun is -earth
  return vec3(-earth.x / len, -earth.y / len, -earth.z / len)
}

export function buildEarthExtras(
  time: Date,
  observer?: UniverseObserver
): EarthExtras {
  const sun = SunPosition(time)
  return {
    sunDirection: earthSunDirection(time),
    seasonKey: seasonKeyFromEclipticLon(sun.elon),
    userLat: observer?.lat ?? 0,
    userLng: observer?.lng ?? 0
  }
}
