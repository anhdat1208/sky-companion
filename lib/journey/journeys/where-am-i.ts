import type { Journey } from '../../../types/journey'
import { makeStep } from './_helpers'

const P = 'journey.whereAmI.steps'

export const whereAmIJourney: Journey = {
  id: 'where-am-i',
  status: 'available',
  titleKey: 'journey.whereAmI.title',
  descriptionKey: 'journey.whereAmI.description',
  coverEmoji: '🌍',
  audio: {
    ambientKey: 'ambient.cosmos',
    spaceKey: 'space.soft'
  },
  steps: [
    makeStep('you', 1, `${P}.you`, {
      camera: [
        {
          relativeTo: { kind: 'marker' },
          distance: 2.4,
          durationMs: 1800,
          easing: 'easeOut'
        }
      ],
      focus: { kind: 'marker' }
    }),
    makeStep('city', 1, `${P}.city`, {
      camera: [
        {
          relativeTo: { kind: 'marker' },
          distance: 3.8,
          durationMs: 2000,
          easing: 'easeInOut'
        }
      ]
    }),
    makeStep('country', 2, `${P}.country`, {
      camera: [
        {
          relativeTo: { kind: 'body', id: 'earth' },
          distance: 5.5,
          durationMs: 2200,
          easing: 'easeInOut'
        }
      ],
      focus: { kind: 'body', id: 'earth' }
    }),
    makeStep('earth', 2, `${P}.earth`, {
      camera: [
        {
          relativeTo: { kind: 'body', id: 'earth' },
          distance: 7,
          durationMs: 2200,
          easing: 'easeInOut'
        }
      ],
      focus: { kind: 'body', id: 'earth' }
    }),
    makeStep('earth-moon', 3, `${P}.earthMoon`),
    makeStep('solar-system', 4, `${P}.solarSystem`, {
      camera: [
        {
          position: { x: 0, y: 80, z: 180 },
          target: { x: 0, y: 0, z: 0 },
          durationMs: 2600,
          easing: 'easeInOut'
        }
      ]
    }),
    makeStep('orion-arm', 5, `${P}.orionArm`),
    makeStep('milky-way', 6, `${P}.milkyWay`),
    makeStep('local-group', 7, `${P}.localGroup`),
    makeStep('virgo', 8, `${P}.virgo`),
    makeStep('laniakea', 8, `${P}.laniakea`, {
      camera: [
        {
          position: { x: 20, y: 70, z: 170 },
          target: { x: 0, y: 0, z: 0 },
          durationMs: 2400,
          easing: 'easeInOut'
        }
      ]
    }),
    makeStep('observable-universe', 9, `${P}.observableUniverse`, {
      holdMs: 3600,
      camera: [
        {
          position: { x: 0, y: 90, z: 220 },
          target: { x: 0, y: 0, z: 0 },
          durationMs: 2800,
          easing: 'easeInOut'
        }
      ]
    })
  ]
}
