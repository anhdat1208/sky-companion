import { describe, expect, it } from 'vitest'
import { buildMeteorObservationGuide } from '../../../lib/meteor/guide'

describe('meteor observation guide', () => {
  it('recommends naked eye and not telescope', () => {
    const guide = buildMeteorObservationGuide({
      recommendedTime: 'Sau nửa đêm đến trước bình minh',
      interference: 'moderate'
    })
    expect(guide.equipment).toHaveLength(3)
    expect(guide.equipment.find((e) => e.kind === 'naked-eye')?.recommended).toBe(true)
    expect(guide.equipment.find((e) => e.kind === 'telescope')?.recommended).toBe(false)
    expect(guide.cloudReminder.length).toBeGreaterThan(0)
    expect(guide.moonlightImpact.toLowerCase()).toMatch(/trăng|moon|ánh/)
  })
})
