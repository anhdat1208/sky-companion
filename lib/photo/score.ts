import type { MilkyWayVisibility } from '../../types/astronomy'
import type { PhotographyScore, PhotographyScoreLabel } from '../../types/photo'

export interface PhotographyScoreInput {
  milkyWayVisibility: MilkyWayVisibility
  hasAstronomicalDarkness: boolean
  moonAltitudeDeg: number
  moonIlluminationPct: number
  coreVisible: boolean | null
}

const MW_VISIBILITY_STARS: Record<MilkyWayVisibility, 1 | 2 | 3 | 4 | 5> = {
  Excellent: 5,
  Good: 4,
  Poor: 2,
  'Not Visible': 1
}

function labelForStars(stars: 1 | 2 | 3 | 4 | 5): PhotographyScoreLabel {
  if (stars === 1) return 'Poor'
  if (stars === 2 || stars === 3) return 'Fair'
  if (stars === 4) return 'Good'
  return 'Excellent'
}

function clampStars(value: number): 1 | 2 | 3 | 4 | 5 {
  if (value <= 1) return 1
  if (value >= 5) return 5
  return value as 1 | 2 | 3 | 4 | 5
}

export function computePhotographyScore(
  input: PhotographyScoreInput
): PhotographyScore {
  const reasons: string[] = []

  if (!input.hasAstronomicalDarkness) {
    return {
      stars: 1,
      label: 'Poor',
      reasons: ['Trời chưa tối thiên văn.'].slice(0, 3),
      cloudCoverPct: null
    }
  }

  let stars = MW_VISIBILITY_STARS[input.milkyWayVisibility]

  if (input.moonAltitudeDeg <= 0) {
    reasons.push('Trăng dưới chân trời.')
  } else if (input.moonIlluminationPct >= 70) {
    stars = Math.max(1, stars - 1)
    reasons.push('Trăng sáng trên chân trời — nhiễu sáng.')
  }

  if (input.coreVisible === false && stars > 1) {
    stars -= 1
    reasons.push('Tâm Ngân Hà chưa lên đủ cao hoặc bị che.')
  }

  const clamped = clampStars(stars)
  return {
    stars: clamped,
    label: labelForStars(clamped),
    reasons: reasons.slice(0, 3),
    cloudCoverPct: null
  }
}
