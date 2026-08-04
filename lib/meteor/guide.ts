import type { MeteorObservationGuide, MoonInterference } from '../../types/meteor'

const MOON_IMPACT: Record<MoonInterference, string> = {
  none: 'Ánh Trăng rất yếu — nền trời tối, thuận lợi.',
  low: 'Ánh Trăng thấp — vẫn quan sát tốt ở nơi tối.',
  moderate: 'Ánh Trăng trung bình — tránh hướng Mặt Trăng, ưu tiên meteor sáng.',
  high: 'Ánh Trăng mạnh — chỉ thấy meteor sáng; cần bầu trời thật tối.',
  severe: 'Gần Trăng tròn — nhiễu sáng cao, số meteor thấy được giảm mạnh.'
}

export function buildMeteorObservationGuide(input: {
  recommendedTime: string
  interference: MoonInterference
}): MeteorObservationGuide {
  return {
    recommendedTime: input.recommendedTime,
    darkSkyRequirement:
      'Tránh đèn đô thị; nơi tối (công viên ngoại ô, nông thôn) giúp thấy meteor mờ.',
    moonlightImpact: MOON_IMPACT[input.interference],
    cloudReminder:
      'Mây che sẽ chặn meteor — kiểm tra mây trước khi đi. Tích hợp dự báo sẽ có sau.',
    equipment: [
      {
        kind: 'naked-eye',
        recommended: true,
        note: 'Cách chính: nằm ngửa, nhìn rộng bầu trời, không cần ống nhòm.'
      },
      {
        kind: 'binoculars',
        recommended: false,
        note: 'Có thể dùng để xem vệt lửa kéo dài, không hợp quét cả bầu trời.'
      },
      {
        kind: 'telescope',
        recommended: false,
        note: 'Không khuyến nghị — thị trường hẹp, dễ bỏ lỡ meteor.'
      }
    ]
  }
}
