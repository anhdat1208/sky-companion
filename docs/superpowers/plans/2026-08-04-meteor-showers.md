# Meteor Showers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `/meteor-showers` with upcoming shower cards, event detail, observation guide, yearly calendar, location-aware visibility score, and notification architecture stubs — all client-side from an IMO solar-longitude catalog.

**Architecture:** Pure domain in `lib/meteor/*` (catalog + peak search + moon interference + visibility + guide + notification hooks) → `useMeteor` orchestration → `components/meteor/*` → `pages/meteor-showers.vue`. No new Nitro meteor API. Follows `docs/superpowers/specs/2026-08-04-meteor-showers-design.md`.

**Tech Stack:** Nuxt 4, Vue 3 Composition API, TypeScript strict, TailwindCSS, Vitest, astronomy-engine (`SunPosition`, `Search`, `Horizon`), existing geolocation / `SkyCard` / `SectionTitle` / `lib/moon/phase` / `lib/direction`.

## Global Constraints

- Vietnamese UI chrome; English shower names (`Perseids`, `Geminids`, …).
- Client-side calculations only; no paid APIs; no AI; no new `/api/meteor`.
- Business logic stays in `lib/meteor/*` — Vue components are presentation-only (formatting OK).
- Catalog: exactly 8 showers; peaks from solar longitude; yearly metadata edits only in `catalog.ts`.
- Hybrid location: list/calendar without GPS; score/direction null until coords exist.
- Visibility score: radiant altitude + moon interference + ZHR; `cloudCoverPct` always `null` in v1.
- Notifications: builder + stub UI only — no Notification API / service worker.
- Visibility map: stub only (“Sắp có”).
- Best observation time: fixed heuristic from spec (after midnight → before dawn); optional low-radiant note when coords exist.
- Composition API; match slate/sky visual language (`SkyCard`, `SectionTitle`).
- Spec: `docs/superpowers/specs/2026-08-04-meteor-showers-design.md`.

## File Map

| File | Responsibility |
|------|----------------|
| `types/meteor.ts` | All meteor domain types + future hooks |
| `lib/meteor/catalog.ts` | 8 IMO-backed shower definitions |
| `lib/meteor/peak.ts` | Solar λ → peak/active windows; upcoming list |
| `lib/meteor/moon.ts` | Illumination % + interference at peak |
| `lib/meteor/visibility.ts` | Radiant alt/az, direction, score, best-time label |
| `lib/meteor/guide.ts` | Observation guide rules |
| `lib/meteor/notifications.ts` | Build T−24h / T−2h / peak-started hooks |
| `lib/meteor/cards.ts` | Assemble upcoming cards + event detail |
| `lib/meteor/index.ts` | Public re-exports |
| `app/composables/useMeteor.ts` | Page orchestration |
| `app/components/meteor/*.vue` | Section UI |
| `app/pages/meteor-showers.vue` | Page composition |
| `app/pages/index.vue` | Entry link |
| `tests/lib/meteor/*.test.ts` | Domain tests |
| `tests/composables/useMeteor.test.ts` | Composable tests |

---

### Task 1: Domain types

**Files:**
- Create: `types/meteor.ts`
- Test: none (types only; verified by later compile/tests)

**Interfaces:**
- Consumes: none
- Produces: all exported types below (exact names used by later tasks)

- [ ] **Step 1: Create `types/meteor.ts`**

```ts
export type MeteorShowerId =
  | 'quadrantids'
  | 'lyrids'
  | 'eta-aquariids'
  | 'perseids'
  | 'orionids'
  | 'leonids'
  | 'geminids'
  | 'ursids'

export type MeteorDifficulty = 'easy' | 'moderate' | 'challenging'

export interface MeteorShowerDefinition {
  id: MeteorShowerId
  name: string
  iauCode: string
  description: string
  originConstellation: string
  peakSolarLongitudeDeg: number
  activeSolarLongitudeDeg: { start: number; end: number }
  zhr: number
  radiantRaHours: number
  radiantDecDeg: number
  speedKmS: number
  parentComet: string | null
  peakDurationHours: number
  difficulty: MeteorDifficulty
  sourceNote: string
}

export interface MeteorShowerEvent {
  id: MeteorShowerId
  year: number
  name: string
  peakAt: string
  activeStart: string
  activeEnd: string
  zhr: number
  difficulty: MeteorDifficulty
}

export type MoonInterference =
  | 'none'
  | 'low'
  | 'moderate'
  | 'high'
  | 'severe'

export type VisibilityScoreLabel =
  | 'Poor'
  | 'Fair'
  | 'Good'
  | 'Excellent'

export interface MeteorVisibilityScore {
  stars: 1 | 2 | 3 | 4 | 5
  label: VisibilityScoreLabel
  reasons: string[]
  cloudCoverPct: number | null
}

export interface MeteorUpcomingCard {
  id: MeteorShowerId
  name: string
  activePeriodLabel: string
  peakDateLabel: string
  peakTimeLabel: string
  peakAt: string
  expectedMeteorsPerHour: number
  moonIlluminationPct: number
  moonInterference: MoonInterference
  visibilityScore: MeteorVisibilityScore | null
  bestObservationTimeLabel: string
  bestDirection: string | null
  difficulty: MeteorDifficulty
}

export interface MeteorVisibilityMapHook {
  status: 'unavailable'
  message: string
}

export interface MeteorEventDetail {
  id: MeteorShowerId
  name: string
  description: string
  originConstellation: string
  radiantRaHours: number
  radiantDecDeg: number
  expectedSpeedKmS: number
  parentComet: string | null
  peakDurationHours: number
  peakAt: string
  activeStart: string
  activeEnd: string
  zhr: number
  visibilityMap: MeteorVisibilityMapHook
}

export type MeteorEquipmentKind = 'naked-eye' | 'binoculars' | 'telescope'

export interface MeteorEquipmentAdvice {
  kind: MeteorEquipmentKind
  recommended: boolean
  note: string
}

export interface MeteorObservationGuide {
  recommendedTime: string
  darkSkyRequirement: string
  moonlightImpact: string
  cloudReminder: string
  equipment: MeteorEquipmentAdvice[]
}

export type MeteorNotificationKind =
  | 't-minus-24h'
  | 't-minus-2h'
  | 'peak-started'

export interface MeteorNotificationHook {
  eventId: string
  showerId: MeteorShowerId
  kind: MeteorNotificationKind
  fireAt: string
  title: string
  body: string
}

export interface MeteorOfflineCacheHook {
  catalogVersion: string
  cachedAt: string | null
}

export interface MeteorWeatherHook {
  cloudCoverPct: number | null
  source: 'none' | 'forecast'
}

export interface CloudCoverHook {
  pct: number | null
  observedAt: string | null
}

export interface MeteorObservationReportHook {
  showerId: MeteorShowerId
  observedAt: string
  estimatedCount: number | null
  notes: string
}

export interface MeteorCommunityPhotoHook {
  showerId: MeteorShowerId
  imageUrl: string
  caption: string
  takenAt: string
}

export interface MeteorPushNotificationHook {
  permission: 'unsupported' | 'default' | 'granted' | 'denied'
  hooks: MeteorNotificationHook[]
}
```

