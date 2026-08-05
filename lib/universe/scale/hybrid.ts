import type { CelestialBodyId } from '../../../types/universe'

/** 1 AU → scene units (hybrid educational scale). */
export const AU_SCENE_UNITS = 50

/**
 * Mild outer-system compression: distances beyond 1 AU grow slower
 * so Neptune stays reachable without an empty void.
 */
export function auToScene(au: number): number {
  const abs = Math.abs(au)
  if (abs <= 1) {
    return au * AU_SCENE_UNITS
  }
  // log-ish soft compression past 1 AU while staying monotonic
  const compressed = 1 + Math.log10(abs) * 2.2 + (abs - 1) * 0.35
  return Math.sign(au) * compressed * AU_SCENE_UNITS
}

const RADIUS_EXAGGERATION: Partial<Record<CelestialBodyId, number>> = {
  sun: 0.015,
  mercury: 12,
  venus: 10,
  earth: 10,
  moon: 10,
  mars: 11,
  jupiter: 2.2,
  saturn: 2.4,
  uranus: 3.5,
  neptune: 3.5
}

const MIN_DISPLAY_RADIUS = 0.35
const MAX_DISPLAY_RADIUS = 8

/**
 * Convert physical radius (km) to exaggerated display radius in scene units.
 */
export function radiusKmToScene(radiusKm: number, id: CelestialBodyId): number {
  const factor = RADIUS_EXAGGERATION[id] ?? 5
  // Earth radius ≈ 6371 km → baseline ~1 scene unit before exaggeration table
  const base = (radiusKm / 6371) * factor
  return Math.min(MAX_DISPLAY_RADIUS, Math.max(MIN_DISPLAY_RADIUS, base))
}

export function kmToScene(km: number): number {
  const AU_KM = 149_597_870.7
  return auToScene(km / AU_KM)
}
