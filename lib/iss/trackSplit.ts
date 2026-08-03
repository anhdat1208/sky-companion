import type { IssGroundTrackPoint } from '../../types/iss'

/**
 * Split a ground track into segments at antimeridian longitude jumps (>180°).
 * Pure geometry — no orbit propagation / satellite.js.
 */
export function splitTrackAtAntimeridian(
  points: IssGroundTrackPoint[]
): IssGroundTrackPoint[][] {
  if (points.length === 0) return []
  const segments: IssGroundTrackPoint[][] = [[points[0]!]]

  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1]!
    const curr = points[i]!
    const jump = Math.abs(curr.longitude - prev.longitude)
    if (jump > 180) {
      segments.push([curr])
    } else {
      segments[segments.length - 1]!.push(curr)
    }
  }

  return segments
}
