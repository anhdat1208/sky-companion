import type { IssSnapshot } from '../../types/iss'

export const ISS_TLE_URL =
  'https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=tle'

export const TLE_CACHE_TTL_MS = 4 * 60 * 60 * 1000

/** Bundled offline TLE (mirrors `fixtures/iss-tle.txt`). */
const FALLBACK_TLE_TEXT = `ISS (ZARYA)
1 25544U 98067A   26214.50635181  .00006342  00000+0  12183-3 0  9996
2 25544  51.6315  70.8679 0007172   4.7554 355.3502 15.49313226578933
`

export interface ParsedTle {
  name: string
  line1: string
  line2: string
  epoch: string
}

type CacheState = {
  tle: ParsedTle
  fetchedAtMs: number
  source: Extract<IssSnapshot['source'], 'live-tle' | 'cached-tle'>
} | null

let cache: CacheState = null

export function parseIssTleBlock(text: string): ParsedTle {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  const nameIndex = lines.findIndex(l => /ISS\s*\(ZARYA\)/i.test(l) || /^ISS\b/i.test(l))
  if (nameIndex < 0 || nameIndex + 2 >= lines.length) {
    throw new Error('ISS TLE block not found.')
  }
  const name = lines[nameIndex]!
  const line1 = lines[nameIndex + 1]!
  const line2 = lines[nameIndex + 2]!
  if (!line1.startsWith('1 ') || !line2.startsWith('2 ')) {
    throw new Error('Invalid ISS TLE lines.')
  }
  return {
    name,
    line1,
    line2,
    epoch: line1.slice(18, 32).trim()
  }
}

export function readFallbackTle(): ParsedTle {
  return parseIssTleBlock(FALLBACK_TLE_TEXT)
}

export async function getIssTle(options?: {
  fetchImpl?: typeof fetch
  now?: Date
  resetCache?: boolean
}): Promise<{ tle: ParsedTle, source: IssSnapshot['source'] }> {
  if (options?.resetCache) {
    cache = null
  }

  const nowMs = (options?.now ?? new Date()).getTime()
  if (cache && nowMs - cache.fetchedAtMs < TLE_CACHE_TTL_MS) {
    return { tle: cache.tle, source: 'cached-tle' }
  }

  const fetchImpl = options?.fetchImpl ?? fetch

  try {
    const response = await fetchImpl(ISS_TLE_URL)
    if (!response.ok) {
      throw new Error(`TLE HTTP ${response.status}`)
    }
    const text = await response.text()
    const tle = parseIssTleBlock(text)
    cache = { tle, fetchedAtMs: nowMs, source: 'live-tle' }
    return { tle, source: 'live-tle' }
  } catch {
    if (cache) {
      return { tle: cache.tle, source: 'cached-tle' }
    }
    return { tle: readFallbackTle(), source: 'fallback-tle' }
  }
}
