import { describe, expect, it } from 'vitest'
import { buildAstroPhotographySnapshot } from '../../../lib/photo/snapshot'

describe('buildAstroPhotographySnapshot', () => {
  it('fills score and sections for Hanoi', () => {
    const snap = buildAstroPhotographySnapshot(
      21.0285,
      105.8542,
      new Date(Date.UTC(2026, 7, 3, 8, 0, 0))
    )
    expect(snap.nightWindow).not.toBeNull()
    expect(snap.score).not.toBeNull()
    expect(snap.milkyWay).not.toBeNull()
    expect(snap.goldenHour).not.toBeNull()
    expect(snap.timeline).not.toBeNull()
    expect(snap.suggestedSettings).not.toBeNull()
  })
})
