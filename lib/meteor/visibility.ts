import { Horizon, Observer } from 'astronomy-engine'
import { azimuthToDirection } from '../direction'
import type {
  MeteorShowerDefinition,
  MeteorVisibilityScore,
  MoonInterference,
  VisibilityScoreLabel
} from '../../types/meteor'

function labelForStars(stars: 1 | 2 | 3 | 4 | 5): VisibilityScoreLabel {
  if (stars === 1) return 'Poor'
  if (stars === 2 || stars === 3) return 'Fair'
  if (stars === 4) return 'Good'
  return 'Excellent'
}

function clampStars(value: number): 1 | 2 | 3 | 4 | 5 {
  const rounded = Math.round(value)
  if (rounded <= 1) return 1
  if (rounded >= 5) return 5
  return rounded as 2 | 3 | 4
}

export function getRadiantHorizontal(
  def: MeteorShowerDefinition,
  lat: number,
  lng: number,
  when: Date
): { altitude: number; azimuth: number } {
  const observer = new Observer(lat, lng, 0)
  const horizontal = Horizon(
    when,
    observer,
    def.radiantRaHours,
    def.radiantDecDeg,
    'normal'
  )
  return {
    altitude: Math.round(horizontal.altitude * 10) / 10,
    azimuth: Math.round(horizontal.azimuth * 10) / 10
  }
}

export function computeMeteorVisibilityScore(input: {
  altitudeDeg: number
  interference: MoonInterference
  zhr: number
}): MeteorVisibilityScore {
  const reasons: string[] = []
  let stars: number

  if (input.altitudeDeg < 0) {
    stars = 1
    reasons.push('Radiant đang dưới chân trời tại đỉnh.')
  } else if (input.altitudeDeg < 15) {
    stars = 2
    reasons.push('Radiant thấp — điều kiện hạn chế.')
  } else if (input.altitudeDeg < 40) {
    stars = 3
    reasons.push('Radiant ở độ cao trung bình.')
  } else if (input.altitudeDeg < 70) {
    stars = 4
    reasons.push('Radiant cao — thuận lợi quan sát.')
  } else {
    stars = 5
    reasons.push('Radiant rất cao trên bầu trời.')
  }

  const moonPenalty: Record<MoonInterference, number> = {
    none: 0,
    low: 0,
    moderate: 1,
    high: 2,
    severe: 3
  }
  const penalty = moonPenalty[input.interference]
  if (penalty > 0) {
    stars -= penalty
    reasons.push('Ánh Trăng làm giảm số meteor thấy được.')
  }

  if (input.zhr >= 100) {
    stars += 1
    reasons.push('ZHR cao — nhiều meteor mỗi giờ.')
  } else if (input.zhr < 20 && stars > 1) {
    stars -= 1
    reasons.push('ZHR thấp — cần kiên nhẫn.')
  }

  const clamped = clampStars(stars)
  return {
    stars: clamped,
    label: labelForStars(clamped),
    reasons: reasons.slice(0, 3),
    cloudCoverPct: null
  }
}

export function bestObservationTimeLabel(
  def: MeteorShowerDefinition,
  lat: number | null,
  lng: number | null,
  peakAt: Date
): string {
  let label = 'Sau nửa đêm đến trước bình minh (giờ địa phương) vào đêm peak'

  if (lat !== null && lng !== null) {
    const offsetMs = (lng / 15) * 3600 * 1000
    const utcMs = Date.UTC(
      peakAt.getUTCFullYear(),
      peakAt.getUTCMonth(),
      peakAt.getUTCDate(),
      0,
      0,
      0
    )
    const localMid = new Date(utcMs - offsetMs)
    const { altitude } = getRadiantHorizontal(def, lat, lng, localMid)
    if (altitude < 20) {
      label += ' — radiant còn thấp lúc nửa đêm, ưu tiên gần bình minh'
    }
  }

  return label
}

export function bestDirectionAtPeak(
  def: MeteorShowerDefinition,
  lat: number,
  lng: number,
  peakAt: Date
): string {
  const { azimuth } = getRadiantHorizontal(def, lat, lng, peakAt)
  return azimuthToDirection(azimuth)
}
