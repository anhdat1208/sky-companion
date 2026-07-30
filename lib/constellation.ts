import {
  Constellation,
  SiderealTime
} from 'astronomy-engine'
import type { ConstellationInfo } from '../types/astronomy'

/**
 * Returns the constellation nearest the observer's zenith.
 * Astronomy Engine exposes constellation lookup by equatorial coordinates,
 * so local sidereal time and latitude provide a pragmatic overhead point.
 */
export function getConstellationInfo(
  lat: number,
  lng: number,
  when: Date
): ConstellationInfo {
  const zenithRightAscension = (
    (SiderealTime(when) + lng / 15) % 24 + 24
  ) % 24
  const constellation = Constellation(zenithRightAscension, lat)

  return { name: constellation.name }
}
