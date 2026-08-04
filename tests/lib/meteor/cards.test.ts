import { describe, expect, it } from 'vitest'
import { buildShowerEvent } from '../../../lib/meteor/peak'
import { getShowerDefinition } from '../../../lib/meteor/catalog'
import { buildEventDetail, buildUpcomingCard } from '../../../lib/meteor/cards'

describe('meteor cards', () => {
  const event = buildShowerEvent(getShowerDefinition('geminids'), 2026)

  it('builds upcoming card without coords (null score/direction)', () => {
    const card = buildUpcomingCard(event, null)
    expect(card.name).toBe('Geminids')
    expect(card.visibilityScore).toBeNull()
    expect(card.bestDirection).toBeNull()
    expect(card.expectedMeteorsPerHour).toBe(150)
    expect(card.moonIlluminationPct).toBeGreaterThanOrEqual(0)
  })

  it('builds upcoming card with coords (score + direction)', () => {
    const card = buildUpcomingCard(event, { lat: 21.03, lng: 105.85 })
    expect(card.visibilityScore?.stars).toBeGreaterThanOrEqual(1)
    expect(card.bestDirection).toBeTruthy()
  })

  it('builds event detail with visibility map stub', () => {
    const detail = buildEventDetail(event)
    expect(detail.originConstellation).toBe('Gemini')
    expect(detail.visibilityMap.status).toBe('unavailable')
    expect(detail.parentComet).toContain('Phaethon')
  })
})
