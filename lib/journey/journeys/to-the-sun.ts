import type { Journey } from '../../../types/journey'
import { makeStep } from './_helpers'

const P = 'journey.toTheSun.steps'

export const toTheSunJourney: Journey = {
  id: 'to-the-sun',
  status: 'available',
  titleKey: 'journey.toTheSun.title',
  descriptionKey: 'journey.toTheSun.description',
  coverEmoji: '☀',
  audio: {
    ambientKey: 'ambient.solar',
    spaceKey: 'space.warm'
  },
  steps: [
    makeStep('earth', 2, `${P}.earth`, {
      focus: { kind: 'body', id: 'earth' },
      camera: [
        {
          relativeTo: { kind: 'body', id: 'earth' },
          distance: 7,
          durationMs: 1800,
          easing: 'easeOut'
        }
      ]
    }),
    makeStep('earth-moon', 3, `${P}.earthMoon`),
    makeStep('solar-system', 4, `${P}.solarSystem`, {
      camera: [
        {
          position: { x: 0, y: 60, z: 140 },
          target: { x: 0, y: 0, z: 0 },
          durationMs: 2400,
          easing: 'easeInOut'
        }
      ]
    }),
    makeStep('sun', 4, `${P}.sun`, {
      holdMs: 4000,
      focus: { kind: 'body', id: 'sun' },
      camera: [
        {
          relativeTo: { kind: 'body', id: 'sun' },
          distance: 28,
          durationMs: 2800,
          easing: 'easeInOut'
        },
        {
          relativeTo: { kind: 'body', id: 'sun' },
          distance: 18,
          durationMs: 2000,
          easing: 'easeOut'
        }
      ]
    })
  ]
}
