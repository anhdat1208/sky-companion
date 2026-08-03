import type { IssGroundTrackPoint } from '../../types/iss'
import { propagateIss } from './propagate'
import type { ParsedTle } from './tle'

export const TRACK_LOOKBACK_MS = 15 * 60 * 1000
export const TRACK_LOOKAHEAD_MS = 120 * 60 * 1000
export const TRACK_STEP_MS = 60 * 1000

export function buildGroundTrack(tle: ParsedTle, now: Date): IssGroundTrackPoint[] {
  const start = now.getTime() - TRACK_LOOKBACK_MS
  const end = now.getTime() + TRACK_LOOKAHEAD_MS
  const points: IssGroundTrackPoint[] = []

  for (let t = start; t <= end; t += TRACK_STEP_MS) {
    const pos = propagateIss(tle, new Date(t))
    points.push({
      latitude: pos.latitude,
      longitude: pos.longitude,
      timestamp: pos.timestamp
    })
  }

  return points
}

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