- [ ] **Step 2: Commit**

```bash
git add types/meteor.ts
git commit -m "feat(meteor): add domain types and future hooks"
```

---

### Task 2: Catalog (8 IMO showers)

**Files:**
- Create: `lib/meteor/catalog.ts`
- Test: `tests/lib/meteor/catalog.test.ts`

**Interfaces:**
- Consumes: `MeteorShowerDefinition`, `MeteorShowerId` from `types/meteor.ts`
- Produces: `METEOR_SHOWER_CATALOG`, `getShowerDefinition(id: MeteorShowerId): MeteorShowerDefinition`

- [ ] **Step 1: Write the failing test**

```ts
// tests/lib/meteor/catalog.test.ts
import { describe, expect, it } from 'vitest'
import { METEOR_SHOWER_CATALOG, getShowerDefinition } from '../../../lib/meteor/catalog'

const EXPECTED_IDS = [
  'quadrantids',
  'lyrids',
  'eta-aquariids',
  'perseids',
  'orionids',
  'leonids',
  'geminids',
  'ursids'
] as const

describe('meteor catalog', () => {
  it('contains exactly the eight major showers with unique ids', () => {
    expect(METEOR_SHOWER_CATALOG).toHaveLength(8)
    const ids = METEOR_SHOWER_CATALOG.map((s) => s.id)
    expect(ids).toEqual([...EXPECTED_IDS])
    expect(new Set(ids).size).toBe(8)
  })

  it('has required IMO fields populated for every shower', () => {
    for (const shower of METEOR_SHOWER_CATALOG) {
      expect(shower.name.length).toBeGreaterThan(0)
      expect(shower.iauCode.length).toBeGreaterThan(0)
      expect(shower.zhr).toBeGreaterThan(0)
      expect(Number.isFinite(shower.peakSolarLongitudeDeg)).toBe(true)
      expect(Number.isFinite(shower.activeSolarLongitudeDeg.start)).toBe(true)
      expect(Number.isFinite(shower.activeSolarLongitudeDeg.end)).toBe(true)
      expect(Number.isFinite(shower.radiantRaHours)).toBe(true)
      expect(Number.isFinite(shower.radiantDecDeg)).toBe(true)
      expect(shower.speedKmS).toBeGreaterThan(0)
      expect(shower.peakDurationHours).toBeGreaterThan(0)
      expect(shower.sourceNote.toLowerCase()).toContain('imo')
    }
  })

  it('looks up definitions by id', () => {
    expect(getShowerDefinition('perseids').name).toBe('Perseids')
    expect(() => getShowerDefinition('nope' as never)).toThrow()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/lib/meteor/catalog.test.ts`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement catalog**

Use IMO Working List baselines (document in `sourceNote`). Exact object for each shower:

```ts
// lib/meteor/catalog.ts
import type { MeteorShowerDefinition, MeteorShowerId } from '../../types/meteor'

export const METEOR_SHOWER_CATALOG: readonly MeteorShowerDefinition[] = [
  {
    id: 'quadrantids',
    name: 'Quadrantids',
    iauCode: 'QUA',
    description:
      'Mưa sao băng đầu năm với ZHR cao nhưng đỉnh ngắn. Radiant gần chòm Bootes (tên lịch sử Quadrans Muralis).',
    originConstellation: 'Bootes',
    peakSolarLongitudeDeg: 283.15,
    activeSolarLongitudeDeg: { start: 278.0, end: 292.0 },
    zhr: 120,
    radiantRaHours: 15.333,
    radiantDecDeg: 49.0,
    speedKmS: 41,
    parentComet: '2003 EH1',
    peakDurationHours: 6,
    difficulty: 'moderate',
    sourceNote: 'IMO Working List — peak λ☉ 283.15°, ZHR 120'
  },
  {
    id: 'lyrids',
    name: 'Lyrids',
    iauCode: 'LYR',
    description:
      'Mưa sao băng mùa xuân từ sao chổi Thatcher; tốc độ trung bình, ZHR khiêm tốn nhưng ổn định.',
    originConstellation: 'Lyra',
    peakSolarLongitudeDeg: 32.32,
    activeSolarLongitudeDeg: { start: 24.0, end: 39.0 },
    zhr: 18,
    radiantRaHours: 18.067,
    radiantDecDeg: 34.0,
    speedKmS: 49,
    parentComet: 'C/1861 G1 (Thatcher)',
    peakDurationHours: 12,
    difficulty: 'easy',
    sourceNote: 'IMO Working List — peak λ☉ 32.32°, ZHR 18'
  },
  {
    id: 'eta-aquariids',
    name: 'Eta Aquariids',
    iauCode: 'ETA',
    description:
      'Mảnh vụn sao chổi Halley; tốt hơn ở bán cầu Nam. Radiant gần Sao Thủy bình minh.',
    originConstellation: 'Aquarius',
    peakSolarLongitudeDeg: 45.5,
    activeSolarLongitudeDeg: { start: 30.0, end: 60.0 },
    zhr: 50,
    radiantRaHours: 22.533,
    radiantDecDeg: -1.0,
    speedKmS: 66,
    parentComet: '1P/Halley',
    peakDurationHours: 12,
    difficulty: 'moderate',
    sourceNote: 'IMO Working List — peak λ☉ 45.5°, ZHR 50'
  },
  {
    id: 'perseids',
    name: 'Perseids',
    iauCode: 'PER',
    description:
      'Mưa sao băng mùa hè nổi tiếng; nhiều lửa sáng, radiant trong Perseus, ZHR cao quanh giữa tháng 8.',
    originConstellation: 'Perseus',
    peakSolarLongitudeDeg: 140.0,
    activeSolarLongitudeDeg: { start: 120.0, end: 155.0 },
    zhr: 100,
    radiantRaHours: 3.2,
    radiantDecDeg: 58.0,
    speedKmS: 59,
    parentComet: '109P/Swift-Tuttle',
    peakDurationHours: 24,
    difficulty: 'easy',
    sourceNote: 'IMO Working List — peak λ☉ 140.0°, ZHR 100'
  },
  {
    id: 'orionids',
    name: 'Orionids',
    iauCode: 'ORI',
    description:
      'Nhánh Halley thứ hai trong năm; meteors nhanh, radiant gần Orion trước bình minh.',
    originConstellation: 'Orion',
    peakSolarLongitudeDeg: 208.0,
    activeSolarLongitudeDeg: { start: 192.0, end: 223.0 },
    zhr: 20,
    radiantRaHours: 6.333,
    radiantDecDeg: 16.0,
    speedKmS: 66,
    parentComet: '1P/Halley',
    peakDurationHours: 12,
    difficulty: 'easy',
    sourceNote: 'IMO Working List — peak λ☉ 208°, ZHR 20'
  },
  {
    id: 'leonids',
    name: 'Leonids',
    iauCode: 'LEO',
    description:
      'Mưa nhanh từ Tempel-Tuttle; ZHR nền thấp, đôi khi có storm lịch sử. Radiant trong Leo.',
    originConstellation: 'Leo',
    peakSolarLongitudeDeg: 235.27,
    activeSolarLongitudeDeg: { start: 224.0, end: 245.0 },
    zhr: 15,
    radiantRaHours: 10.133,
    radiantDecDeg: 22.0,
    speedKmS: 71,
    parentComet: '55P/Tempel-Tuttle',
    peakDurationHours: 12,
    difficulty: 'challenging',
    sourceNote: 'IMO Working List — peak λ☉ 235.27°, ZHR 15'
  },
  {
    id: 'geminids',
    name: 'Geminids',
    iauCode: 'GEM',
    description:
      'Một trong những mưa mạnh và đáng tin cậy nhất; liên quan tiểu hành tinh Phaethon, nhiều meteors sáng.',
    originConstellation: 'Gemini',
    peakSolarLongitudeDeg: 262.2,
    activeSolarLongitudeDeg: { start: 254.0, end: 271.0 },
    zhr: 150,
    radiantRaHours: 7.467,
    radiantDecDeg: 33.0,
    speedKmS: 35,
    parentComet: '3200 Phaethon',
    peakDurationHours: 24,
    difficulty: 'easy',
    sourceNote: 'IMO Working List — peak λ☉ 262.2°, ZHR 150'
  },
  {
    id: 'ursids',
    name: 'Ursids',
    iauCode: 'URS',
    description:
      'Mưa cuối năm gần Thiên Long (Ursa Minor); ZHR thấp, quan sát quanh solstice mùa đông.',
    originConstellation: 'Ursa Minor',
    peakSolarLongitudeDeg: 270.7,
    activeSolarLongitudeDeg: { start: 262.0, end: 275.0 },
    zhr: 10,
    radiantRaHours: 14.467,
    radiantDecDeg: 76.0,
    speedKmS: 33,
    parentComet: '8P/Tuttle',
    peakDurationHours: 12,
    difficulty: 'challenging',
    sourceNote: 'IMO Working List — peak λ☉ 270.7°, ZHR 10'
  }
]
```

