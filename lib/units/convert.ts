const KM_PER_MILE = 1.609344

export function kmToMiles(km: number): number {
  return km / KM_PER_MILE
}

export function milesToKm(mi: number): number {
  return mi * KM_PER_MILE
}

export function celsiusToFahrenheit(c: number): number {
  return (c * 9) / 5 + 32
}

export function fahrenheitToCelsius(f: number): number {
  return ((f - 32) * 5) / 9
}

export function kmhToMph(kmh: number): number {
  return kmToMiles(kmh)
}

export function mphToKmh(mph: number): number {
  return milesToKm(mph)
}
