import { describe, expect, it } from 'vitest'
import {
  getJourney,
  getResolvedSteps,
  listAvailableJourneys,
  listJourneys
} from '../../../lib/journey/journeys'

describe('journey registry', () => {
  it('lists available and coming-soon journeys', () => {
    const all = listJourneys()
    expect(all.length).toBeGreaterThanOrEqual(9)
    const available = listAvailableJourneys()
    expect(available.map((j) => j.id).sort()).toEqual(
      ['return-home', 'to-the-sun', 'where-am-i'].sort()
    )
    expect(all.some((j) => j.status === 'coming-soon')).toBe(true)
  })

  it('defines Where Am I with 12 steps', () => {
    const journey = getJourney('where-am-i')
    expect(journey?.steps).toHaveLength(12)
    expect(journey?.steps[0]?.id).toBe('you')
    expect(journey?.steps[11]?.id).toBe('observable-universe')
  })

  it('resolves Return Home as reverse of Where Am I', () => {
    const steps = getResolvedSteps('return-home')
    expect(steps).toHaveLength(12)
    expect(steps[0]?.id).toBe('observable-universe')
    expect(steps[11]?.id).toBe('you')
    expect(steps[11]?.narration.titleKey).toContain('returnHome')
  })

  it('defines a short Journey to the Sun', () => {
    const steps = getResolvedSteps('to-the-sun')
    expect(steps.length).toBeGreaterThanOrEqual(3)
    expect(steps.some((s) => s.id === 'sun')).toBe(true)
  })
})
