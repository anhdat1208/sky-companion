import type { BrightnessLabel, IssBrightness } from '../../types/iss'

/** ISS standard visual magnitude at 1000 km, 90° phase (MVP constant). */
export const ISS_STD_MAG = -1.3

const MAG_RANGE_OFFSET = 15.4
const MAG_RANGE_COEFF = 5
const MAG_PHASE_COEFF = 2.5
const PHASE_SIN_EPSILON = 1e-6

const CIVIL_TWILIGHT_ALT_DEG = -6

export function estimateIssMagnitude(rangeKm: number, phaseAngleDeg: number): number {
  // stdMag ≈  -1.3  (ISS std magnitude constant used for MVP)
  // mag = stdMag - 15.4 + 5*log10(rangeKm) - 2.5*log10(sin(phase)+ε phase term)
  const phaseRad = (phaseAngleDeg * Math.PI) / 180
  const phaseTerm = Math.sin(phaseRad) + PHASE_SIN_EPSILON
  return (
    ISS_STD_MAG
    - MAG_RANGE_OFFSET
    + MAG_RANGE_COEFF * Math.log10(rangeKm)
    - MAG_PHASE_COEFF * Math.log10(phaseTerm)
  )
}

export function magnitudeToLabel(
  magnitude: number | null,
  opts?: { sunlit?: boolean; darkSky?: boolean }
): BrightnessLabel {
  const sunlit = opts?.sunlit ?? true
  const darkSky = opts?.darkSky ?? true

  if (!sunlit || !darkSky || magnitude === null) {
    return 'Not Visible'
  }

  if (magnitude <= -2) return 'Bright'
  if (magnitude <= 0) return 'Moderate'
  if (magnitude <= 3) return 'Dim'
  return 'Not Visible'
}

export function getIssBrightness(input: {
  rangeKm: number
  phaseAngleDeg: number
  sunlit: boolean
  sunAltitudeDeg: number
}): IssBrightness {
  const magnitude = estimateIssMagnitude(input.rangeKm, input.phaseAngleDeg)
  const darkSky = input.sunAltitudeDeg < CIVIL_TWILIGHT_ALT_DEG
  const label = magnitudeToLabel(magnitude, {
    sunlit: input.sunlit,
    darkSky
  })

  return { magnitude, label }
}
