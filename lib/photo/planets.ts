import { getPlanetInfos } from '../planets'
import type { PlanetPhotoInfo } from '../../types/photo'

type Brightness = PlanetPhotoInfo['brightness']

const BASE_BRIGHTNESS: Record<string, Brightness> = {
  Venus: 'very-bright',
  Jupiter: 'very-bright',
  Mars: 'bright',
  Saturn: 'bright',
  Mercury: 'moderate'
}

const MAGNIFICATION: Record<string, string> = {
  Mercury: '50–100x',
  Venus: '50–100x',
  Mars: '100–200x',
  Jupiter: '80–150x',
  Saturn: '100–200x'
}

const BRIGHTNESS_ORDER: Brightness[] = [
  'faint',
  'moderate',
  'bright',
  'very-bright'
]

function resolveBrightness(name: string, altitudeDeg: number): Brightness {
  const base = BASE_BRIGHTNESS[name] ?? 'moderate'
  if (altitudeDeg >= 15 || base === 'faint') return base

  const index = BRIGHTNESS_ORDER.indexOf(base)
  return BRIGHTNESS_ORDER[Math.max(0, index - 1)] ?? 'faint'
}

export function listPlanetPhotoInfos(
  lat: number,
  lng: number,
  when: Date
): PlanetPhotoInfo[] {
  return getPlanetInfos(lat, lng, when).map((planet) => ({
    name: planet.name,
    altitudeDeg: planet.altitude,
    azimuthDeg: planet.azimuth,
    isVisible: planet.isVisible,
    brightness: resolveBrightness(planet.name, planet.altitude),
    recommendedMagnification: MAGNIFICATION[planet.name] ?? '100–200x',
    magnitude: null
  }))
}
