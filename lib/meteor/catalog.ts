// lib/meteor/catalog.ts
import type { MeteorShowerDefinition, MeteorShowerId } from '../../types/meteor'

export const METEOR_SHOWER_CATALOG: readonly MeteorShowerDefinition[] = [
  {
    id: 'quadrantids',
    name: 'Quadrantids',
    iauCode: 'QUA',
    description:
      'Mưa sao băng đầu năm với ZHR cao nhưng đỉnh ngắn. Radiant gần chòm Bootes (tên lịch sử Quadrans Muralis).',
    originConstellation: 'Bootes',
    peakSolarLongitudeDeg: 283.15,
    activeSolarLongitudeDeg: { start: 278.0, end: 292.0 },
    zhr: 120,
    radiantRaHours: 15.333,
    radiantDecDeg: 49.0,
    speedKmS: 41,
    parentComet: '2003 EH1',
    peakDurationHours: 6,
    difficulty: 'moderate',
    sourceNote: 'IMO Working List — peak λ☉ 283.15°, ZHR 120'
  },
  {
    id: 'lyrids',
    name: 'Lyrids',
    iauCode: 'LYR',
    description:
      'Mưa sao băng mùa xuân từ sao chổi Thatcher; tốc độ trung bình, ZHR khiêm tốn nhưng ổn định.',
    originConstellation: 'Lyra',
    peakSolarLongitudeDeg: 32.32,
    activeSolarLongitudeDeg: { start: 24.0, end: 39.0 },
    zhr: 18,
    radiantRaHours: 18.067,
    radiantDecDeg: 34.0,
    speedKmS: 49,
    parentComet: 'C/1861 G1 (Thatcher)',
    peakDurationHours: 12,
    difficulty: 'easy',
    sourceNote: 'IMO Working List — peak λ☉ 32.32°, ZHR 18'
  },
  {
    id: 'eta-aquariids',
    name: 'Eta Aquariids',
    iauCode: 'ETA',
    description:
      'Mảnh vụn sao chổi Halley; tốt hơn ở bán cầu Nam. Radiant gần Sao Thủy bình minh.',
    originConstellation: 'Aquarius',
    peakSolarLongitudeDeg: 45.5,
    activeSolarLongitudeDeg: { start: 30.0, end: 60.0 },
    zhr: 50,
    radiantRaHours: 22.533,
    radiantDecDeg: -1.0,
    speedKmS: 66,
    parentComet: '1P/Halley',
    peakDurationHours: 12,
    difficulty: 'moderate',
    sourceNote: 'IMO Working List — peak λ☉ 45.5°, ZHR 50'
  },
  {
    id: 'perseids',
    name: 'Perseids',
    iauCode: 'PER',
    description:
      'Mưa sao băng mùa hè nổi tiếng; nhiều lửa sáng, radiant trong Perseus, ZHR cao quanh giữa tháng 8.',
    originConstellation: 'Perseus',
    peakSolarLongitudeDeg: 140.0,
    activeSolarLongitudeDeg: { start: 120.0, end: 155.0 },
    zhr: 100,
    radiantRaHours: 3.2,
    radiantDecDeg: 58.0,
    speedKmS: 59,
    parentComet: '109P/Swift-Tuttle',
    peakDurationHours: 24,
    difficulty: 'easy',
    sourceNote: 'IMO Working List — peak λ☉ 140.0°, ZHR 100'
  },
  {
    id: 'orionids',
    name: 'Orionids',
    iauCode: 'ORI',
    description:
      'Nhánh Halley thứ hai trong năm; meteors nhanh, radiant gần Orion trước bình minh.',
    originConstellation: 'Orion',
    peakSolarLongitudeDeg: 208.0,
    activeSolarLongitudeDeg: { start: 192.0, end: 223.0 },
    zhr: 20,
    radiantRaHours: 6.333,
    radiantDecDeg: 16.0,
    speedKmS: 66,
    parentComet: '1P/Halley',
    peakDurationHours: 12,
    difficulty: 'easy',
    sourceNote: 'IMO Working List — peak λ☉ 208°, ZHR 20'
  },
  {
    id: 'leonids',
    name: 'Leonids',
    iauCode: 'LEO',
    description:
      'Mưa nhanh từ Tempel-Tuttle; ZHR nền thấp, đôi khi có storm lịch sử. Radiant trong Leo.',
    originConstellation: 'Leo',
    peakSolarLongitudeDeg: 235.27,
    activeSolarLongitudeDeg: { start: 224.0, end: 245.0 },
    zhr: 15,
    radiantRaHours: 10.133,
    radiantDecDeg: 22.0,
    speedKmS: 71,
    parentComet: '55P/Tempel-Tuttle',
    peakDurationHours: 12,
    difficulty: 'challenging',
    sourceNote: 'IMO Working List — peak λ☉ 235.27°, ZHR 15'
  },
  {
    id: 'geminids',
    name: 'Geminids',
    iauCode: 'GEM',
    description:
      'Một trong những mưa mạnh và đáng tin cậy nhất; liên quan tiểu hành tinh Phaethon, nhiều meteors sáng.',
    originConstellation: 'Gemini',
    peakSolarLongitudeDeg: 262.2,
    activeSolarLongitudeDeg: { start: 254.0, end: 271.0 },
    zhr: 150,
    radiantRaHours: 7.467,
    radiantDecDeg: 33.0,
    speedKmS: 35,
    parentComet: '3200 Phaethon',
    peakDurationHours: 24,
    difficulty: 'easy',
    sourceNote: 'IMO Working List — peak λ☉ 262.2°, ZHR 150'
  },
  {
    id: 'ursids',
    name: 'Ursids',
    iauCode: 'URS',
    description:
      'Mưa cuối năm gần Thiên Long (Ursa Minor); ZHR thấp, quan sát quanh solstice mùa đông.',
    originConstellation: 'Ursa Minor',
    peakSolarLongitudeDeg: 270.7,
    activeSolarLongitudeDeg: { start: 262.0, end: 275.0 },
    zhr: 10,
    radiantRaHours: 14.467,
    radiantDecDeg: 76.0,
    speedKmS: 33,
    parentComet: '8P/Tuttle',
    peakDurationHours: 12,
    difficulty: 'challenging',
    sourceNote: 'IMO Working List — peak λ☉ 270.7°, ZHR 10'
  }
]

export function getShowerDefinition(id: MeteorShowerId): MeteorShowerDefinition {
  const found = METEOR_SHOWER_CATALOG.find((s) => s.id === id)
  if (!found) {
    throw new Error(`Unknown meteor shower id: ${id}`)
  }
  return found
}
