import {
  Body,
  Equator,
  GeoVector,
  Horizon,
  Observer,
  SearchRiseSet
} from 'astronomy-engine'

export const AU_KM = 149597870.7
export const MOON_RADIUS_KM = 1737.4

function round(value: number, decimals = 1): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

export function getMoonHorizontal(
  lat: number,
  lng: number,
  when: Date
): { altitude: number; azimuth: number } {
  const observer = new Observer(lat, lng, 0)
  const equatorial = Equator(Body.Moon, when, observer, true, true)
  const horizontal = Horizon(
    when,
    observer,
    equatorial.ra,
    equatorial.dec,
    'normal'
  )
  return {
    altitude: round(horizontal.altitude),
    azimuth: round(horizontal.azimuth)
  }
}

export function getMoonRiseSet(
  lat: number,
  lng: number,
  when: Date
): { riseTime: string | null; setTime: string | null } {
  const observer = new Observer(lat, lng, 0)
  const rise = SearchRiseSet(Body.Moon, observer, 1, when, 2)
  const set = SearchRiseSet(Body.Moon, observer, -1, when, 2)
  return {
    riseTime: rise?.date.toISOString() ?? null,
    setTime: set?.date.toISOString() ?? null
  }
}

export function getMoonDistanceKm(when: Date): number {
  const vector = GeoVector(Body.Moon, when, true)
  return Math.round(vector.Length() * AU_KM)
}

export function getMoonAngularDiameterDeg(distanceKm: number): number {
  const radians = 2 * Math.atan(MOON_RADIUS_KM / distanceKm)
  return round((radians * 180) / Math.PI, 3)
}
