import { describe, expect, it } from 'vitest'
import { listPlanetPhotoInfos } from '../../../lib/photo/planets'

describe('listPlanetPhotoInfos', () => {
  it('returns five planets with magnitude null', () => {
    const list = listPlanetPhotoInfos(
      21.0285,
      105.8542,
      new Date(Date.UTC(2026, 7, 3, 16, 0, 0))
    )
    expect(list).toHaveLength(5)
    expect(list.every((p) => p.magnitude === null)).toBe(true)
    expect(list.map((p) => p.name)).toEqual([
      'Mercury',
      'Venus',
      'Mars',
      'Jupiter',
      'Saturn'
    ])
  })
})
