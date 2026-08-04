import { illuminatedPercentage } from '../moon/phase'
import type { MoonInterference } from '../../types/meteor'

export function moonInterferenceFromIllumination(pct: number): MoonInterference {
  if (pct < 10) return 'none'
  if (pct < 30) return 'low'
  if (pct < 60) return 'moderate'
  if (pct < 85) return 'high'
  return 'severe'
}

export function moonConditionsAt(when: Date): {
  illuminationPct: number
  interference: MoonInterference
} {
  const illuminationPct = illuminatedPercentage(when)
  return {
    illuminationPct,
    interference: moonInterferenceFromIllumination(illuminationPct)
  }
}
