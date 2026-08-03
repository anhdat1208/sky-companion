import type { IssGroundTrackPoint } from '../../types/iss'
import { propagateIss } from './propagate'
import type { ParsedTle } from './tle'

export { splitTrackAtAntimeridian } from './trackSplit'

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
