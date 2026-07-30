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
  it('returns a mocked ISSPass payload', () => {
    const result = issHandler({} as H3Event)

    expect(result).toMatchObject({
      latitude: 10.7769,
      longitude: 106.7009,
      altitudeKm: 408.2,
      velocityKph: 27600
    })
    expect(typeof result.timestamp).toBe('string')
    expect(Number.isNaN(Date.parse(result.timestamp))).toBe(false)
  })
})
