import type { Journey, Narration } from '../../../types/journey'

const home = (stepId: string): Narration => ({
  titleKey: `journey.returnHome.steps.${stepId}.narration.title`,
  bodyKey: `journey.returnHome.steps.${stepId}.narration.body`,
  subtitleKey: `journey.returnHome.steps.${stepId}.narration.subtitle`
})

/**
 * Return Home is modeled as reverseOf Where Am I, with emotional
 * narration overrides on key homecoming stops.
 */
export const returnHomeJourney: Journey = {
  id: 'return-home',
  status: 'available',
  titleKey: 'journey.returnHome.title',
  descriptionKey: 'journey.returnHome.description',
  coverEmoji: '🏠',
  reverseOf: 'where-am-i',
  steps: [],
  reverseNarrationOverrides: {
    'observable-universe': home('observableUniverse'),
    laniakea: home('laniakea'),
    'milky-way': home('milkyWay'),
    'solar-system': home('solarSystem'),
    earth: home('earth'),
    city: home('city'),
    you: home('you')
  },
  audio: {
    ambientKey: 'ambient.homecoming',
    spaceKey: 'space.soft'
  }
}
