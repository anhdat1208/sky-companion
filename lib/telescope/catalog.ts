// lib/telescope/catalog.ts
import type { TargetObject } from '../../types/telescope'

export const TELESCOPE_CATALOG: readonly TargetObject[] = [
  {
    id: 'moon',
    name: 'Moon',
    objectType: 'moon',
    raHours: null,
    decDeg: null,
    constellation: '—',
    apparentMagnitude: -12.6,
    distanceLy: null,
    difficulty: 'easy',
    recommendedInstrument: 'eye',
    dynamicBody: 'moon'
  },
  {
    id: 'mercury',
    name: 'Mercury',
    objectType: 'planet',
    raHours: null,
    decDeg: null,
    constellation: '—',
    apparentMagnitude: 0.0,
    distanceLy: null,
    difficulty: 'moderate',
    recommendedInstrument: 'binocular',
    dynamicBody: 'mercury'
  },
  {
    id: 'venus',
    name: 'Venus',
    objectType: 'planet',
    raHours: null,
    decDeg: null,
    constellation: '—',
    apparentMagnitude: -4.0,
    distanceLy: null,
    difficulty: 'easy',
    recommendedInstrument: 'eye',
    dynamicBody: 'venus'
  },
  {
    id: 'mars',
    name: 'Mars',
    objectType: 'planet',
    raHours: null,
    decDeg: null,
    constellation: '—',
    apparentMagnitude: 0.8,
    distanceLy: null,
    difficulty: 'easy',
    recommendedInstrument: 'eye',
    dynamicBody: 'mars'
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    objectType: 'planet',
    raHours: null,
    decDeg: null,
    constellation: '—',
    apparentMagnitude: -2.2,
    distanceLy: null,
    difficulty: 'easy',
    recommendedInstrument: 'eye',
    dynamicBody: 'jupiter'
  },
  {
    id: 'saturn',
    name: 'Saturn',
    objectType: 'planet',
    raHours: null,
    decDeg: null,
    constellation: '—',
    apparentMagnitude: 0.5,
    distanceLy: null,
    difficulty: 'easy',
    recommendedInstrument: 'binocular',
    dynamicBody: 'saturn'
  },
  {
    id: 'm31',
    name: 'Andromeda Galaxy',
    objectType: 'galaxy',
    raHours: 0.712,
    decDeg: 41.269,
    constellation: 'Andromeda',
    apparentMagnitude: 3.4,
    distanceLy: 2_500_000,
    difficulty: 'moderate',
    recommendedInstrument: 'binocular'
  },
  {
    id: 'm42',
    name: 'Orion Nebula',
    objectType: 'nebula',
    raHours: 5.588,
    decDeg: -5.391,
    constellation: 'Orion',
    apparentMagnitude: 4.0,
    distanceLy: 1344,
    difficulty: 'easy',
    recommendedInstrument: 'binocular'
  },
  {
    id: 'm45',
    name: 'Pleiades',
    objectType: 'starCluster',
    raHours: 3.791,
    decDeg: 24.105,
    constellation: 'Taurus',
    apparentMagnitude: 1.6,
    distanceLy: 444,
    difficulty: 'easy',
    recommendedInstrument: 'eye'
  }
]

export function getCatalogTargets(): TargetObject[] {
  return TELESCOPE_CATALOG.map(target => ({ ...target }))
}
