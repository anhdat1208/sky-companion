import { describe, expect, it } from 'vitest'
import {
  moonConditionsAt,
  moonInterferenceFromIllumination
} from '../../../lib/meteor/moon'

describe('meteor moon interference', () => {
  it('maps illumination buckets', () => {
    expect(moonInterferenceFromIllumination(0)).toBe('none')
    expect(moonInterferenceFromIllumination(9.9)).toBe('none')
    expect(moonInterferenceFromIllumination(10)).toBe('low')
    expect(moonInterferenceFromIllumination(29.9)).toBe('low')
    expect(moonInterferenceFromIllumination(30)).toBe('moderate')
    expect(moonInterferenceFromIllumination(59.9)).toBe('moderate')
    expect(moonInterferenceFromIllumination(60)).toBe('high')
    expect(moonInterferenceFromIllumination(84.9)).toBe('high')
    expect(moonInterferenceFromIllumination(85)).toBe('severe')
    expect(moonInterferenceFromIllumination(100)).toBe('severe')
  })

  it('returns illumination at a given time', () => {
    const result = moonConditionsAt(new Date(Date.UTC(2026, 0, 1, 12, 0, 0)))
    expect(result.illuminationPct).toBeGreaterThanOrEqual(0)
    expect(result.illuminationPct).toBeLessThanOrEqual(100)
    expect(result.interference).toBe(moonInterferenceFromIllumination(result.illuminationPct))
  })
})
