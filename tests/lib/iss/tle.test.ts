import { describe, expect, it, vi, beforeEach } from 'vitest'
import {
  getIssTle,
  readFallbackTle,
  ISS_TLE_URL,
  TLE_CACHE_TTL_MS
} from '../../../lib/iss/tle'

describe('parseIssTleBlock', () => {
  it('extracts ISS ZARYA lines', () => {
    const fixture = readFallbackTle()
    expect(fixture.name.toUpperCase()).toContain('ISS')
    expect(fixture.line1.startsWith('1 ')).toBe(true)
    expect(fixture.line2.startsWith('2 ')).toBe(true)
  })
})

describe('getIssTle', () => {
  beforeEach(async () => {
    await getIssTle({
      resetCache: true,
      fetchImpl: async () => {
        throw new Error('reset')
      }
    })
  })

  it('returns live-tle when fetch succeeds', async () => {
    const body = [
      readFallbackTle().name,
      readFallbackTle().line1,
      readFallbackTle().line2
    ].join('\n')

    const result = await getIssTle({
      resetCache: true,
      fetchImpl: async (url) => {
        expect(String(url)).toBe(ISS_TLE_URL)
        return new Response(body, { status: 200 })
      }
    })

    expect(result.source).toBe('live-tle')
    expect(result.tle.line1.startsWith('1 ')).toBe(true)
  })

  it('falls back when fetch fails', async () => {
    const result = await getIssTle({
      resetCache: true,
      fetchImpl: async () => {
        throw new Error('network')
      }
    })
    expect(result.source).toBe('fallback-tle')
    expect(result.tle.line1).toBe(readFallbackTle().line1)
  })

  it('uses cached-tle within TTL', async () => {
    const body = [
      readFallbackTle().name,
      readFallbackTle().line1,
      readFallbackTle().line2
    ].join('\n')
    const fetchImpl = vi.fn(async () => new Response(body, { status: 200 }))

    await getIssTle({
      resetCache: true,
      fetchImpl,
      now: new Date('2026-08-03T00:00:00Z')
    })
    const second = await getIssTle({
      fetchImpl,
      now: new Date('2026-08-03T01:00:00Z')
    })

    expect(second.source).toBe('cached-tle')
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    expect(TLE_CACHE_TTL_MS).toBe(4 * 60 * 60 * 1000)
  })
})
