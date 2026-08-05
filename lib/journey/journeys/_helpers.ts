import type { EducationalCard, JourneyStep, Narration } from '../../../types/journey'
import type { UniverseLevel } from '../../../types/universe'

export function stepContent(
  prefix: string
): { narration: Narration, card: EducationalCard } {
  return {
    narration: {
      titleKey: `${prefix}.narration.title`,
      bodyKey: `${prefix}.narration.body`,
      subtitleKey: `${prefix}.narration.subtitle`
    },
    card: {
      titleKey: `${prefix}.card.title`,
      descriptionKey: `${prefix}.card.description`,
      factsKeys: [
        `${prefix}.card.facts.0`,
        `${prefix}.card.facts.1`
      ],
      scaleKey: `${prefix}.card.scale`,
      distanceKey: `${prefix}.card.distance`,
      sizeComparisonKey: `${prefix}.card.sizeComparison`,
      learnMoreKey: `${prefix}.card.learnMore`
    }
  }
}

export function makeStep(
  id: string,
  level: UniverseLevel,
  prefix: string,
  opts: {
    holdMs?: number
    camera?: JourneyStep['camera']
    focus?: JourneyStep['focus']
  } = {}
): JourneyStep {
  const content = stepContent(prefix)
  return {
    id,
    level,
    holdMs: opts.holdMs ?? 2800,
    camera: opts.camera ?? [
      {
        relativeTo: { kind: 'level-default' },
        distance: levelDistance(level),
        durationMs: 2200,
        easing: 'easeInOut'
      }
    ],
    focus: opts.focus,
    narration: content.narration,
    card: content.card
  }
}

function levelDistance(level: UniverseLevel): number {
  const map: Record<UniverseLevel, number> = {
    1: 3.2,
    2: 6,
    3: 14,
    4: 200,
    5: 120,
    6: 160,
    7: 140,
    8: 150,
    9: 200
  }
  return map[level]
}
