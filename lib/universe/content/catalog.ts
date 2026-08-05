import type { BodyEducationalContent, CelestialBodyId } from '../../../types/universe'

/** Solar-system bodies rendered in Levels 1–4. */
export const MVP_SOLAR_BODY_IDS = [
  'sun',
  'mercury',
  'venus',
  'earth',
  'moon',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune'
] as const satisfies readonly CelestialBodyId[]

const CATALOG: Record<(typeof MVP_SOLAR_BODY_IDS)[number], BodyEducationalContent> = {
  sun: {
    id: 'sun',
    i18nPrefix: 'universe.bodies.sun',
    radiusKm: 695700,
    massKg: 1.9885e30,
    gravityMs2: 274,
    distanceFromSunAu: 0,
    orbitalPeriodDays: null,
    rotationPeriodHours: 609.12,
    contentRef: 'universe:sun'
  },
  mercury: {
    id: 'mercury',
    i18nPrefix: 'universe.bodies.mercury',
    radiusKm: 2439.7,
    massKg: 3.3011e23,
    gravityMs2: 3.7,
    distanceFromSunAu: 0.387,
    orbitalPeriodDays: 87.97,
    rotationPeriodHours: 1407.6,
    contentRef: 'universe:mercury'
  },
  venus: {
    id: 'venus',
    i18nPrefix: 'universe.bodies.venus',
    radiusKm: 6051.8,
    massKg: 4.8675e24,
    gravityMs2: 8.87,
    distanceFromSunAu: 0.723,
    orbitalPeriodDays: 224.7,
    rotationPeriodHours: -5832.5,
    contentRef: 'universe:venus'
  },
  earth: {
    id: 'earth',
    i18nPrefix: 'universe.bodies.earth',
    radiusKm: 6371,
    massKg: 5.97237e24,
    gravityMs2: 9.807,
    distanceFromSunAu: 1,
    orbitalPeriodDays: 365.256,
    rotationPeriodHours: 23.934,
    contentRef: 'universe:earth'
  },
  moon: {
    id: 'moon',
    i18nPrefix: 'universe.bodies.moon',
    radiusKm: 1737.4,
    massKg: 7.342e22,
    gravityMs2: 1.62,
    distanceFromSunAu: null,
    orbitalPeriodDays: 27.322,
    rotationPeriodHours: 655.728,
    contentRef: 'universe:moon'
  },
  mars: {
    id: 'mars',
    i18nPrefix: 'universe.bodies.mars',
    radiusKm: 3389.5,
    massKg: 6.4171e23,
    gravityMs2: 3.71,
    distanceFromSunAu: 1.524,
    orbitalPeriodDays: 686.98,
    rotationPeriodHours: 24.623,
    contentRef: 'universe:mars'
  },
  jupiter: {
    id: 'jupiter',
    i18nPrefix: 'universe.bodies.jupiter',
    radiusKm: 69911,
    massKg: 1.8982e27,
    gravityMs2: 24.79,
    distanceFromSunAu: 5.204,
    orbitalPeriodDays: 4332.59,
    rotationPeriodHours: 9.925,
    contentRef: 'universe:jupiter'
  },
  saturn: {
    id: 'saturn',
    i18nPrefix: 'universe.bodies.saturn',
    radiusKm: 58232,
    massKg: 5.6834e26,
    gravityMs2: 10.44,
    distanceFromSunAu: 9.583,
    orbitalPeriodDays: 10759.22,
    rotationPeriodHours: 10.656,
    contentRef: 'universe:saturn'
  },
  uranus: {
    id: 'uranus',
    i18nPrefix: 'universe.bodies.uranus',
    radiusKm: 25362,
    massKg: 8.681e25,
    gravityMs2: 8.69,
    distanceFromSunAu: 19.191,
    orbitalPeriodDays: 30688.5,
    rotationPeriodHours: -17.24,
    contentRef: 'universe:uranus'
  },
  neptune: {
    id: 'neptune',
    i18nPrefix: 'universe.bodies.neptune',
    radiusKm: 24622,
    massKg: 1.02413e26,
    gravityMs2: 11.15,
    distanceFromSunAu: 30.07,
    orbitalPeriodDays: 60195,
    rotationPeriodHours: 16.11,
    contentRef: 'universe:neptune'
  }
}

export function getBodyContent(id: CelestialBodyId): BodyEducationalContent {
  const entry = CATALOG[id as keyof typeof CATALOG]
  if (!entry) {
    throw new Error(`No educational content for body: ${id}`)
  }
  return entry
}

export function listSolarBodyContent(): BodyEducationalContent[] {
  return MVP_SOLAR_BODY_IDS.map((id) => CATALOG[id])
}