```ts
export function getShowerDefinition(id: MeteorShowerId): MeteorShowerDefinition {
  const found = METEOR_SHOWER_CATALOG.find((s) => s.id === id)
  if (!found) {
    throw new Error(`Unknown meteor shower id: ${id}`)
  }
  return found
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/lib/meteor/catalog.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/meteor/catalog.ts tests/lib/meteor/catalog.test.ts
git commit -m "feat(meteor): add IMO-backed eight-shower catalog"
```

---

### Task 3: Peak timing from solar longitude

**Files:**
- Create: `lib/meteor/peak.ts`
- Test: `tests/lib/meteor/peak.test.ts`

**Interfaces:**
- Consumes: `METEOR_SHOWER_CATALOG`, `getShowerDefinition`; `MeteorShowerDefinition`, `MeteorShowerEvent`
- Produces:
  - `solarLongitudeDeg(when: Date): number`
  - `findSolarLongitudeTime(year: number, targetLonDeg: number): Date`
  - `buildShowerEvent(def: MeteorShowerDefinition, year: number): MeteorShowerEvent`
  - `listShowerEventsForYear(year: number): MeteorShowerEvent[]`
  - `listUpcomingShowerEvents(now: Date, limit?: number): MeteorShowerEvent[]`

- [ ] **Step 1: Write the failing test**

```ts
// tests/lib/meteor/peak.test.ts
import { describe, expect, it } from 'vitest'
import {
  buildShowerEvent,
  findSolarLongitudeTime,
  listShowerEventsForYear,
  listUpcomingShowerEvents,
  solarLongitudeDeg
} from '../../../lib/meteor/peak'
import { getShowerDefinition } from '../../../lib/meteor/catalog'

describe('meteor peak timing', () => {
  it('reads solar longitude via SunPosition', () => {
    const lon = solarLongitudeDeg(new Date(Date.UTC(2026, 0, 1, 12, 0, 0)))
    expect(lon).toBeGreaterThan(270)
    expect(lon).toBeLessThan(290)
  })

  it('places 2026 Perseids peak near mid-August (±1.5 days)', () => {
    const peak = findSolarLongitudeTime(2026, 140.0)
    expect(peak.getUTCFullYear()).toBe(2026)
    expect(peak.getUTCMonth()).toBe(7) // August
    expect(peak.getUTCDate()).toBeGreaterThanOrEqual(11)
    expect(peak.getUTCDate()).toBeLessThanOrEqual(14)
  })

  it('places Quadrantids peak in early January for the given year', () => {
    const peak = findSolarLongitudeTime(2026, 283.15)
    expect(peak.getUTCFullYear()).toBe(2026)
    expect(peak.getUTCMonth()).toBe(0)
    expect(peak.getUTCDate()).toBeLessThanOrEqual(5)
  })

  it('builds a shower event with active window around peak', () => {
    const event = buildShowerEvent(getShowerDefinition('perseids'), 2026)
    expect(event.id).toBe('perseids')
    expect(event.year).toBe(2026)
    expect(new Date(event.activeStart).getTime()).toBeLessThan(new Date(event.peakAt).getTime())
    expect(new Date(event.activeEnd).getTime()).toBeGreaterThan(new Date(event.peakAt).getTime())
  })

  it('lists eight events sorted by peak for a year', () => {
    const events = listShowerEventsForYear(2026)
    expect(events).toHaveLength(8)
    for (let i = 1; i < events.length; i++) {
      expect(new Date(events[i]!.peakAt).getTime()).toBeGreaterThanOrEqual(
        new Date(events[i - 1]!.peakAt).getTime()
      )
    }
  })

  it('upcoming list crosses year end', () => {
    const late = new Date(Date.UTC(2026, 11, 28, 12, 0, 0))
    const upcoming = listUpcomingShowerEvents(late, 3)
    expect(upcoming.length).toBeGreaterThan(0)
    expect(upcoming.every((e) => new Date(e.peakAt).getTime() >= late.getTime())).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/lib/meteor/peak.test.ts`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement peak helpers**

