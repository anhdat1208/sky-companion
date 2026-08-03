// lib/telescope/starHop.ts
import type { HopStep, ReferenceStar, TargetObject } from '../../types/telescope'

/**
 * Future star-hop pathfinder.
 * Contract: return ordered HopStep[] from bright reference stars to the target.
 * Current MVP returns [] intentionally.
 */
export function buildStarHopPlan(
  _target: TargetObject,
  _refs: ReferenceStar[] = []
): HopStep[] {
  return []
}
