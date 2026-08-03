import type { H3Event } from 'h3'
import { isError } from 'h3'
import { describe, expect, it } from 'vitest'
import issHandler from '../../server/api/iss.get'
import moonHandler from '../../server/api/moon.get'
import planetsHandler from '../../server/api/planets.get'
import skyHandler from '../../server/api/sky.get'

function createQueryEvent(query: Record<string, string>): H3Event {
  const params = new URLSearchParams(query)
  return {
    path: `/api/sky?${params.toString()}`
  } as H3Event
}

describe('GET /api/sky', () => {
  it('returns a SkySnapshot for valid coordinates', () => {
    const result = skyHandler(createQueryEvent({
      lat: '10.7769',
      lng: '106.7009',
      time: '2026-07-30T12:00:00.000Z'
    }))

    expect(result.timestamp).toBe('2026-07-30T12:00:00.000Z')
    expect(result.moon).toBeDefined()
    expect(result.sun).toBeDefined()
    expect(Array.isArray(result.planets)).toBe(true)
    expect(result.constellation).toBeDefined()
    expect(result.milkyWayVisibility).toBeDefined()
    expect(result.directionToLook).toBeDefined()
  })

  it('returns 400 for invalid coordinates', () => {
    try {
      skyHandler(createQueryEvent({ lat: '100', lng: '106.7009' }))
      expect.unreachable('expected invalid coordinates to throw')
    } catch (error) {
      expect(isError(error)).toBe(true)
      if (isError(error)) {
        expect(error.statusCode).toBe(400)
        expect(error.message).toBe('Invalid coordinates or time parameter.')
      }
    }
  })
})

describe('GET /api/moon', () => {
  it('returns MoonInfo for valid coordinates', () => {
    const result = moonHandler(createQueryEvent({
      lat: '10.7769',
      lng: '106.7009',
      time: '2026-07-30T12:00:00.000Z'
    }))

    expect(typeof result.altitude).toBe('number')
    expect(typeof result.azimuth).toBe('number')
    expect(typeof result.illuminatedPercentage).toBe('number')
    expect(typeof result.phase).toBe('string')
  })

  it('returns 400 for invalid longitude', () => {
    try {
      moonHandler(createQueryEvent({ lat: '10', lng: '200' }))
      expect.unreachable('expected invalid coordinates to throw')
    } catch (error) {
      expect(isError(error)).toBe(true)
      if (isError(error)) {
        expect(error.statusCode).toBe(400)
        expect(error.message).toBe('Invalid coordinates or time parameter.')
      }
    }
  })
})

describe('GET /api/planets', () => {
  it('returns PlanetInfo[] for valid coordinates', () => {
    const result = planetsHandler(createQueryEvent({
      lat: '10.7769',
      lng: '106.7009',
      time: '2026-07-30T12:00:00.000Z'
    }))

    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
    expect(result[0]).toMatchObject({
      name: expect.any(String),
      altitude: expect.any(Number),
      azimuth: expect.any(Number),
      isVisible: expect.any(Boolean)
    })
  })
})

describe('GET /api/iss', () => {
  it('returns IssSnapshot without coordinates', async () => {
    const result = await issHandler(createQueryEvent({}))

    expect(result.position).toMatchObject({
      latitude: expect.any(Number),
      longitude: expect.any(Number),
      altitudeKm: expect.any(Number),
      velocityKph: expect.any(Number)
    })
    expect(typeof result.position.timestamp).toBe('string')
    expect(Number.isNaN(Date.parse(result.position.timestamp))).toBe(false)
    expect(Array.isArray(result.groundTrack)).toBe(true)
    expect(result.groundTrack.length).toBeGreaterThan(0)
    expect(result.nextPass).toBeNull()
    expect(result.brightness).toBeNull()
    expect(typeof result.tleEpoch).toBe('string')
    expect(['live-tle', 'cached-tle', 'fallback-tle']).toContain(result.source)
  })

  it('returns nextPass and brightness when coordinates are provided', async () => {
    const result = await issHandler(createQueryEvent({
      lat: '10.7769',
      lng: '106.7009'
    }))

    expect(result.position.altitudeKm).toEqual(expect.any(Number))
    expect(result.brightness).toMatchObject({
      magnitude: expect.any(Number),
      label: expect.any(String)
    })
    expect(
      result.nextPass === null
      || (
        typeof result.nextPass.riseTime === 'string'
        && typeof result.nextPass.durationSeconds === 'number'
      )
    ).toBe(true)
  })

  it('returns 400 when only lat is provided', async () => {
    try {
      await issHandler(createQueryEvent({ lat: '10.7769' }))
      expect.unreachable('expected incomplete coordinates to throw')
    } catch (error) {
      expect(isError(error)).toBe(true)
      if (isError(error)) {
        expect(error.statusCode).toBe(400)
        expect(error.message).toBe('Invalid coordinates.')
      }
    }
  })
})