```ts
// lib/meteor/peak.ts
import { Search, SunPosition } from 'astronomy-engine'
import type { MeteorShowerDefinition, MeteorShowerEvent } from '../../types/meteor'
import { METEOR_SHOWER_CATALOG } from './catalog'

export function solarLongitudeDeg(when: Date): number {
  return SunPosition(when).elon
}

function lonDelta(current: number, target: number): number {
  let d = current - target
  while (d > 180) d -= 360
  while (d < -180) d += 360
  return d
}

/**
 * Find UTC instant in `year` when apparent solar longitude ≈ targetLonDeg.
 * For targets that fall in early January (e.g. Quadrantids ~283°), search
 * from Dec 20 of previous year through end of `year` and pick the crossing
 * whose calendar year of the peak date matches `year` when possible; otherwise
 * the first crossing after Jan 1 `year`.
 */
export function findSolarLongitudeTime(year: number, targetLonDeg: number): Date {
  const start = new Date(Date.UTC(year - 1, 11, 15, 0, 0, 0))
  const end = new Date(Date.UTC(year, 11, 31, 23, 59, 59))

  const time = Search(
    (t) => lonDelta(SunPosition(t).elon, targetLonDeg),
    start,
    end,
    { dt_tolerance_seconds: 60 }
  )

  if (!time) {
    throw new Error(`Could not find solar longitude ${targetLonDeg}° in year ${year}`)
  }

  const date = time.date
  // If search returned previous-year December for a January shower meant for `year`,
  // re-search strictly inside `year`.
  if (date.getUTCFullYear() < year) {
    const yearStart = new Date(Date.UTC(year, 0, 1, 0, 0, 0))
    const retry = Search(
      (t) => lonDelta(SunPosition(t).elon, targetLonDeg),
      yearStart,
      end,
      { dt_tolerance_seconds: 60 }
    )
    if (retry) return retry.date
  }

  return date
}

export function buildShowerEvent(
  def: MeteorShowerDefinition,
  year: number
): MeteorShowerEvent {
  const peak = findSolarLongitudeTime(year, def.peakSolarLongitudeDeg)
  let activeStart = findSolarLongitudeTime(year, def.activeSolarLongitudeDeg.start)
  let activeEnd = findSolarLongitudeTime(year, def.activeSolarLongitudeDeg.end)

  // Handle wrap: if start λ > end λ (e.g. spans new year), start may be previous year.
  if (def.activeSolarLongitudeDeg.start > def.activeSolarLongitudeDeg.end) {
    activeStart = findSolarLongitudeTime(year, def.activeSolarLongitudeDeg.start)
    // If start landed after peak, use previous year's start crossing.
    if (activeStart.getTime() > peak.getTime()) {
      activeStart = findSolarLongitudeTime(year - 1, def.activeSolarLongitudeDeg.start)
    }
    if (activeEnd.getTime() < peak.getTime()) {
      activeEnd = findSolarLongitudeTime(year + 1, def.activeSolarLongitudeDeg.end)
    }
  }

  // Clamp ordering safety for non-wrapping ranges
  if (activeStart.getTime() > peak.getTime()) {
    activeStart = new Date(peak.getTime() - 5 * 24 * 3600 * 1000)
  }
  if (activeEnd.getTime() < peak.getTime()) {
    activeEnd = new Date(peak.getTime() + 5 * 24 * 3600 * 1000)
  }

  return {
    id: def.id,
    year,
    name: def.name,
    peakAt: peak.toISOString(),
    activeStart: activeStart.toISOString(),
    activeEnd: activeEnd.toISOString(),
    zhr: def.zhr,
    difficulty: def.difficulty
  }
}

export function listShowerEventsForYear(year: number): MeteorShowerEvent[] {
  return METEOR_SHOWER_CATALOG
    .map((def) => buildShowerEvent(def, year))
    .sort((a, b) => new Date(a.peakAt).getTime() - new Date(b.peakAt).getTime())
}

export function listUpcomingShowerEvents(
  now: Date,
  limit = 8
): MeteorShowerEvent[] {
  const year = now.getUTCFullYear()
  const pool = [
    ...listShowerEventsForYear(year),
    ...listShowerEventsForYear(year + 1)
  ]
  return pool
    .filter((e) => new Date(e.peakAt).getTime() >= now.getTime())
    .sort((a, b) => new Date(a.peakAt).getTime() - new Date(b.peakAt).getTime())
    .slice(0, limit)
}
```

If `Search` signature in astronomy-engine 2.x differs (check `astronomy.d.ts`), adapt to the exported `Search(func, t1, t2, options?)` returning `AstroTime | null`. Use `.date` or construct `new Date(time.ut * …)` per library — verify against existing project usage / d.ts during implementation.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/lib/meteor/peak.test.ts`
Expected: PASS (adjust ±1.5 day windows only if Astronomy Engine places peak off by timezone edge — keep UTC assertions)

- [ ] **Step 5: Commit**

```bash
git add lib/meteor/peak.ts tests/lib/meteor/peak.test.ts
git commit -m "feat(meteor): compute yearly peaks from solar longitude"
```

---

### Task 4: Moon interference at peak

**Files:**
- Create: `lib/meteor/moon.ts`
- Test: `tests/lib/meteor/moon.test.ts`

**Interfaces:**
- Consumes: `illuminatedPercentage` from `lib/moon/phase`; `MoonInterference`
- Produces:
  - `moonInterferenceFromIllumination(pct: number): MoonInterference`
  - `moonConditionsAt(when: Date): { illuminationPct: number; interference: MoonInterference }`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import {
  moonConditionsAt,
  moonInterferenceFromIllumination
} from '../../../lib/meteor/moon'

describe('meteor moon interference', () => {
  it('maps illumination buckets', () => {
    expect(moonInterferenceFromIllumination(0)).toBe('none')
    expect(moonInterferenceFromIllumination(9.9)).toBe('none')
    expect(moonInterferenceFromIllumination(10)).toBe('low')
    expect(moonInterferenceFromIllumination(29.9)).toBe('low')
    expect(moonInterferenceFromIllumination(30)).toBe('moderate')
    expect(moonInterferenceFromIllumination(59.9)).toBe('moderate')
    expect(moonInterferenceFromIllumination(60)).toBe('high')
    expect(moonInterferenceFromIllumination(84.9)).toBe('high')
    expect(moonInterferenceFromIllumination(85)).toBe('severe')
    expect(moonInterferenceFromIllumination(100)).toBe('severe')
  })

  it('returns illumination at a given time', () => {
    const result = moonConditionsAt(new Date(Date.UTC(2026, 0, 1, 12, 0, 0)))
    expect(result.illuminationPct).toBeGreaterThanOrEqual(0)
    expect(result.illuminationPct).toBeLessThanOrEqual(100)
    expect(result.interference).toBe(moonInterferenceFromIllumination(result.illuminationPct))
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/lib/meteor/moon.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement**

```ts
// lib/meteor/moon.ts
import { illuminatedPercentage } from '../moon/phase'
import type { MoonInterference } from '../../types/meteor'

export function moonInterferenceFromIllumination(pct: number): MoonInterference {
  if (pct < 10) return 'none'
  if (pct < 30) return 'low'
  if (pct < 60) return 'moderate'
  if (pct < 85) return 'high'
  return 'severe'
}

