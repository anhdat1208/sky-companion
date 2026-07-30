import { describe, expect, it } from 'vitest'
import { buildSkySnapshot } from './astronomy'
import { azimuthToDirection } from './direction'
import { getMilkyWayVisibility } from './milkyway'

describe('azimuthToDirection', () => {
  it.each([
    [0, 'North'],
    [45, 'North-East'],
    [135, 'South-East'],
    [270, 'West'],
    [360, 'North'],
    [-45, 'North-West']
  ] as const)('maps %s degrees to %s', (azimuth, direction) => {
    expect(azimuthToDirection(azimuth)).toBe(direction)
  })
})

describe('getMilkyWayVisibility', () => {
  it('returns Not Visible before astronomical darkness', () => {
    expect(getMilkyWayVisibility({
      sunAltitude: -8,
      moonAltitude: -20,
      moonIlluminatedPercentage: 0
    })).toBe('Not Visible')
  })

  it('returns Excellent on a dark night with the moon below the horizon', () => {
    expect(getMilkyWayVisibility({
      sunAltitude: -25,
      moonAltitude: -5,
      moonIlluminatedPercentage: 90
    })).toBe('Excellent')
  })

  it('degrades visibility according to moonlight', () => {
    expect(getMilkyWayVisibility({
      sunAltitude: -25,
      moonAltitude: 30,
      moonIlluminatedPercentage: 20
    })).toBe('Good')

    expect(getMilkyWayVisibility({
      sunAltitude: -25,
      moonAltitude: 30,
      moonIlluminatedPercentage: 50
    })).toBe('Poor')

    expect(getMilkyWayVisibility({
      sunAltitude: -25,
      moonAltitude: 30,
      moonIlluminatedPercentage: 90
    })).toBe('Not Visible')
  })
})

describe('buildSkySnapshot', () => {
  it('returns a complete normalized snapshot for fixed inputs', () => {
    const snapshot = buildSkySnapshot(
      10.7769,
      106.7009,
      new Date('2026-07-30T12:00:00.000Z')
    )

    expect(snapshot.timestamp).toBe('2026-07-30T12:00:00.000Z')
    expect(snapshot.directionToLook).toBe(azimuthToDirection(snapshot.moon.azimuth))
    expect(snapshot.planets.map(planet => planet.name)).toEqual([
      'Mercury',
      'Venus',
      'Mars',
      'Jupiter',
      'Saturn'
    ])
    expect(snapshot.moon.altitude).toBeGreaterThanOrEqual(-90)
    expect(snapshot.moon.altitude).toBeLessThanOrEqual(90)
    expect(snapshot.moon.azimuth).toBeGreaterThanOrEqual(0)
    expect(snapshot.moon.azimuth).toBeLessThan(360)
    expect(snapshot.moon.illuminatedPercentage).toBeGreaterThanOrEqual(0)
    expect(snapshot.moon.illuminatedPercentage).toBeLessThanOrEqual(100)
    expect(snapshot.moon.phase.length).toBeGreaterThan(0)
    expect(snapshot.sun.altitude).toBeGreaterThanOrEqual(-90)
    expect(snapshot.sun.altitude).toBeLessThanOrEqual(90)
    expect(snapshot.constellation.name.length).toBeGreaterThan(0)
    expect(['Excellent', 'Good', 'Poor', 'Not Visible']).toContain(
      snapshot.milkyWayVisibility
    )
  })
})
