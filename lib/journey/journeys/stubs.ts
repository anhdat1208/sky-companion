import type { Journey, JourneyId } from '../../../types/journey'

const stub = (
  id: JourneyId,
  titleKey: string,
  descriptionKey: string,
  coverEmoji: string
): Journey => ({
  id,
  status: 'coming-soon',
  titleKey,
  descriptionKey,
  coverEmoji,
  steps: []
})

export const comingSoonJourneys: Journey[] = [
  stub('solar-system', 'journey.stubs.solarSystem.title', 'journey.stubs.solarSystem.description', '🪐'),
  stub('milky-way', 'journey.stubs.milkyWay.title', 'journey.stubs.milkyWay.description', '🌌'),
  stub('edge-of-universe', 'journey.stubs.edgeOfUniverse.title', 'journey.stubs.edgeOfUniverse.description', '🌠'),
  stub('voyager', 'journey.stubs.voyager.title', 'journey.stubs.voyager.description', '🚀'),
  stub('iss', 'journey.stubs.iss.title', 'journey.stubs.iss.description', '🛰'),
  stub('galaxy-tour', 'journey.stubs.galaxyTour.title', 'journey.stubs.galaxyTour.description', '🌌')
]
