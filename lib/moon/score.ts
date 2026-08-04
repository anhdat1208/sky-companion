import type { ObservationScore, ObservationScoreLabel } from '../../types/moon'

function labelForStars(stars: 1 | 2 | 3 | 4 | 5): ObservationScoreLabel {
  if (stars === 1) return 'Poor'
  if (stars === 2 || stars === 3) return 'Fair'
  if (stars === 4) return 'Good'
  return 'Excellent'
}

function clampStars(value: number): 1 | 2 | 3 | 4 | 5 {
  const rounded = Math.round(value)
  if (rounded <= 1) return 1
  if (rounded === 2) return 2
  if (rounded === 3) return 3
  if (rounded === 4) return 4
  return 5
}

export function computeObservationScore(
  altitudeDeg: number,
  _phaseAngleDeg: number,
  illuminatedPercentage: number
): ObservationScore {
  const reasons: string[] = []
  let stars: number

  if (altitudeDeg < 0) {
    stars = 1
    reasons.push('Mặt Trăng đang dưới chân trời.')
  } else if (altitudeDeg < 15) {
    stars = 2
    reasons.push('Cao độ thấp — điều kiện quan sát hạn chế.')
  } else if (altitudeDeg < 40) {
    stars = 3
    reasons.push('Cao độ trung bình.')
  } else {
    stars = 4
    reasons.push('Cao độ tốt cho quan sát.')
  }

  if (illuminatedPercentage < 5) {
    stars = Math.min(stars, 1)
    reasons.push('Gần New Moon — bề mặt hầu như không thấy.')
  } else if (altitudeDeg >= 0 && illuminatedPercentage >= 30 && illuminatedPercentage <= 70) {
    stars += 1
    reasons.push('Pha gần quarter — terminator rõ, hợp xem hố va chạm.')
  } else if (illuminatedPercentage >= 90 && altitudeDeg >= 15) {
    stars += 1
    reasons.push('Gần Full Moon — sáng, hợp chụp phong cảnh.')
  }

  const clamped = clampStars(stars)
  return {
    stars: clamped,
    label: labelForStars(clamped),
    reasons: reasons.slice(0, 3)
  }
}
