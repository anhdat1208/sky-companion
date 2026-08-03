import { describe, expect, it } from 'vitest'
import { readFallbackTle } from '../../../lib/iss/tle'
import {
  buildGroundTrack,
  TRACK_LOOKBACK_MS,
  TRACK_LOOKAHEAD_MS,
  TRACK_STEP_MS
} from '../../../lib/iss/groundTrack'
import { splitTrackAtAntimeridian } from '../../../lib/iss/trackSplit'

describe('buildGroundTrack', () => {
  it('returns ordered samples for the configured window', () => {
    const tle = readFallbackTle()
    // Fixture TLE epoch is year-day 26214... (2026 day 214 ≈ 2026-08-02)
    const now = new Date('2026-08-02T12:00:00Z')
    const track = buildGroundTrack(tle, now)
    const expectedCount =
      Math.floor((TRACK_LOOKBACK_MS + TRACK_LOOKAHEAD_MS) / TRACK_STEP_MS) + 1

    expect(track.length).toBe(expectedCount)
    for (let i = 1; i < track.length; i += 1) {
      expect(Date.parse(track[i]!.timestamp)).toBeGreaterThan(
        Date.parse(track[i - 1]!.timestamp)
      )
    }
  })
})

describe('splitTrackAtAntimeridian', () => {
  it('breaks when longitude jumps more than 180 degrees', () => {
    const segments = splitTrackAtAntimeridian([
      { latitude: 0, longitude: 179, timestamp: 'a' },
      { latitude: 0, longitude: -179, timestamp: 'b' },
      { latitude: 0, longitude: -178, timestamp: 'c' }
    ])
    expect(segments.length).toBe(2)
    expect(segments[0]).toHaveLength(1)
    expect(segments[1]).toHaveLength(2)
  })
})
