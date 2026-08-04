import { describe, expect, it } from 'vitest'
import { buildMeteorNotificationHooks } from '../../../lib/meteor/notifications'
import type { MeteorShowerEvent } from '../../../types/meteor'

describe('meteor notification hooks', () => {
  it('builds t-24h, t-2h, and peak-started from peakAt', () => {
    const event: MeteorShowerEvent = {
      id: 'perseids',
      year: 2026,
      name: 'Perseids',
      peakAt: '2026-08-12T20:00:00.000Z',
      activeStart: '2026-07-17T00:00:00.000Z',
      activeEnd: '2026-08-24T00:00:00.000Z',
      zhr: 100,
      difficulty: 'easy'
    }
    const hooks = buildMeteorNotificationHooks(event)
    expect(hooks).toHaveLength(3)
    expect(hooks.map((h) => h.kind)).toEqual([
      't-minus-24h',
      't-minus-2h',
      'peak-started'
    ])
    const peak = Date.parse(event.peakAt)
    expect(Date.parse(hooks[0]!.fireAt)).toBe(peak - 24 * 3600 * 1000)
    expect(Date.parse(hooks[1]!.fireAt)).toBe(peak - 2 * 3600 * 1000)
    expect(Date.parse(hooks[2]!.fireAt)).toBe(peak)
    expect(hooks[0]!.title).toContain('Perseids')
  })
})
