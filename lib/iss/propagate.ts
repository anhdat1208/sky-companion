import * as satellite from 'satellite.js'
import type { IssPosition } from '../../types/iss'
import type { ParsedTle } from './tle'

function round(value: number, decimals: number): number {
  const f = 10 ** decimals
  return Math.round(value * f) / f
}

export function propagateIss(tle: ParsedTle, when: Date): IssPosition {
  const satrec = satellite.twoline2satrec(tle.line1, tle.line2)
  const pv = satellite.propagate(satrec, when)
  if (typeof pv.position === 'boolean' || typeof pv.velocity === 'boolean' || !pv.position || !pv.velocity) {
    throw new Error('ISS propagation failed.')
  }

  const gmst = satellite.gstime(when)
  const geodetic = satellite.eciToGeodetic(pv.position, gmst)
  const velocityKps = Math.hypot(pv.velocity.x, pv.velocity.y, pv.velocity.z)

  return {
    timestamp: when.toISOString(),
    latitude: round(satellite.degreesLat(geodetic.latitude), 4),
    longitude: round(satellite.degreesLong(geodetic.longitude), 4),
    altitudeKm: round(geodetic.height, 1),
    velocityKph: round(velocityKps * 3600, 1)
  }
}
