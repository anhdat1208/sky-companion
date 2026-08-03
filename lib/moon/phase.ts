import { Body, Illumination, MoonPhase } from 'astronomy-engine'
import type { MoonPhaseIconKey, MoonPhaseName } from '../../types/moon'

export const SYNODIC_MONTH_DAYS = 29.530588853

const PHASE_NAMES: readonly MoonPhaseName[] = [
  'New Moon',
  'Waxing Crescent',
  'First Quarter',
  'Waxing Gibbous',
  'Full Moon',
  'Waning Gibbous',
  'Last Quarter',
  'Waning Crescent'
] as const

const PHASE_ICONS: readonly MoonPhaseIconKey[] = [
  'new',
  'waxing-crescent',
  'first-quarter',
  'waxing-gibbous',
  'full',
  'waning-gibbous',
  'last-quarter',
  'waning-crescent'
] as const

function round(value: number, decimals = 1): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

export function normalizePhaseAngle(phaseAngleDeg: number): number {
  return ((phaseAngleDeg % 360) + 360) % 360
}

export function moonPhaseName(phaseAngleDeg: number): MoonPhaseName {
  const normalized = normalizePhaseAngle(phaseAngleDeg)
  return PHASE_NAMES[Math.round(normalized / 45) % 8]!
}

export function moonPhaseIconKey(phaseAngleDeg: number): MoonPhaseIconKey {
  const normalized = normalizePhaseAngle(phaseAngleDeg)
  return PHASE_ICONS[Math.round(normalized / 45) % 8]!
}

export function illuminatedPercentage(when: Date): number {
  const illumination = Illumination(Body.Moon, when)
  return round(illumination.phase_fraction * 100)
}

export function moonAgeDays(phaseAngleDeg: number): number {
  const normalized = normalizePhaseAngle(phaseAngleDeg)
  return round((normalized / 360) * SYNODIC_MONTH_DAYS, 1)
}

export function moonPhaseAngleDeg(when: Date): number {
  return MoonPhase(when)
}
