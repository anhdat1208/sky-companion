import type { Journey, JourneyId, JourneyStep } from '../../../types/journey'
import { resolveJourneySteps } from '../journey-engine'
import { comingSoonJourneys } from './stubs'
import { returnHomeJourney } from './return-home'
import { toTheSunJourney } from './to-the-sun'
import { whereAmIJourney } from './where-am-i'

const ALL: Journey[] = [
  whereAmIJourney,
  returnHomeJourney,
  toTheSunJourney,
  ...comingSoonJourneys
]

const BY_ID = new Map<JourneyId, Journey>(ALL.map((j) => [j.id, j]))

export function listJourneys(): Journey[] {
  return ALL.map((j) => ({ ...j }))
}

export function listAvailableJourneys(): Journey[] {
  return ALL.filter((j) => j.status === 'available').map((j) => ({ ...j }))
}

export function getJourney(id: JourneyId): Journey | undefined {
  const found = BY_ID.get(id)
  return found ? { ...found } : undefined
}

export function getResolvedSteps(id: JourneyId): JourneyStep[] {
  const journey = BY_ID.get(id)
  if (!journey) return []
  return resolveJourneySteps(journey, (lookupId) => BY_ID.get(lookupId as JourneyId))
}

export {
  whereAmIJourney,
  returnHomeJourney,
  toTheSunJourney,
  comingSoonJourneys
}
