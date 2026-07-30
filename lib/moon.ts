import {
  Body,
  Equator,
  Horizon,
  Illumination,
  MoonPhase,
  Observer,
  SearchRiseSet
} from 'astronomy-engine'
import type { MoonInfo } from '../types/astronomy'

const PHASE_NAMES = [
  'New Moon',
  'Waxing Crescent',
  'First Quarter',
  'Waxing Gibbous',
  'Full Moon',
  'Waning Gibbous',
  'Last Quarter',
  'Waning Crescent'
] as const

function round(value: number, decimals = 1): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

export function moonPhaseName(phaseAngle: number): string {
  const normalized = ((phaseAngle % 360) + 360) % 360
  return PHASE_NAMES[Math.round(normalized / 45) % PHASE_NAMES.length]!
}

export function getMoonInfo(
  lat: number,
  lng: number,
  when: Date
): MoonInfo {
  const observer = new Observer(lat, lng, 0)
  const equatorial = Equator(Body.Moon, when, observer, true, true)
  const horizontal = Horizon(
    when,
    observer,
    equatorial.ra,
    equatorial.dec,
    'normal'
  )
  const phaseAngle = MoonPhase(when)
  const illumination = Illumination(Body.Moon, when)
  const rise = SearchRiseSet(Body.Moon, observer, 1, when, 2)
  const set = SearchRiseSet(Body.Moon, observer, -1, when, 2)

  return {
    altitude: round(horizontal.altitude),
    azimuth: round(horizontal.azimuth),
    riseTime: rise?.date.toISOString() ?? null,
    setTime: set?.date.toISOString() ?? null,
    illuminatedPercentage: round(illumination.phase_fraction * 100),
    phase: moonPhaseName(phaseAngle)
  }
}