export function moonConditionsAt(when: Date): {
  illuminationPct: number
  interference: MoonInterference
} {
  const illuminationPct = illuminatedPercentage(when)
  return {
    illuminationPct,
    interference: moonInterferenceFromIllumination(illuminationPct)
  }
}
```

- [ ] **Step 4: Run tests — expect PASS**

- [ ] **Step 5: Commit**

```bash
git add lib/meteor/moon.ts tests/lib/meteor/moon.test.ts
git commit -m "feat(meteor): add moon interference at peak"
```

---

### Task 5: Visibility score, direction, best time

**Files:**
- Create: `lib/meteor/visibility.ts`
- Test: `tests/lib/meteor/visibility.test.ts`

**Interfaces:**
- Consumes: `MeteorShowerDefinition`, `MoonInterference`, `MeteorVisibilityScore`; `azimuthToDirection` from `lib/direction`; astronomy-engine `Observer`, `Horizon`
- Produces:
  - `getRadiantHorizontal(def, lat, lng, when): { altitude: number; azimuth: number }`
  - `computeMeteorVisibilityScore(args): MeteorVisibilityScore`
  - `bestObservationTimeLabel(def, lat, lng | null, peakAt: Date): string`

Score rules (spec §7) — implement exactly:

1. Altitude base: `<0`→1, `0–15`→2, `15–40`→3, `40–70`→4, `≥70`→5  
2. Moon: none/low 0; moderate −1; high −2; severe −3 (floor 1)  
3. ZHR: `≥100` +1; `<20` −1 if stars>1; else 0  
4. Clamp 1–5; labels 1 Poor, 2–3 Fair, 4 Good, 5 Excellent  
5. `cloudCoverPct: null`; reasons ≤3 Vietnamese strings

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import { getShowerDefinition } from '../../../lib/meteor/catalog'
import {
  bestObservationTimeLabel,
  computeMeteorVisibilityScore,
  getRadiantHorizontal
} from '../../../lib/meteor/visibility'

describe('meteor visibility', () => {
  it('computes radiant horizontal coordinates', () => {
    const perseids = getShowerDefinition('perseids')
    const peak = new Date(Date.UTC(2026, 7, 12, 20, 0, 0))
    const pos = getRadiantHorizontal(perseids, 21.03, 105.85, peak)
    expect(Number.isFinite(pos.altitude)).toBe(true)
    expect(Number.isFinite(pos.azimuth)).toBe(true)
  })

  it('applies altitude, moon, and zhr rules', () => {
    const high = computeMeteorVisibilityScore({
      altitudeDeg: 50,
      interference: 'none',
      zhr: 150
    })
    expect(high.stars).toBe(5)
    expect(high.label).toBe('Excellent')
    expect(high.cloudCoverPct).toBeNull()

    const moonlit = computeMeteorVisibilityScore({
      altitudeDeg: 50,
      interference: 'severe',
      zhr: 150
    })
    expect(moonlit.stars).toBeLessThan(high.stars)

    const weak = computeMeteorVisibilityScore({
      altitudeDeg: 10,
      interference: 'none',
      zhr: 10
    })
    expect(weak.stars).toBeLessThanOrEqual(2)
  })

  it('returns the fixed best-time heuristic', () => {
    const label = bestObservationTimeLabel(
      getShowerDefinition('perseids'),
      null,
      null,
      new Date(Date.UTC(2026, 7, 12, 20, 0, 0))
    )
    expect(label.toLowerCase()).toContain('nửa đêm')
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

- [ ] **Step 3: Implement**

```ts
// lib/meteor/visibility.ts
import { Horizon, Observer } from 'astronomy-engine'
import { azimuthToDirection } from '../direction'
import type {
  MeteorShowerDefinition,
  MeteorVisibilityScore,
  MoonInterference,
  VisibilityScoreLabel
} from '../../types/meteor'

function labelForStars(stars: 1 | 2 | 3 | 4 | 5): VisibilityScoreLabel {
  if (stars === 1) return 'Poor'
  if (stars === 2 || stars === 3) return 'Fair'
  if (stars === 4) return 'Good'
  return 'Excellent'
}

function clampStars(value: number): 1 | 2 | 3 | 4 | 5 {
  const rounded = Math.round(value)
  if (rounded <= 1) return 1
  if (rounded >= 5) return 5
  return rounded as 2 | 3 | 4
}

export function getRadiantHorizontal(
  def: MeteorShowerDefinition,
  lat: number,
  lng: number,
  when: Date
): { altitude: number; azimuth: number } {
  const observer = new Observer(lat, lng, 0)
  const horizontal = Horizon(
    when,
    observer,
    def.radiantRaHours,
    def.radiantDecDeg,
    'normal'
  )
  return {
    altitude: Math.round(horizontal.altitude * 10) / 10,
    azimuth: Math.round(horizontal.azimuth * 10) / 10
  }
}

export function computeMeteorVisibilityScore(input: {
  altitudeDeg: number
  interference: MoonInterference
  zhr: number
}): MeteorVisibilityScore {
  const reasons: string[] = []
  let stars: number

  if (input.altitudeDeg < 0) {
    stars = 1
    reasons.push('Radiant đang dưới chân trời tại đỉnh.')
  } else if (input.altitudeDeg < 15) {
    stars = 2
    reasons.push('Radiant thấp — điều kiện hạn chế.')
  } else if (input.altitudeDeg < 40) {
    stars = 3
    reasons.push('Radiant ở độ cao trung bình.')
  } else if (input.altitudeDeg < 70) {
    stars = 4
    reasons.push('Radiant cao — thuận lợi quan sát.')
  } else {
    stars = 5
    reasons.push('Radiant rất cao trên bầu trời.')
  }

  const moonPenalty: Record<MoonInterference, number> = {
    none: 0,
    low: 0,
    moderate: 1,
    high: 2,
    severe: 3
  }
  const penalty = moonPenalty[input.interference]
  if (penalty > 0) {
    stars -= penalty
    reasons.push('Ánh Trăng làm giảm số meteor thấy được.')
  }

  if (input.zhr >= 100) {
    stars += 1
    reasons.push('ZHR cao — nhiều meteor mỗi giờ.')
  } else if (input.zhr < 20 && stars > 1) {
    stars -= 1
    reasons.push('ZHR thấp — cần kiên nhẫn.')
  }

  const clamped = clampStars(stars)
  return {
    stars: clamped,
    label: labelForStars(clamped),
    reasons: reasons.slice(0, 3),
    cloudCoverPct: null
  }
}

export function bestObservationTimeLabel(
  def: MeteorShowerDefinition,
  lat: number | null,
  lng: number | null,
  peakAt: Date
): string {
  let label = 'Sau nửa đêm đến trước bình minh (giờ địa phương) vào đêm peak'

  if (lat !== null && lng !== null) {
    const localMidnight = new Date(peakAt)
    // Approximate local midnight using longitude (15° ≈ 1h)
    const offsetMs = (lng / 15) * 3600 * 1000
    const utcMs = Date.UTC(
      peakAt.getUTCFullYear(),
      peakAt.getUTCMonth(),
      peakAt.getUTCDate(),
      0,
      0,
      0
    )
    const localMid = new Date(utcMs - offsetMs)
    const { altitude } = getRadiantHorizontal(def, lat, lng, localMid)
    if (altitude < 20) {
      label += ' — radiant còn thấp lúc nửa đêm, ưu tiên gần bình minh'
    }
  }

  return label
}

