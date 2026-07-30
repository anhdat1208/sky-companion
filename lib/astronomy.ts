import type { SkySnapshot } from '../types/astronomy'
import { azimuthToDirection } from './direction'
import { getConstellationInfo } from './constellation'
import { getMilkyWayVisibility } from './milkyway'
import { getMoonInfo } from './moon'
import { getPlanetInfos } from './planets'
import { getSunInfo } from './sun'

export function buildSkySnapshot(
  lat: number,
  lng: number,
  when: Date = new Date()
): SkySnapshot {
  const moon = getMoonInfo(lat, lng, when)
  const sun = getSunInfo(lat, lng, when)
  const planets = getPlanetInfos(lat, lng, when)
  const constellation = getConstellationInfo(lat, lng, when)
  const milkyWayVisibility = getMilkyWayVisibility({
    sunAltitude: sun.altitude,
    moonAltitude: moon.altitude,
    moonIlluminatedPercentage: moon.illuminatedPercentage
  })
  const directionToLook = azimuthToDirection(moon.azimuth)

  return {
    timestamp: when.toISOString(),
    moon,
    sun,
    planets,
    constellation,
    milkyWayVisibility,
    directionToLook
  }
}
