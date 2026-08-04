import { describe, expect, it } from 'vitest'
import { buildAstroPhotographySnapshot } from '../../../lib/photo/snapshot'
import { evaluateMilkyWayConditionsAt } from '../../../lib/photo/milkyWay'

const LAT = 21.0285
const LNG = 105.8542
const WHEN = new Date(Date.UTC(2026, 7, 3, 8, 0, 0))

describe('buildAstroPhotographySnapshot', () => {
  it('fills score and sections for Hanoi', () => {
    const snap = buildAstroPhotographySnapshot(LAT, LNG, WHEN)
    expect(snap.nightWindow).not.toBeNull()
    expect(snap.score).not.toBeNull()
    expect(snap.milkyWay).not.toBeNull()
    expect(snap.goldenHour).not.toBeNull()
    expect(snap.timeline).not.toBeNull()
    expect(snap.suggestedSettings).not.toBeNull()
  })

  it('scores MW visibility at representative mid-dark, not GC peak', () => {
    const snap = buildAstroPhotographySnapshot(LAT, LNG, WHEN)
    expect(snap.nightWindow).not.toBeNull()
    expect(snap.milkyWay).not.toBeNull()
    expect(snap.score).not.toBeNull()
    expect(snap.twilight).not.toBeNull()

    // Card may still show peak-oriented Excellent / coreVisible.
    expect(snap.milkyWay!.visibility).toBe('Excellent')
    expect(snap.milkyWay!.coreVisible).toBe(true)
    expect(snap.milkyWay!.bestTime).not.toBeNull()

    const darkStart = snap.twilight!.astronomical.evening!.end
    const darkEnd = snap.twilight!.astronomical.morning!.start
    const representative = new Date(
      (new Date(darkStart).getTime() + new Date(darkEnd).getTime()) / 2
    )
    const atRep = evaluateMilkyWayConditionsAt(LAT, LNG, representative)

    // Hanoi 2026-08-03 mid-dark: MW not visible (bright moon) while peak is Excellent.
    expect(atRep.visibility).toBe('Not Visible')
    expect(atRep.coreVisible).toBe(false)
    expect(atRep.visibility).not.toBe(snap.milkyWay!.visibility)

    // Score must follow representative, not peak.
    expect(snap.score!.stars).toBe(1)
    expect(snap.score!.label).toBe('Poor')
  })

  it('omits moonrise/moonset markers outside the night window', () => {
    const snap = buildAstroPhotographySnapshot(LAT, LNG, WHEN)
    expect(snap.nightWindow).not.toBeNull()
    expect(snap.timeline).not.toBeNull()
    expect(snap.moon).not.toBeNull()

    const sunsetMs = new Date(snap.nightWindow!.sunset).getTime()
    const sunriseMs = new Date(snap.nightWindow!.sunrise).getTime()

    // Fixture has moonset after sunrise — must not appear on timeline.
    expect(snap.moon!.moonset).not.toBeNull()
    expect(new Date(snap.moon!.moonset!).getTime()).toBeGreaterThan(sunriseMs)

    for (const kind of ['moonrise', 'moonset'] as const) {
      const marker = snap.timeline!.markers.find((m) => m.kind === kind)
      if (!marker) continue
      const at = new Date(marker.at).getTime()
      expect(at).toBeGreaterThanOrEqual(sunsetMs)
      expect(at).toBeLessThanOrEqual(sunriseMs)
    }

    expect(
      snap.timeline!.markers.some((m) => m.kind === 'moonset')
    ).toBe(false)
  })
})