export function bestDirectionAtPeak(
  def: MeteorShowerDefinition,
  lat: number,
  lng: number,
  peakAt: Date
): string {
  const { azimuth } = getRadiantHorizontal(def, lat, lng, peakAt)
  return azimuthToDirection(azimuth)
}
```

- [ ] **Step 4: Run — expect PASS**

- [ ] **Step 5: Commit**

```bash
git add lib/meteor/visibility.ts tests/lib/meteor/visibility.test.ts
git commit -m "feat(meteor): add visibility score and radiant direction"
```

---

### Task 6: Observation guide

**Files:**
- Create: `lib/meteor/guide.ts`
- Test: `tests/lib/meteor/guide.test.ts`

**Interfaces:**
- Consumes: `MeteorShowerEvent`, `MoonInterference`, `MeteorObservationGuide`
- Produces: `buildMeteorObservationGuide(input): MeteorObservationGuide`

- [ ] **Step 1: Write failing test**

```ts
import { describe, expect, it } from 'vitest'
import { buildMeteorObservationGuide } from '../../../lib/meteor/guide'

describe('meteor observation guide', () => {
  it('recommends naked eye and not telescope', () => {
    const guide = buildMeteorObservationGuide({
      recommendedTime: 'Sau nửa đêm đến trước bình minh',
      interference: 'moderate'
    })
    expect(guide.equipment).toHaveLength(3)
    expect(guide.equipment.find((e) => e.kind === 'naked-eye')?.recommended).toBe(true)
    expect(guide.equipment.find((e) => e.kind === 'telescope')?.recommended).toBe(false)
    expect(guide.cloudReminder.length).toBeGreaterThan(0)
    expect(guide.moonlightImpact.toLowerCase()).toMatch(/trăng|moon|ánh/)
  })
})
```

- [ ] **Step 2: Run — FAIL**

- [ ] **Step 3: Implement**

```ts
// lib/meteor/guide.ts
import type { MeteorObservationGuide, MoonInterference } from '../../types/meteor'

const MOON_IMPACT: Record<MoonInterference, string> = {
  none: 'Ánh Trăng rất yếu — nền trời tối, thuận lợi.',
  low: 'Ánh Trăng thấp — vẫn quan sát tốt ở nơi tối.',
  moderate: 'Ánh Trăng trung bình — tránh hướng Mặt Trăng, ưu tiên meteor sáng.',
  high: 'Ánh Trăng mạnh — chỉ thấy meteor sáng; cần bầu trời thật tối.',
  severe: 'Gần Trăng tròn — nhiễu sáng cao, số meteor thấy được giảm mạnh.'
}

export function buildMeteorObservationGuide(input: {
  recommendedTime: string
  interference: MoonInterference
}): MeteorObservationGuide {
  return {
    recommendedTime: input.recommendedTime,
    darkSkyRequirement:
      'Tránh đèn đô thị; nơi tối (công viên ngoại ô, nông thôn) giúp thấy meteor mờ.',
    moonlightImpact: MOON_IMPACT[input.interference],
    cloudReminder:
      'Mây che sẽ chặn meteor — kiểm tra mây trước khi đi. Tích hợp dự báo sẽ có sau.',
    equipment: [
      {
        kind: 'naked-eye',
        recommended: true,
        note: 'Cách chính: nằm ngửa, nhìn rộng bầu trời, không cần ống nhòm.'
      },
      {
        kind: 'binoculars',
        recommended: false,
        note: 'Có thể dùng để xem vệt lửa kéo dài, không hợp quét cả bầu trời.'
      },
      {
        kind: 'telescope',
        recommended: false,
        note: 'Không khuyến nghị — thị trường hẹp, dễ bỏ lỡ meteor.'
      }
    ]
  }
}
```

- [ ] **Step 4: Run — PASS**

- [ ] **Step 5: Commit**

```bash
git add lib/meteor/guide.ts tests/lib/meteor/guide.test.ts
git commit -m "feat(meteor): add observation guide builder"
```

---

### Task 7: Notification hooks builder

**Files:**
- Create: `lib/meteor/notifications.ts`
- Test: `tests/lib/meteor/notifications.test.ts`

**Interfaces:**
- Consumes: `MeteorShowerEvent`, `MeteorNotificationHook`
- Produces: `buildMeteorNotificationHooks(event: MeteorShowerEvent): MeteorNotificationHook[]`

- [ ] **Step 1: Write failing test**

```ts
import { describe, expect, it } from 'vitest'
import { buildMeteorNotificationHooks } from '../../../lib/meteor/notifications'
import type { MeteorShowerEvent } from '../../../types/meteor'

describe('meteor notification hooks', () => {
  it('builds t-24h, t-2h, and peak-started from peakAt', () => {
    const event: MeteorShowerEvent = {
      id: 'perseids',
      year: 2026,
      name: 'Perseids',
      peakAt: '2026-08-12T20:00:00.000Z',
      activeStart: '2026-07-17T00:00:00.000Z',
      activeEnd: '2026-08-24T00:00:00.000Z',
      zhr: 100,
      difficulty: 'easy'
    }
    const hooks = buildMeteorNotificationHooks(event)
    expect(hooks).toHaveLength(3)
    expect(hooks.map((h) => h.kind)).toEqual([
      't-minus-24h',
      't-minus-2h',
      'peak-started'
    ])
    const peak = Date.parse(event.peakAt)
    expect(Date.parse(hooks[0]!.fireAt)).toBe(peak - 24 * 3600 * 1000)
    expect(Date.parse(hooks[1]!.fireAt)).toBe(peak - 2 * 3600 * 1000)
    expect(Date.parse(hooks[2]!.fireAt)).toBe(peak)
    expect(hooks[0]!.title).toContain('Perseids')
  })
})
```

- [ ] **Step 2–4: Implement + pass**

```ts
// lib/meteor/notifications.ts
import type { MeteorNotificationHook, MeteorShowerEvent } from '../../types/meteor'

