import type { MilkyWayVisibility } from '../types/astronomy'

export interface MilkyWayContext {
  sunAltitude: number
  moonAltitude: number
  moonIlluminatedPercentage: number
}

/**
 * Rule-based Milky Way visibility for MVP (no light-pollution/weather APIs).
 * Requires astronomical darkness (sun below -18°), then grades by moonlight.
 */
export function getMilkyWayVisibility(
  context: MilkyWayContext
): MilkyWayVisibility {
  const { sunAltitude, moonAltitude, moonIlluminatedPercentage } = context

  if (sunAltitude > -18) {
    return 'Not Visible'
  }

  if (moonAltitude <= 0) {
    return 'Excellent'
  }

  if (moonIlluminatedPercentage < 30) {
    return 'Good'
  }

  if (moonIlluminatedPercentage < 70) {
    return 'Poor'
  }

  return 'Not Visible'
}
