import type { PhotographyGuide } from '../../types/moon'

export function buildPhotographyGuide(
  illuminatedPercentage: number,
  riseTime: string | null
): PhotographyGuide {
  const bestForLandscape = illuminatedPercentage >= 70
  const bestForCraters = illuminatedPercentage >= 30 && illuminatedPercentage <= 70
  const bestForMoonrise = riseTime !== null && illuminatedPercentage >= 50

  let recommendedFocalLengthMm: { min: number; max: number }
  if (bestForCraters) {
    recommendedFocalLengthMm = { min: 200, max: 600 }
  } else if (bestForMoonrise && !bestForLandscape) {
    recommendedFocalLengthMm = { min: 70, max: 200 }
  } else if (bestForLandscape) {
    recommendedFocalLengthMm = { min: 24, max: 70 }
  } else {
    recommendedFocalLengthMm = { min: 50, max: 200 }
  }

  const notes: string[] = []
  if (bestForLandscape) {
    notes.push('Độ sáng cao — phù hợp chụp phong cảnh có Mặt Trăng.')
  }
  if (bestForCraters) {
    notes.push('Terminator rõ — hợp chụp chi tiết bề mặt / hố va chạm.')
  }
  if (bestForMoonrise) {
    notes.push('Có giờ mọc — cân nhắc khung silhouette lúc Mặt Trăng lên.')
  }
  if (notes.length === 0) {
    notes.push('Điều kiện trung tính — thử tele vừa phải và theo dõi cao độ.')
  }

  return {
    bestForLandscape,
    bestForCraters,
    bestForMoonrise,
    recommendedFocalLengthMm,
    notes
  }
}