export function buildMeteorNotificationHooks(
  event: MeteorShowerEvent
): MeteorNotificationHook[] {
  const peakMs = Date.parse(event.peakAt)
  const eventId = `${event.id}-${event.year}`

  return [
    {
      eventId,
      showerId: event.id,
      kind: 't-minus-24h',
      fireAt: new Date(peakMs - 24 * 3600 * 1000).toISOString(),
      title: `${event.name}: còn 24 giờ`,
      body: `Đỉnh ${event.name} dự kiến vào ngày mai. Chuẩn bị nơi quan sát tối.`
    },
    {
      eventId,
      showerId: event.id,
      kind: 't-minus-2h',
      fireAt: new Date(peakMs - 2 * 3600 * 1000).toISOString(),
      title: `${event.name}: còn 2 giờ`,
      body: `Đỉnh ${event.name} sắp tới — ra ngoài trước khi peak.`
    },
    {
      eventId,
      showerId: event.id,
      kind: 'peak-started',
      fireAt: new Date(peakMs).toISOString(),
      title: `${event.name}: đang ở đỉnh`,
      body: `Đỉnh ${event.name} bắt đầu. ZHR kỳ vọng ~${event.zhr}/giờ.`
    }
  ]
}
```

- [ ] **Step 5: Commit**

```bash
git add lib/meteor/notifications.ts tests/lib/meteor/notifications.test.ts
git commit -m "feat(meteor): add notification hook builder"
```

---

### Task 8: Card/detail assemblers + index exports

**Files:**
- Create: `lib/meteor/cards.ts`
- Create: `lib/meteor/index.ts`
- Test: `tests/lib/meteor/cards.test.ts`

**Interfaces:**
- Consumes: all prior lib modules + `getShowerDefinition`
- Produces:
  - `formatActivePeriodLabel(event: MeteorShowerEvent): string`
  - `buildUpcomingCard(event, coords | null, now?): MeteorUpcomingCard`
  - `buildEventDetail(event): MeteorEventDetail`

- [ ] **Step 1: Write failing test**

```ts
import { describe, expect, it } from 'vitest'
import { buildShowerEvent } from '../../../lib/meteor/peak'
import { getShowerDefinition } from '../../../lib/meteor/catalog'
import { buildEventDetail, buildUpcomingCard } from '../../../lib/meteor/cards'

describe('meteor cards', () => {
  const event = buildShowerEvent(getShowerDefinition('geminids'), 2026)

  it('builds upcoming card without coords (null score/direction)', () => {
    const card = buildUpcomingCard(event, null)
    expect(card.name).toBe('Geminids')
    expect(card.visibilityScore).toBeNull()
    expect(card.bestDirection).toBeNull()
    expect(card.expectedMeteorsPerHour).toBe(150)
    expect(card.moonIlluminationPct).toBeGreaterThanOrEqual(0)
  })

  it('builds upcoming card with coords (score + direction)', () => {
    const card = buildUpcomingCard(event, { lat: 21.03, lng: 105.85 })
    expect(card.visibilityScore?.stars).toBeGreaterThanOrEqual(1)
    expect(card.bestDirection).toBeTruthy()
  })

  it('builds event detail with visibility map stub', () => {
    const detail = buildEventDetail(event)
    expect(detail.originConstellation).toBe('Gemini')
    expect(detail.visibilityMap.status).toBe('unavailable')
    expect(detail.parentComet).toContain('Phaethon')
  })
})
```

- [ ] **Step 2: Run — FAIL**

- [ ] **Step 3: Implement cards + index**

```ts
// lib/meteor/cards.ts
import type { Coordinates } from '../../types/location'
import type {
  MeteorEventDetail,
  MeteorShowerEvent,
  MeteorUpcomingCard
} from '../../types/meteor'
import { getShowerDefinition } from './catalog'
import { moonConditionsAt } from './moon'
import {
  bestDirectionAtPeak,
  bestObservationTimeLabel,
  computeMeteorVisibilityScore,
  getRadiantHorizontal
} from './visibility'

function formatDateLabel(iso: string): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(iso))
}

function formatTimeLabel(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  }).format(new Date(iso))
}

export function formatActivePeriodLabel(event: MeteorShowerEvent): string {
  return `${formatDateLabel(event.activeStart)} – ${formatDateLabel(event.activeEnd)}`
}

export function buildUpcomingCard(
  event: MeteorShowerEvent,
  coords: Coordinates | null
): MeteorUpcomingCard {
  const def = getShowerDefinition(event.id)
  const peakAt = new Date(event.peakAt)
  const moon = moonConditionsAt(peakAt)

  let visibilityScore = null
  let bestDirection = null

  if (coords) {
    const { altitude } = getRadiantHorizontal(def, coords.lat, coords.lng, peakAt)
    visibilityScore = computeMeteorVisibilityScore({
      altitudeDeg: altitude,
      interference: moon.interference,
      zhr: event.zhr
    })
    bestDirection = bestDirectionAtPeak(def, coords.lat, coords.lng, peakAt)
  }

  return {
    id: event.id,
    name: event.name,
    activePeriodLabel: formatActivePeriodLabel(event),
    peakDateLabel: formatDateLabel(event.peakAt),
    peakTimeLabel: formatTimeLabel(event.peakAt),
    peakAt: event.peakAt,
    expectedMeteorsPerHour: event.zhr,
    moonIlluminationPct: moon.illuminationPct,
    moonInterference: moon.interference,
    visibilityScore,
    bestObservationTimeLabel: bestObservationTimeLabel(
      def,
      coords?.lat ?? null,
      coords?.lng ?? null,
      peakAt
    ),
    bestDirection,
    difficulty: event.difficulty
  }
}

