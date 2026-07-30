import type { Direction } from '../types/astronomy'

const DIRECTIONS: readonly Direction[] = [
  'North',
  'North-East',
  'East',
  'South-East',
  'South',
  'South-West',
  'West',
  'North-West'
]

export function azimuthToDirection(azimuth: number): Direction {
  if (!Number.isFinite(azimuth)) {
    throw new RangeError('Azimuth must be a finite number.')
  }

  const normalizedAzimuth = ((azimuth % 360) + 360) % 360
  const index = Math.round(normalizedAzimuth / 45) % DIRECTIONS.length

  return DIRECTIONS[index]!
}