export function buildEventDetail(event: MeteorShowerEvent): MeteorEventDetail {
  const def = getShowerDefinition(event.id)
  return {
    id: event.id,
    name: event.name,
    description: def.description,
    originConstellation: def.originConstellation,
    radiantRaHours: def.radiantRaHours,
    radiantDecDeg: def.radiantDecDeg,
    expectedSpeedKmS: def.speedKmS,
    parentComet: def.parentComet,
    peakDurationHours: def.peakDurationHours,
    peakAt: event.peakAt,
    activeStart: event.activeStart,
    activeEnd: event.activeEnd,
    zhr: event.zhr,
    visibilityMap: {
      status: 'unavailable',
      message: 'Bản đồ tầm nhìn sẽ có ở phiên bản sau.'
    }
  }
}
```

```ts
// lib/meteor/index.ts
export { METEOR_SHOWER_CATALOG, getShowerDefinition } from './catalog'
export {
  solarLongitudeDeg,
  findSolarLongitudeTime,
  buildShowerEvent,
  listShowerEventsForYear,
  listUpcomingShowerEvents
} from './peak'
export { moonInterferenceFromIllumination, moonConditionsAt } from './moon'
export {
  getRadiantHorizontal,
  computeMeteorVisibilityScore,
  bestObservationTimeLabel,
  bestDirectionAtPeak
} from './visibility'
export { buildMeteorObservationGuide } from './guide'
export { buildMeteorNotificationHooks } from './notifications'
export {
  formatActivePeriodLabel,
  buildUpcomingCard,
  buildEventDetail
} from './cards'
```

- [ ] **Step 4: Run — PASS**

- [ ] **Step 5: Commit**

```bash
git add lib/meteor/cards.ts lib/meteor/index.ts tests/lib/meteor/cards.test.ts
git commit -m "feat(meteor): assemble upcoming cards and event detail"
```

---

### Task 9: `useMeteor` composable

**Files:**
- Create: `app/composables/useMeteor.ts`
- Test: `tests/composables/useMeteor.test.ts`

**Interfaces:**
- Consumes: `Ref<Coordinates | null>`, lib/meteor exports
- Produces: API below

```ts
useMeteor(coordinates: Ref<Coordinates | null>, when?: Date | (() => Date))
// viewedYear, goToPrevYear, goToNextYear
// selectedId, selectShower(id), clearSelected()
// upcoming, yearEvents, selectedDetail, selectedGuide, selectedScore
// notificationHooks, error, refresh()
```

Behavior:
- Without coords: still fill `upcoming` / `yearEvents` / detail / guide; `selectedScore` null; card scores null.
- Default `selectedId` = first upcoming (or first of viewed year when browsing another year).
- Year navigation clears selection then re-defaults to first event of that year.
- Errors: Vietnamese fallback `Không thể tính lịch mưa sao băng. Hãy thử làm mới.`

Mirror `useMoonCalendar` patterns (`resolveWhenSource`, `refreshToken`, `watch`).

- [ ] **Step 1: Write failing composable tests** (mirror `tests/composables/useMoonCalendar.test.ts` structure): upcoming without coords; score when coords set; year nav; select/clear; error surfacing via spy on `listUpcomingShowerEvents`.

- [ ] **Step 2: Run — FAIL**

- [ ] **Step 3: Implement `useMeteor.ts`** following moon composable structure, calling:
  - `listUpcomingShowerEvents` → map `buildUpcomingCard`
  - `listShowerEventsForYear(viewedYear)` → `yearEvents`
  - on select: `buildEventDetail`, `buildMeteorObservationGuide` (from card’s best time + moon interference), `buildMeteorNotificationHooks`, score from card

- [ ] **Step 4: Run — PASS**

- [ ] **Step 5: Commit**

```bash
git add app/composables/useMeteor.ts tests/composables/useMeteor.test.ts
git commit -m "feat(meteor): add useMeteor composable"
```

---

### Task 10: UI components

**Files:**
- Create:
  - `app/components/meteor/MeteorUpcomingList.vue`
  - `app/components/meteor/MeteorVisibilityScore.vue`
  - `app/components/meteor/MeteorEventDetail.vue`
  - `app/components/meteor/MeteorObservationGuide.vue`
  - `app/components/meteor/MeteorYearCalendar.vue`
  - `app/components/meteor/MeteorNotificationsStub.vue`

**Interfaces:**
- Consumes: types from `types/meteor.ts`; emit `select` / year nav events
- Produces: presentational components only

- [ ] **Step 1: Implement components** using `SkyCard` + `SectionTitle`, Vietnamese titles:

| Component | Title (VI) | Key props |
|-----------|------------|-----------|
| UpcomingList | Mưa sao băng sắp tới | `cards`, `selectedId`; emit `select(id)` |
| VisibilityScore | Điểm quan sát | `score: MeteorVisibilityScore \| null` — if null show “Cần vị trí để chấm điểm” |
| EventDetail | Chi tiết | `detail`; show map stub message |
| ObservationGuide | Hướng dẫn quan sát | `guide` |
| YearCalendar | Lịch trong năm | `year`, `events`, `selectedId`; emit `prev`/`next`/`select` |
| NotificationsStub | Thông báo | static “Sắp có” like ISS |

Difficulty labels VI map: easy→Dễ, moderate→Trung bình, challenging→Khó.

Moon interference VI: none→Không, low→Thấp, moderate→Trung bình, high→Cao, severe→Rất cao.

Match slate/sky button/card classes from `MoonUpcomingEvents.vue` / ISS cards.

- [ ] **Step 2: Commit**

```bash
git add app/components/meteor/*.vue
git commit -m "feat(meteor): add meteor shower UI components"
```

---

### Task 11: Page + homepage link

**Files:**
- Create: `app/pages/meteor-showers.vue`
- Modify: `app/pages/index.vue` (add `meteorShowersLink` + NuxtLink)

**Interfaces:**
- Consumes: `useGeolocationInput`, `useMeteor`, all meteor components
- Produces: `/meteor-showers` route

- [ ] **Step 1: Create page** mirroring `moon-calendar.vue` location bootstrap (`?lat&lng`, GPS, manual fallback) **but** still render upcoming list + calendar when coordinates are null (only score/direction degrade).

Page order:
1. Header
2. Location / bootstrap UI
3. Upcoming list
4. Visibility score (selected)
5. Event detail
6. Observation guide
7. Year calendar
8. Notifications stub

`useHead({ title: "Meteor Showers · What's Above Me?" })`

- [ ] **Step 2: Add homepage link** next to Moon Calendar link:

```ts
const meteorShowersLink = computed(() => {
  if (!coordinates.value) return null
  return {
    path: '/meteor-showers',
    query: {
      lat: String(coordinates.value.lat),
      lng: String(coordinates.value.lng)
    }
  }
})
```

```html
<NuxtLink v-if="meteorShowersLink" :to="meteorShowersLink" class="…same classes…">
  Mưa sao băng
</NuxtLink>
```

- [ ] **Step 3: Manual smoke** — `npm run dev`, open `/meteor-showers`, confirm 8-year calendar + upcoming without forcing GPS failure to blank the page.

- [ ] **Step 4: Run full suite**

Run: `npm test`
Expected: all existing + new meteor tests PASS

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/pages/meteor-showers.vue app/pages/index.vue
git commit -m "feat(meteor): add meteor-showers page and home link"
```

---

### Task 12: Spec coverage self-check + polish

**Files:**
- Modify only if gaps found during check

- [ ] **Step 1: Checklist against spec**

| Spec item | Task |
|-----------|------|
| Upcoming fields | 8, 10, 11 |
| Event detail + map stub | 8, 10 |
| Observation guide + equipment | 6, 10 |
| Notifications architecture | 7, 10 |
| Year calendar 8 showers | 3, 10, 11 |
| Hybrid location | 5, 8, 9, 11 |
| Solar λ yearly peaks | 3 |
| Future hooks types | 1 |
| Home link | 11 |
| Tests | 2–9 |
| No AI / no paid API / no meteor API | Global |

- [ ] **Step 2: Fix any gaps found; re-run `npm test` + `npm run typecheck`**

- [ ] **Step 3: Final commit if needed**

```bash
git add -A
git commit -m "chore(meteor): polish after spec coverage pass"
```

---

## Self-Review (plan author)

1. **Spec coverage:** All in-scope sections map to tasks 1–11; future hooks are types-only in Task 1; stubs in Tasks 7/10.
2. **Placeholders:** None remaining in catalog data. During Task 3, verify `Search` against `astronomy.d.ts` and adapt the call if the return type differs — keep public peak helpers unchanged.
3. **Type consistency:** Names match spec (`MeteorShowerId`, `MeteorUpcomingCard`, `MeteorNotificationKind`, etc.) across tasks.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-08-04-meteor-showers.md`. Two execution options:

**1. Subagent-Driven (recommended)** — dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
