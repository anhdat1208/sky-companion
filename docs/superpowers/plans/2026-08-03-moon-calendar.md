# Moon Calendar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `/moon-calendar` with today’s Moon metrics + SVG phase illustration, monthly calendar (prev/next), day-detail panel, upcoming quarter events, observation score, and photography guide — all client-side via Astronomy Engine.

**Architecture:** Pure domain in `lib/moon/*` (refactor from `lib/moon.ts`) → `useMoonCalendar` orchestration → `components/moon/*` → `pages/moon-calendar.vue`. Keep `getMoonInfo` for `/api/moon` and sky snapshot. No new Nitro calendar API. Follows `docs/superpowers/specs/2026-08-03-moon-calendar-design.md`.

**Tech Stack:** Nuxt 4, Vue 3 Composition API, TypeScript strict, TailwindCSS, Vitest, astronomy-engine, existing geolocation composables/components.

## Global Constraints

- Vietnamese UI chrome; English phase names (`New Moon`, `Full Moon`, …).
- Client-side calculations only for the calendar page; no paid APIs; no AI.
- Business logic stays in `lib/moon/*` — Vue components are presentation-only (formatting OK).
- Preserve `MoonInfo` / `getMoonInfo` contract for `/api/moon` and `lib/astronomy.ts`.
- Lunar eclipse: types + empty stub only — no search/UI.
- Week starts **Monday**; padding days not selectable.
- Observation score: altitude + phase/illumination heuristic → stars 1–5; labels 1 Poor, 2–3 Fair, 4 Good, 5 Excellent.
- Composition API only; match slate/sky visual language (`SkyCard`, `SectionTitle`).
- Spec: `docs/superpowers/specs/2026-08-03-moon-calendar-design.md`.

## File Map

| File | Responsibility |
|------|----------------|
| `types/moon.ts` | All Moon Calendar domain types + future hooks |
| `lib/moon/phase.ts` | Phase name, icon key, illumination, age |
| `lib/moon/position.ts` | Alt/az, rise/set, distance, angular diameter |
| `lib/moon/snapshot.ts` | `getMoonInfo` compatibility wrapper |
| `lib/moon/calendar.ts` | Month grid builder |
| `lib/moon/events.ts` | Next four moon quarters |
| `lib/moon/score.ts` | Observation score 1–5 |
| `lib/moon/photography.ts` | Photography recommendations |
| `lib/moon/eclipse.ts` | Stub `listUpcomingLunarEclipses` → `[]` |
| `lib/moon/index.ts` | Public re-exports |
| `lib/moon.ts` | **Delete** after migration |
| `server/api/moon.get.ts` | Import path update |
| `lib/astronomy.ts` | Import path update |
| `app/composables/useMoonCalendar.ts` | Page orchestration |
| `app/components/moon/*.vue` | Section UI |
| `app/pages/moon-calendar.vue` | Page composition |
| `app/pages/index.vue` | Entry link |
| `tests/lib/moon/*.test.ts` | Domain tests |
| `tests/composables/useMoonCalendar.test.ts` | Composable tests |

---

### Task 1: Domain types

**Files:**
- Create: `types/moon.ts`
- Test: none (types only; verified by later compile/tests)

**Interfaces:**
- Consumes: none
- Produces: all exported types below (exact names used by later tasks)

- [ ] **Step 1: Create `types/moon.ts`**

```ts
export type MoonPhaseName =
  | 'New Moon'
  | 'Waxing Crescent'
  | 'First Quarter'
  | 'Waxing Gibbous'
  | 'Full Moon'
  | 'Waning Gibbous'
  | 'Last Quarter'
  | 'Waning Crescent'

export type MoonPhaseIconKey =
  | 'new'
  | 'waxing-crescent'
  | 'first-quarter'
  | 'waxing-gibbous'
  | 'full'
  | 'waning-gibbous'
  | 'last-quarter'
  | 'waning-crescent'

export interface MoonTodaySnapshot {
  timestamp: string
  phase: MoonPhaseName
  iconKey: MoonPhaseIconKey
  phaseAngleDeg: number
  illuminatedPercentage: number
  ageDays: number
  riseTime: string | null
  setTime: string | null
  altitude: number
  azimuth: number
  distanceKm: number
  angularDiameterDeg: number
}

export interface MoonCalendarDay {
  dateISO: string
  phase: MoonPhaseName
  iconKey: MoonPhaseIconKey
  illuminatedPercentage: number
  riseTime: string | null
  setTime: string | null
  isToday: boolean
  inCurrentMonth: boolean
}

export interface ObservationScore {
  stars: 1 | 2 | 3 | 4 | 5
  label: ObservationScoreLabel
  reasons: string[]
}

export type ObservationScoreLabel =
  | 'Poor'
  | 'Fair'
  | 'Good'
  | 'Excellent'

export interface PhotographyGuide {
  bestForLandscape: boolean
  bestForCraters: boolean
  bestForMoonrise: boolean
  recommendedFocalLengthMm: { min: number; max: number }
  notes: string[]
}

export interface MoonDayDetail extends MoonCalendarDay {
  phaseAngleDeg: number
  ageDays: number
  altitude: number
  azimuth: number
  distanceKm: number
  angularDiameterDeg: number
  observationScore: ObservationScore
  photography: PhotographyGuide
}

export type MoonQuarterType =
  | 'new'
  | 'first-quarter'
  | 'full'
  | 'last-quarter'

export interface MoonQuarterEvent {
  type: MoonQuarterType
  at: string
  daysRemaining: number
}

export type EclipseType = 'penumbral' | 'partial' | 'total'

export type Visibility =
  | 'not-visible'
  | 'partially-visible'
  | 'fully-visible'
  | 'unknown'

export interface Magnitude {
  umbral: number | null
  penumbral: number | null
}

export interface LunarEclipse {
  type: EclipseType
  peakTime: string
  magnitude: Magnitude
  visibility: Visibility
  observerLat: number | null
  observerLng: number | null
}

export type MoonSpecialEventKind =
  | 'supermoon'
  | 'blue-moon'
  | 'blood-moon'

export interface MoonSpecialEvent {
  kind: MoonSpecialEventKind
  at: string
  label: string
}

export interface MoonNotificationHook {
  eventId: string
  fireAt: string
  title: string
  body: string
}

export interface MoonCalendarExportHook {
  format: 'ical' | 'json'
  payload: string
}

export interface MoonWidgetSummary {
  phase: MoonPhaseName
  illuminatedPercentage: number
  nextQuarter: MoonQuarterEvent | null
}
```

- [ ] **Step 2: Commit**

```bash
git add types/moon.ts
git commit -m "feat(moon): add Moon Calendar domain types"
```

---

### Task 2: Phase helpers

**Files:**
- Create: `lib/moon/phase.ts`
- Test: `tests/lib/moon/phase.test.ts`

**Interfaces:**
- Consumes: `MoonPhaseName`, `MoonPhaseIconKey` from `types/moon.ts`
- Produces:
  - `SYNODIC_MONTH_DAYS: 29.530588853`
  - `moonPhaseName(phaseAngleDeg: number): MoonPhaseName`
  - `moonPhaseIconKey(phaseAngleDeg: number): MoonPhaseIconKey`
  - `illuminatedPercentage(when: Date): number`
  - `moonAgeDays(phaseAngleDeg: number): number`
  - `normalizePhaseAngle(phaseAngleDeg: number): number`

- [ ] **Step 1: Write the failing test**

```ts
// tests/lib/moon/phase.test.ts
import { describe, expect, it } from 'vitest'
import {
  moonAgeDays,
  moonPhaseIconKey,
  moonPhaseName,
  normalizePhaseAngle
} from '../../../lib/moon/phase'

describe('moon phase helpers', () => {
  it('maps phase angles to the eight named phases', () => {
    expect(moonPhaseName(0)).toBe('New Moon')
    expect(moonPhaseName(45)).toBe('Waxing Crescent')
    expect(moonPhaseName(90)).toBe('First Quarter')
    expect(moonPhaseName(180)).toBe('Full Moon')
    expect(moonPhaseName(270)).toBe('Last Quarter')
  })

  it('maps phase angles to icon keys', () => {
    expect(moonPhaseIconKey(0)).toBe('new')
    expect(moonPhaseIconKey(90)).toBe('first-quarter')
    expect(moonPhaseIconKey(180)).toBe('full')
    expect(moonPhaseIconKey(270)).toBe('last-quarter')
  })

  it('normalizes negative angles and computes age in synodic range', () => {
    expect(normalizePhaseAngle(-90)).toBe(270)
    const age = moonAgeDays(180)
    expect(age).toBeGreaterThan(14)
    expect(age).toBeLessThan(15)
    expect(moonAgeDays(0)).toBe(0)
    expect(moonAgeDays(359)).toBeLessThan(29.530588853)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/lib/moon/phase.test.ts`  
Expected: FAIL (module not found)

- [ ] **Step 3: Implement `lib/moon/phase.ts`**

```ts
import { Body, Illumination, MoonPhase } from 'astronomy-engine'
import type { MoonPhaseIconKey, MoonPhaseName } from '../../types/moon'

export const SYNODIC_MONTH_DAYS = 29.530588853

const PHASE_NAMES: readonly MoonPhaseName[] = [
  'New Moon',
  'Waxing Crescent',
  'First Quarter',
  'Waxing Gibbous',
  'Full Moon',
  'Waning Gibbous',
  'Last Quarter',
  'Waning Crescent'
] as const

const PHASE_ICONS: readonly MoonPhaseIconKey[] = [
  'new',
  'waxing-crescent',
  'first-quarter',
  'waxing-gibbous',
  'full',
  'waning-gibbous',
  'last-quarter',
  'waning-crescent'
] as const

function round(value: number, decimals = 1): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

export function normalizePhaseAngle(phaseAngleDeg: number): number {
  return ((phaseAngleDeg % 360) + 360) % 360
}

export function moonPhaseName(phaseAngleDeg: number): MoonPhaseName {
  const normalized = normalizePhaseAngle(phaseAngleDeg)
  return PHASE_NAMES[Math.round(normalized / 45) % 8]!
}

export function moonPhaseIconKey(phaseAngleDeg: number): MoonPhaseIconKey {
  const normalized = normalizePhaseAngle(phaseAngleDeg)
  return PHASE_ICONS[Math.round(normalized / 45) % 8]!
}

export function illuminatedPercentage(when: Date): number {
  const illumination = Illumination(Body.Moon, when)
  return round(illumination.phase_fraction * 100)
}

export function moonAgeDays(phaseAngleDeg: number): number {
  const normalized = normalizePhaseAngle(phaseAngleDeg)
  return round((normalized / 360) * SYNODIC_MONTH_DAYS, 1)
}

export function moonPhaseAngleDeg(when: Date): number {
  return MoonPhase(when)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/lib/moon/phase.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/moon/phase.ts tests/lib/moon/phase.test.ts
git commit -m "feat(moon): add phase name, icon, and age helpers"
```

---

### Task 3: Position helpers

**Files:**
- Create: `lib/moon/position.ts`
- Test: `tests/lib/moon/position.test.ts`

**Interfaces:**
- Consumes: astronomy-engine `Body`, `Equator`, `Horizon`, `Observer`, `SearchRiseSet`, `GeoVector`
- Produces:
  - `AU_KM = 149597870.7`
  - `MOON_RADIUS_KM = 1737.4`
  - `getMoonHorizontal(lat, lng, when): { altitude: number; azimuth: number }`
  - `getMoonRiseSet(lat, lng, when): { riseTime: string | null; setTime: string | null }`
  - `getMoonDistanceKm(when: Date): number`
  - `getMoonAngularDiameterDeg(distanceKm: number): number`

- [ ] **Step 1: Write the failing test**

```ts
// tests/lib/moon/position.test.ts
import { describe, expect, it } from 'vitest'
import {
  getMoonAngularDiameterDeg,
  getMoonDistanceKm,
  getMoonHorizontal,
  getMoonRiseSet
} from '../../../lib/moon/position'

const WHEN = new Date('2026-08-03T14:00:00Z')
const LAT = 21.0285
const LNG = 105.8542

describe('moon position helpers', () => {
  it('returns finite altitude and azimuth', () => {
    const { altitude, azimuth } = getMoonHorizontal(LAT, LNG, WHEN)
    expect(Number.isFinite(altitude)).toBe(true)
    expect(Number.isFinite(azimuth)).toBe(true)
    expect(azimuth).toBeGreaterThanOrEqual(0)
    expect(azimuth).toBeLessThan(360)
  })

  it('returns ISO rise/set or null', () => {
    const { riseTime, setTime } = getMoonRiseSet(LAT, LNG, WHEN)
    if (riseTime !== null) {
      expect(Number.isNaN(Date.parse(riseTime))).toBe(false)
    }
    if (setTime !== null) {
      expect(Number.isNaN(Date.parse(setTime))).toBe(false)
    }
  })

  it('returns Earth–Moon distance and angular diameter in expected bands', () => {
    const distanceKm = getMoonDistanceKm(WHEN)
    expect(distanceKm).toBeGreaterThan(350000)
    expect(distanceKm).toBeLessThan(420000)
    const diameter = getMoonAngularDiameterDeg(distanceKm)
    expect(diameter).toBeGreaterThan(0.4)
    expect(diameter).toBeLessThan(0.6)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/lib/moon/position.test.ts`  
Expected: FAIL (module not found)

- [ ] **Step 3: Implement `lib/moon/position.ts`**

```ts
import {
  Body,
  Equator,
  GeoVector,
  Horizon,
  Observer,
  SearchRiseSet
} from 'astronomy-engine'

export const AU_KM = 149597870.7
export const MOON_RADIUS_KM = 1737.4

function round(value: number, decimals = 1): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

export function getMoonHorizontal(
  lat: number,
  lng: number,
  when: Date
): { altitude: number; azimuth: number } {
  const observer = new Observer(lat, lng, 0)
  const equatorial = Equator(Body.Moon, when, observer, true, true)
  const horizontal = Horizon(
    when,
    observer,
    equatorial.ra,
    equatorial.dec,
    'normal'
  )
  return {
    altitude: round(horizontal.altitude),
    azimuth: round(horizontal.azimuth)
  }
}

export function getMoonRiseSet(
  lat: number,
  lng: number,
  when: Date
): { riseTime: string | null; setTime: string | null } {
  const observer = new Observer(lat, lng, 0)
  const rise = SearchRiseSet(Body.Moon, observer, 1, when, 2)
  const set = SearchRiseSet(Body.Moon, observer, -1, when, 2)
  return {
    riseTime: rise?.date.toISOString() ?? null,
    setTime: set?.date.toISOString() ?? null
  }
}

export function getMoonDistanceKm(when: Date): number {
  const vector = GeoVector(Body.Moon, when, true)
  return Math.round(vector.Length() * AU_KM)
}

export function getMoonAngularDiameterDeg(distanceKm: number): number {
  const radians = 2 * Math.atan(MOON_RADIUS_KM / distanceKm)
  return round((radians * 180) / Math.PI, 3)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/lib/moon/position.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/moon/position.ts tests/lib/moon/position.test.ts
git commit -m "feat(moon): add position, distance, and diameter helpers"
```

---

### Task 4: Snapshot migration (`getMoonInfo`)

**Files:**
- Create: `lib/moon/snapshot.ts`
- Create: `lib/moon/index.ts`
- Modify: `server/api/moon.get.ts`
- Modify: `lib/astronomy.ts`
- Delete: `lib/moon.ts`
- Test: `tests/lib/moon/snapshot.test.ts`

**Interfaces:**
- Consumes: phase + position helpers; `MoonInfo` from `types/astronomy.ts`
- Produces: `getMoonInfo(lat, lng, when): MoonInfo` (same shape as before)

- [ ] **Step 1: Write the failing test**

```ts
// tests/lib/moon/snapshot.test.ts
import { describe, expect, it } from 'vitest'
import { getMoonInfo } from '../../../lib/moon/snapshot'

describe('getMoonInfo', () => {
  it('returns MoonInfo shape with finite metrics', () => {
    const moon = getMoonInfo(21.0285, 105.8542, new Date('2026-08-03T14:00:00Z'))
    expect(typeof moon.phase).toBe('string')
    expect(Number.isFinite(moon.altitude)).toBe(true)
    expect(Number.isFinite(moon.azimuth)).toBe(true)
    expect(moon.illuminatedPercentage).toBeGreaterThanOrEqual(0)
    expect(moon.illuminatedPercentage).toBeLessThanOrEqual(100)
    expect(moon).toHaveProperty('riseTime')
    expect(moon).toHaveProperty('setTime')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/lib/moon/snapshot.test.ts`  
Expected: FAIL

- [ ] **Step 3: Implement snapshot + index; rewire imports; delete old file**

```ts
// lib/moon/snapshot.ts
import type { MoonInfo } from '../../types/astronomy'
import {
  illuminatedPercentage,
  moonPhaseAngleDeg,
  moonPhaseName
} from './phase'
import { getMoonHorizontal, getMoonRiseSet } from './position'

export function getMoonInfo(
  lat: number,
  lng: number,
  when: Date
): MoonInfo {
  const phaseAngle = moonPhaseAngleDeg(when)
  const { altitude, azimuth } = getMoonHorizontal(lat, lng, when)
  const { riseTime, setTime } = getMoonRiseSet(lat, lng, when)

  return {
    altitude,
    azimuth,
    riseTime,
    setTime,
    illuminatedPercentage: illuminatedPercentage(when),
    phase: moonPhaseName(phaseAngle)
  }
}
```

```ts
// lib/moon/index.ts
export {
  SYNODIC_MONTH_DAYS,
  illuminatedPercentage,
  moonAgeDays,
  moonPhaseAngleDeg,
  moonPhaseIconKey,
  moonPhaseName,
  normalizePhaseAngle
} from './phase'
export {
  AU_KM,
  MOON_RADIUS_KM,
  getMoonAngularDiameterDeg,
  getMoonDistanceKm,
  getMoonHorizontal,
  getMoonRiseSet
} from './position'
export { getMoonInfo } from './snapshot'
```

Update `server/api/moon.get.ts` and `lib/astronomy.ts` imports to:

```ts
import { getMoonInfo } from '../moon' // astronomy.ts stays relative: './moon' still works via folder index
```

For `server/api/moon.get.ts`:

```ts
import { getMoonInfo } from '../../lib/moon'
```

For `lib/astronomy.ts`:

```ts
import { getMoonInfo } from './moon'
```

Delete `lib/moon.ts` (file) so Node/TS resolves `lib/moon` → `lib/moon/index.ts`.

- [ ] **Step 4: Run snapshot + moon API regression tests**

Run:

```bash
npx vitest run tests/lib/moon/snapshot.test.ts tests/lib/moon/phase.test.ts tests/lib/moon/position.test.ts tests/server/api.test.ts
```

Expected: PASS (if `api.test.ts` covers `/api/moon`; if not, at least moon unit tests PASS)

- [ ] **Step 5: Commit**

```bash
git add lib/moon server/api/moon.get.ts lib/astronomy.ts
git add -u lib/moon.ts
git add tests/lib/moon/snapshot.test.ts
git commit -m "refactor(moon): move getMoonInfo into lib/moon package"
```

---

### Task 5: Observation score

**Files:**
- Create: `lib/moon/score.ts`
- Modify: `lib/moon/index.ts` (re-export)
- Test: `tests/lib/moon/score.test.ts`

**Interfaces:**
- Consumes: `ObservationScore` from `types/moon.ts`
- Produces: `computeObservationScore(altitudeDeg, phaseAngleDeg, illuminatedPercentage): ObservationScore`

- [ ] **Step 1: Write the failing test**

```ts
// tests/lib/moon/score.test.ts
import { describe, expect, it } from 'vitest'
import { computeObservationScore } from '../../../lib/moon/score'

describe('computeObservationScore', () => {
  it('caps below-horizon moons at 1 Poor', () => {
    const score = computeObservationScore(-10, 90, 50)
    expect(score.stars).toBe(1)
    expect(score.label).toBe('Poor')
  })

  it('boosts mid-illumination quarters when altitude is good', () => {
    const score = computeObservationScore(45, 90, 50)
    expect(score.stars).toBeGreaterThanOrEqual(4)
    expect(['Good', 'Excellent']).toContain(score.label)
  })

  it('forces near-new moons to Poor', () => {
    const score = computeObservationScore(50, 0, 2)
    expect(score.stars).toBe(1)
    expect(score.label).toBe('Poor')
  })

  it('maps star counts to labels per spec', () => {
    expect(computeObservationScore(-1, 180, 100).label).toBe('Poor')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/lib/moon/score.test.ts`  
Expected: FAIL

- [ ] **Step 3: Implement `lib/moon/score.ts`**

```ts
import type { ObservationScore, ObservationScoreLabel } from '../../types/moon'

function labelForStars(stars: 1 | 2 | 3 | 4 | 5): ObservationScoreLabel {
  if (stars === 1) return 'Poor'
  if (stars === 2 || stars === 3) return 'Fair'
  if (stars === 4) return 'Good'
  return 'Excellent'
}

function clampStars(value: number): 1 | 2 | 3 | 4 | 5 {
  const rounded = Math.round(value)
  if (rounded <= 1) return 1
  if (rounded === 2) return 2
  if (rounded === 3) return 3
  if (rounded === 4) return 4
  return 5
}

export function computeObservationScore(
  altitudeDeg: number,
  _phaseAngleDeg: number,
  illuminatedPercentage: number
): ObservationScore {
  const reasons: string[] = []
  let stars: number

  if (altitudeDeg < 0) {
    stars = 1
    reasons.push('Mặt Trăng đang dưới chân trời.')
  } else if (altitudeDeg < 15) {
    stars = 2
    reasons.push('Cao độ thấp — điều kiện quan sát hạn chế.')
  } else if (altitudeDeg < 40) {
    stars = 3
    reasons.push('Cao độ trung bình.')
  } else {
    stars = 4
    reasons.push('Cao độ tốt cho quan sát.')
  }

  if (illuminatedPercentage < 5) {
    stars = Math.min(stars, 1)
    reasons.push('Gần New Moon — bề mặt hầu như không thấy.')
  } else if (illuminatedPercentage >= 30 && illuminatedPercentage <= 70) {
    stars += 1
    reasons.push('Pha gần quarter — terminator rõ, hợp xem hố va chạm.')
  } else if (illuminatedPercentage >= 90 && altitudeDeg >= 15) {
    stars += 1
    reasons.push('Gần Full Moon — sáng, hợp chụp phong cảnh.')
  }

  const clamped = clampStars(stars)
  return {
    stars: clamped,
    label: labelForStars(clamped),
    reasons: reasons.slice(0, 3)
  }
}
```

Re-export from `lib/moon/index.ts`:

```ts
export { computeObservationScore } from './score'
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/lib/moon/score.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/moon/score.ts lib/moon/index.ts tests/lib/moon/score.test.ts
git commit -m "feat(moon): add observation score heuristic"
```

---

### Task 6: Photography guide

**Files:**
- Create: `lib/moon/photography.ts`
- Modify: `lib/moon/index.ts`
- Test: `tests/lib/moon/photography.test.ts`

**Interfaces:**
- Consumes: `PhotographyGuide` from `types/moon.ts`
- Produces: `buildPhotographyGuide(illuminatedPercentage, riseTime): PhotographyGuide`

- [ ] **Step 1: Write the failing test**

```ts
// tests/lib/moon/photography.test.ts
import { describe, expect, it } from 'vitest'
import { buildPhotographyGuide } from '../../../lib/moon/photography'

describe('buildPhotographyGuide', () => {
  it('flags landscape for high illumination', () => {
    const guide = buildPhotographyGuide(95, '2026-08-03T11:00:00Z')
    expect(guide.bestForLandscape).toBe(true)
    expect(guide.bestForCraters).toBe(false)
    expect(guide.recommendedFocalLengthMm).toEqual({ min: 24, max: 70 })
  })

  it('flags craters for mid illumination', () => {
    const guide = buildPhotographyGuide(50, null)
    expect(guide.bestForCraters).toBe(true)
    expect(guide.bestForLandscape).toBe(false)
    expect(guide.recommendedFocalLengthMm).toEqual({ min: 200, max: 600 })
  })

  it('flags moonrise when rise exists and illumination is sufficient', () => {
    const guide = buildPhotographyGuide(60, '2026-08-03T11:00:00Z')
    expect(guide.bestForMoonrise).toBe(true)
  })

  it('disables moonrise when rise is null', () => {
    const guide = buildPhotographyGuide(80, null)
    expect(guide.bestForMoonrise).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/lib/moon/photography.test.ts`  
Expected: FAIL

- [ ] **Step 3: Implement `lib/moon/photography.ts`**

```ts
import type { PhotographyGuide } from '../../types/moon'

export function buildPhotographyGuide(
  illuminatedPercentage: number,
  riseTime: string | null
): PhotographyGuide {
  const bestForLandscape = illuminatedPercentage >= 70
  const bestForCraters = illuminatedPercentage >= 30 && illuminatedPercentage <= 70
  const bestForMoonrise = riseTime !== null && illuminatedPercentage >= 50

  let recommendedFocalLengthMm: { min: number; max: number }
  if (bestForCraters) {
    recommendedFocalLengthMm = { min: 200, max: 600 }
  } else if (bestForMoonrise && !bestForLandscape) {
    recommendedFocalLengthMm = { min: 70, max: 200 }
  } else if (bestForLandscape) {
    recommendedFocalLengthMm = { min: 24, max: 70 }
  } else {
    recommendedFocalLengthMm = { min: 50, max: 200 }
  }

  const notes: string[] = []
  if (bestForLandscape) {
    notes.push('Độ sáng cao — phù hợp chụp phong cảnh có Mặt Trăng.')
  }
  if (bestForCraters) {
    notes.push('Terminator rõ — hợp chụp chi tiết bề mặt / hố va chạm.')
  }
  if (bestForMoonrise) {
    notes.push('Có giờ mọc — cân nhắc khung silhouette lúc Mặt Trăng lên.')
  }
  if (notes.length === 0) {
    notes.push('Điều kiện trung tính — thử tele vừa phải và theo dõi cao độ.')
  }

  return {
    bestForLandscape,
    bestForCraters,
    bestForMoonrise,
    recommendedFocalLengthMm,
    notes
  }
}
```

Re-export from index.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/lib/moon/photography.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/moon/photography.ts lib/moon/index.ts tests/lib/moon/photography.test.ts
git commit -m "feat(moon): add photography guide rules"
```

---

### Task 7: Monthly calendar builder

**Files:**
- Create: `lib/moon/calendar.ts`
- Modify: `lib/moon/index.ts`
- Test: `tests/lib/moon/calendar.test.ts`

**Interfaces:**
- Consumes: phase + position helpers; `MoonCalendarDay`, `MoonDayDetail` types; score + photography
- Produces:
  - `toDateISO(year, month, day): string` (month 1–12)
  - `buildMonthCalendar(lat, lng, year, month, now): MoonCalendarDay[]`
  - `buildMoonDayDetail(lat, lng, year, month, day, now): MoonDayDetail`
  - `buildMoonTodaySnapshot(lat, lng, when): MoonTodaySnapshot`

- [ ] **Step 1: Write the failing test**

```ts
// tests/lib/moon/calendar.test.ts
import { describe, expect, it } from 'vitest'
import {
  buildMonthCalendar,
  buildMoonDayDetail,
  buildMoonTodaySnapshot,
  toDateISO
} from '../../../lib/moon/calendar'

describe('moon calendar', () => {
  const now = new Date('2026-08-03T14:00:00Z')

  it('formats dateISO as YYYY-MM-DD', () => {
    expect(toDateISO(2026, 8, 3)).toBe('2026-08-03')
  })

  it('builds a Monday-start grid covering August 2026', () => {
    const days = buildMonthCalendar(21.0285, 105.8542, 2026, 8, now)
    expect(days.length === 35 || days.length === 42).toBe(true)
    const inMonth = days.filter(d => d.inCurrentMonth)
    expect(inMonth).toHaveLength(31)
    expect(inMonth.some(d => d.isToday)).toBe(true)
    // 2026-08-01 is Saturday → first cell should be 2026-07-27 (Monday)
    expect(days[0]!.dateISO).toBe('2026-07-27')
    expect(days[0]!.inCurrentMonth).toBe(false)
  })

  it('builds day detail with score and photography', () => {
    const detail = buildMoonDayDetail(21.0285, 105.8542, 2026, 8, 3, now)
    expect(detail.dateISO).toBe('2026-08-03')
    expect(detail.observationScore.stars).toBeGreaterThanOrEqual(1)
    expect(detail.photography.notes.length).toBeGreaterThan(0)
    expect(detail.distanceKm).toBeGreaterThan(0)
  })

  it('builds today snapshot with timestamp', () => {
    const today = buildMoonTodaySnapshot(21.0285, 105.8542, now)
    expect(today.timestamp).toBe(now.toISOString())
    expect(today.ageDays).toBeGreaterThanOrEqual(0)
    expect(today.angularDiameterDeg).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/lib/moon/calendar.test.ts`  
Expected: FAIL

- [ ] **Step 3: Implement `lib/moon/calendar.ts`**

```ts
import type {
  MoonCalendarDay,
  MoonDayDetail,
  MoonTodaySnapshot
} from '../../types/moon'
import {
  illuminatedPercentage,
  moonAgeDays,
  moonPhaseAngleDeg,
  moonPhaseIconKey,
  moonPhaseName
} from './phase'
import {
  getMoonAngularDiameterDeg,
  getMoonDistanceKm,
  getMoonHorizontal,
  getMoonRiseSet
} from './position'
import { buildPhotographyGuide } from './photography'
import { computeObservationScore } from './score'

export function toDateISO(year: number, month: number, day: number): string {
  const m = String(month).padStart(2, '0')
  const d = String(day).padStart(2, '0')
  return `${year}-${m}-${d}`
}

function localNoon(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day, 12, 0, 0, 0)
}

function parseDateISO(dateISO: string): { year: number; month: number; day: number } {
  const [y, m, d] = dateISO.split('-').map(Number)
  return { year: y!, month: m!, day: d! }
}

function sameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate()
  )
}

function buildDayCell(
  lat: number,
  lng: number,
  year: number,
  month: number,
  day: number,
  viewedYear: number,
  viewedMonth: number,
  now: Date
): MoonCalendarDay {
  const when = localNoon(year, month, day)
  const phaseAngle = moonPhaseAngleDeg(when)
  const { riseTime, setTime } = getMoonRiseSet(lat, lng, when)
  return {
    dateISO: toDateISO(year, month, day),
    phase: moonPhaseName(phaseAngle),
    iconKey: moonPhaseIconKey(phaseAngle),
    illuminatedPercentage: illuminatedPercentage(when),
    riseTime,
    setTime,
    isToday: sameLocalDay(when, now),
    inCurrentMonth: year === viewedYear && month === viewedMonth
  }
}

export function buildMonthCalendar(
  lat: number,
  lng: number,
  year: number,
  month: number,
  now: Date
): MoonCalendarDay[] {
  const first = new Date(year, month - 1, 1)
  // JS: 0=Sun … 6=Sat → Monday-start offset
  const weekday = (first.getDay() + 6) % 7
  const gridStart = new Date(year, month - 1, 1 - weekday)
  const days: MoonCalendarDay[] = []

  for (let i = 0; i < 42; i += 1) {
    const cursor = new Date(
      gridStart.getFullYear(),
      gridStart.getMonth(),
      gridStart.getDate() + i
    )
    days.push(
      buildDayCell(
        lat,
        lng,
        cursor.getFullYear(),
        cursor.getMonth() + 1,
        cursor.getDate(),
        year,
        month,
        now
      )
    )
  }

  // Trim trailing week if entirely outside month (keep 35 when possible)
  const lastWeek = days.slice(35)
  if (lastWeek.every(d => !d.inCurrentMonth)) {
    return days.slice(0, 35)
  }
  return days
}

export function buildMoonDayDetail(
  lat: number,
  lng: number,
  year: number,
  month: number,
  day: number,
  now: Date
): MoonDayDetail {
  const when = localNoon(year, month, day)
  const phaseAngle = moonPhaseAngleDeg(when)
  const { altitude, azimuth } = getMoonHorizontal(lat, lng, when)
  const { riseTime, setTime } = getMoonRiseSet(lat, lng, when)
  const illum = illuminatedPercentage(when)
  const distanceKm = getMoonDistanceKm(when)

  const cell = buildDayCell(lat, lng, year, month, day, year, month, now)

  return {
    ...cell,
    phaseAngleDeg: phaseAngle,
    ageDays: moonAgeDays(phaseAngle),
    altitude,
    azimuth,
    distanceKm,
    angularDiameterDeg: getMoonAngularDiameterDeg(distanceKm),
    observationScore: computeObservationScore(altitude, phaseAngle, illum),
    photography: buildPhotographyGuide(illum, riseTime)
  }
}

export function buildMoonDayDetailFromISO(
  lat: number,
  lng: number,
  dateISO: string,
  now: Date
): MoonDayDetail {
  const { year, month, day } = parseDateISO(dateISO)
  return buildMoonDayDetail(lat, lng, year, month, day, now)
}

export function buildMoonTodaySnapshot(
  lat: number,
  lng: number,
  when: Date
): MoonTodaySnapshot {
  const phaseAngle = moonPhaseAngleDeg(when)
  const { altitude, azimuth } = getMoonHorizontal(lat, lng, when)
  const { riseTime, setTime } = getMoonRiseSet(lat, lng, when)
  const distanceKm = getMoonDistanceKm(when)

  return {
    timestamp: when.toISOString(),
    phase: moonPhaseName(phaseAngle),
    iconKey: moonPhaseIconKey(phaseAngle),
    phaseAngleDeg: phaseAngle,
    illuminatedPercentage: illuminatedPercentage(when),
    ageDays: moonAgeDays(phaseAngle),
    riseTime,
    setTime,
    altitude,
    azimuth,
    distanceKm,
    angularDiameterDeg: getMoonAngularDiameterDeg(distanceKm)
  }
}
```

Re-export calendar helpers from `lib/moon/index.ts`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/lib/moon/calendar.test.ts`  
Expected: PASS  
Note: `isToday` depends on the runner’s local timezone vs `2026-08-03T14:00:00Z`. If flaky, assert `inMonth.find(d => d.dateISO === '2026-08-03')` exists and set `now` via local noon: `new Date(2026, 7, 3, 12, 0, 0)`. Prefer fixing the test `now` to local noon for stability.

- [ ] **Step 5: Commit**

```bash
git add lib/moon/calendar.ts lib/moon/index.ts tests/lib/moon/calendar.test.ts
git commit -m "feat(moon): build monthly calendar and day detail"
```

---

### Task 8: Upcoming quarter events

**Files:**
- Create: `lib/moon/events.ts`
- Modify: `lib/moon/index.ts`
- Test: `tests/lib/moon/events.test.ts`

**Interfaces:**
- Consumes: `SearchMoonQuarter`, `NextMoonQuarter` from astronomy-engine; `MoonQuarterEvent`
- Produces: `listUpcomingMoonQuarters(now: Date, count = 4): MoonQuarterEvent[]`

Astronomy Engine quarter index: `0=new`, `1=first-quarter`, `2=full`, `3=last-quarter`.

- [ ] **Step 1: Write the failing test**

```ts
// tests/lib/moon/events.test.ts
import { describe, expect, it } from 'vitest'
import { listUpcomingMoonQuarters } from '../../../lib/moon/events'

describe('listUpcomingMoonQuarters', () => {
  it('returns four chronological quarter events', () => {
    const events = listUpcomingMoonQuarters(new Date('2026-08-03T14:00:00Z'), 4)
    expect(events).toHaveLength(4)
    for (let i = 1; i < events.length; i += 1) {
      expect(Date.parse(events[i]!.at)).toBeGreaterThan(Date.parse(events[i - 1]!.at))
    }
    for (const event of events) {
      expect(['new', 'first-quarter', 'full', 'last-quarter']).toContain(event.type)
      expect(event.daysRemaining).toBeGreaterThanOrEqual(0)
      expect(Number.isNaN(Date.parse(event.at))).toBe(false)
    }
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/lib/moon/events.test.ts`  
Expected: FAIL

- [ ] **Step 3: Implement `lib/moon/events.ts`**

```ts
import { NextMoonQuarter, SearchMoonQuarter } from 'astronomy-engine'
import type { MoonQuarterEvent, MoonQuarterType } from '../../types/moon'

const QUARTER_TYPES: readonly MoonQuarterType[] = [
  'new',
  'first-quarter',
  'full',
  'last-quarter'
] as const

function daysRemaining(at: Date, now: Date): number {
  const ms = at.getTime() - now.getTime()
  return Math.max(0, Math.ceil(ms / 86_400_000))
}

export function listUpcomingMoonQuarters(
  now: Date,
  count = 4
): MoonQuarterEvent[] {
  const events: MoonQuarterEvent[] = []
  let cursor = SearchMoonQuarter(now)

  for (let i = 0; i < count; i += 1) {
    const at = cursor.time.date
    events.push({
      type: QUARTER_TYPES[cursor.quarter]!,
      at: at.toISOString(),
      daysRemaining: daysRemaining(at, now)
    })
    cursor = NextMoonQuarter(cursor)
  }

  return events
}
```

Re-export from index.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/lib/moon/events.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/moon/events.ts lib/moon/index.ts tests/lib/moon/events.test.ts
git commit -m "feat(moon): list upcoming moon quarter events"
```

---

### Task 9: Eclipse stub + finalize index exports

**Files:**
- Create: `lib/moon/eclipse.ts`
- Modify: `lib/moon/index.ts` (ensure all public exports)
- Test: `tests/lib/moon/eclipse.test.ts`

**Interfaces:**
- Consumes: `LunarEclipse` from `types/moon.ts`
- Produces: `listUpcomingLunarEclipses(): LunarEclipse[]` → always `[]`

- [ ] **Step 1: Write the failing test**

```ts
// tests/lib/moon/eclipse.test.ts
import { describe, expect, it } from 'vitest'
import { listUpcomingLunarEclipses } from '../../../lib/moon/eclipse'

describe('listUpcomingLunarEclipses', () => {
  it('returns an empty list in this version', () => {
    expect(listUpcomingLunarEclipses()).toEqual([])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/lib/moon/eclipse.test.ts`  
Expected: FAIL

- [ ] **Step 3: Implement stub + polish `index.ts`**

```ts
// lib/moon/eclipse.ts
import type { LunarEclipse } from '../../types/moon'

/** Architecture stub — no Astronomy Engine eclipse search yet. */
export function listUpcomingLunarEclipses(): LunarEclipse[] {
  return []
}
```

Ensure `lib/moon/index.ts` exports everything later tasks need:

```ts
export {
  SYNODIC_MONTH_DAYS,
  illuminatedPercentage,
  moonAgeDays,
  moonPhaseAngleDeg,
  moonPhaseIconKey,
  moonPhaseName,
  normalizePhaseAngle
} from './phase'
export {
  AU_KM,
  MOON_RADIUS_KM,
  getMoonAngularDiameterDeg,
  getMoonDistanceKm,
  getMoonHorizontal,
  getMoonRiseSet
} from './position'
export { getMoonInfo } from './snapshot'
export { computeObservationScore } from './score'
export { buildPhotographyGuide } from './photography'
export {
  buildMonthCalendar,
  buildMoonDayDetail,
  buildMoonDayDetailFromISO,
  buildMoonTodaySnapshot,
  toDateISO
} from './calendar'
export { listUpcomingMoonQuarters } from './events'
export { listUpcomingLunarEclipses } from './eclipse'
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run tests/lib/moon`  
Expected: all PASS

- [ ] **Step 5: Commit**

```bash
git add lib/moon/eclipse.ts lib/moon/index.ts tests/lib/moon/eclipse.test.ts
git commit -m "feat(moon): add lunar eclipse architecture stub"
```

---

### Task 10: `useMoonCalendar` composable

**Files:**
- Create: `app/composables/useMoonCalendar.ts`
- Test: `tests/composables/useMoonCalendar.test.ts`

**Interfaces:**
- Consumes: all calendar/events/score builders from `lib/moon`
- Produces composable API:

```ts
useMoonCalendar(coordinates: Ref<Coordinates | null>, when?: Date | (() => Date)) => {
  viewedYear, viewedMonth, selectedDateISO, error,
  today, monthDays, selectedDetail, upcomingEvents,
  todayScore, todayPhotography,
  goToPrevMonth, goToNextMonth, selectDay, clearSelectedDay, refresh
}
```

- [ ] **Step 1: Write the failing test**

```ts
// tests/composables/useMoonCalendar.test.ts
import { describe, expect, it, vi, afterEach } from 'vitest'
import { ref } from 'vue'
import type { Coordinates } from '../../types/location'
import { useMoonCalendar } from '../../app/composables/useMoonCalendar'
import * as calendar from '../../lib/moon/calendar'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useMoonCalendar', () => {
  const fixed = new Date(2026, 7, 3, 12, 0, 0)

  it('builds today, month days, and upcoming events for coordinates', () => {
    const coordinates = ref<Coordinates | null>({ lat: 21.0285, lng: 105.8542 })
    const api = useMoonCalendar(coordinates, fixed)

    expect(api.error.value).toBeNull()
    expect(api.today.value).not.toBeNull()
    expect(api.monthDays.value.length).toBeGreaterThanOrEqual(35)
    expect(api.upcomingEvents.value).toHaveLength(4)
    expect(api.todayScore.value?.stars).toBeGreaterThanOrEqual(1)
    expect(api.todayPhotography.value).not.toBeNull()
  })

  it('navigates months and selects an in-month day', () => {
    const coordinates = ref<Coordinates | null>({ lat: 21.0285, lng: 105.8542 })
    const api = useMoonCalendar(coordinates, fixed)

    expect(api.viewedMonth.value).toBe(8)
    api.goToNextMonth()
    expect(api.viewedMonth.value).toBe(9)
    api.goToPrevMonth()
    expect(api.viewedMonth.value).toBe(8)

    api.selectDay('2026-08-03')
    expect(api.selectedDateISO.value).toBe('2026-08-03')
    expect(api.selectedDetail.value?.dateISO).toBe('2026-08-03')

    api.selectDay('2026-07-27') // padding day — ignored
    expect(api.selectedDateISO.value).toBe('2026-08-03')

    api.clearSelectedDay()
    expect(api.selectedDetail.value).toBeNull()
  })

  it('clears derived state when coordinates become null', () => {
    const coordinates = ref<Coordinates | null>({ lat: 21.0285, lng: 105.8542 })
    const api = useMoonCalendar(coordinates, fixed)
    coordinates.value = null
    expect(api.today.value).toBeNull()
    expect(api.monthDays.value).toEqual([])
    expect(api.upcomingEvents.value).toEqual([])
  })

  it('surfaces calculation errors', () => {
    const coordinates = ref<Coordinates | null>({ lat: 21.0285, lng: 105.8542 })
    vi.spyOn(calendar, 'buildMoonTodaySnapshot').mockImplementationOnce(() => {
      throw new Error('boom moon')
    })
    const api = useMoonCalendar(coordinates, fixed)
    expect(api.error.value).toBe('boom moon')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/composables/useMoonCalendar.test.ts`  
Expected: FAIL

- [ ] **Step 3: Implement `app/composables/useMoonCalendar.ts`**

Mirror `useTelescope` patterns (`resolveWhenSource`, `refreshToken`, watch coords, try/catch):

```ts
import { computed, ref, watch, type Ref } from 'vue'
import type { Coordinates } from '../../types/location'
import type {
  MoonCalendarDay,
  MoonDayDetail,
  MoonQuarterEvent,
  MoonTodaySnapshot,
  ObservationScore,
  PhotographyGuide
} from '../../types/moon'
import {
  buildMonthCalendar,
  buildMoonDayDetailFromISO,
  buildMoonTodaySnapshot
} from '../../lib/moon/calendar'
import { listUpcomingMoonQuarters } from '../../lib/moon/events'
import { buildPhotographyGuide } from '../../lib/moon/photography'
import { computeObservationScore } from '../../lib/moon/score'

const CALC_ERROR = 'Không thể tính lịch Mặt Trăng. Hãy thử làm mới.'

function resolveWhenSource(when?: Date | (() => Date)): () => Date {
  if (typeof when === 'function') return when
  if (when instanceof Date) return () => when
  return () => new Date()
}

function toErrorMessage(caught: unknown): string {
  if (caught instanceof Error && caught.message.trim().length > 0) {
    return caught.message
  }
  return CALC_ERROR
}

export function useMoonCalendar(
  coordinates: Ref<Coordinates | null>,
  when?: Date | (() => Date)
) {
  const whenSource = resolveWhenSource(when)
  const refreshToken = ref(0)
  const error = ref<string | null>(null)

  const initial = whenSource()
  const viewedYear = ref(initial.getFullYear())
  const viewedMonth = ref(initial.getMonth() + 1)
  const selectedDateISO = ref<string | null>(null)

  const today = ref<MoonTodaySnapshot | null>(null)
  const monthDays = ref<MoonCalendarDay[]>([])
  const selectedDetail = ref<MoonDayDetail | null>(null)
  const upcomingEvents = ref<MoonQuarterEvent[]>([])
  const todayScore = ref<ObservationScore | null>(null)
  const todayPhotography = ref<PhotographyGuide | null>(null)

  function currentWhen(): Date {
    void refreshToken.value
    return whenSource()
  }

  function recompute() {
    const coords = coordinates.value
    if (!coords) {
      today.value = null
      monthDays.value = []
      selectedDetail.value = null
      upcomingEvents.value = []
      todayScore.value = null
      todayPhotography.value = null
      selectedDateISO.value = null
      error.value = null
      return
    }

    try {
      const now = currentWhen()
      const snapshot = buildMoonTodaySnapshot(coords.lat, coords.lng, now)
      today.value = snapshot
      todayScore.value = computeObservationScore(
        snapshot.altitude,
        snapshot.phaseAngleDeg,
        snapshot.illuminatedPercentage
      )
      todayPhotography.value = buildPhotographyGuide(
        snapshot.illuminatedPercentage,
        snapshot.riseTime
      )
      monthDays.value = buildMonthCalendar(
        coords.lat,
        coords.lng,
        viewedYear.value,
        viewedMonth.value,
        now
      )
      upcomingEvents.value = listUpcomingMoonQuarters(now, 4)

      if (selectedDateISO.value) {
        const cell = monthDays.value.find(d => d.dateISO === selectedDateISO.value)
        if (!cell || !cell.inCurrentMonth) {
          selectedDateISO.value = null
          selectedDetail.value = null
        } else {
          selectedDetail.value = buildMoonDayDetailFromISO(
            coords.lat,
            coords.lng,
            selectedDateISO.value,
            now
          )
        }
      } else {
        selectedDetail.value = null
      }

      error.value = null
    } catch (caught) {
      error.value = toErrorMessage(caught)
    }
  }

  function goToPrevMonth() {
    if (viewedMonth.value === 1) {
      viewedMonth.value = 12
      viewedYear.value -= 1
    } else {
      viewedMonth.value -= 1
    }
    selectedDateISO.value = null
    recompute()
  }

  function goToNextMonth() {
    if (viewedMonth.value === 12) {
      viewedMonth.value = 1
      viewedYear.value += 1
    } else {
      viewedMonth.value += 1
    }
    selectedDateISO.value = null
    recompute()
  }

  function selectDay(dateISO: string) {
    const cell = monthDays.value.find(d => d.dateISO === dateISO)
    if (!cell || !cell.inCurrentMonth) return
    selectedDateISO.value = dateISO
    recompute()
  }

  function clearSelectedDay() {
    selectedDateISO.value = null
    selectedDetail.value = null
  }

  function refresh() {
    refreshToken.value += 1
    recompute()
  }

  watch(coordinates, () => recompute(), { immediate: true })

  return {
    viewedYear,
    viewedMonth,
    selectedDateISO,
    error,
    today,
    monthDays,
    selectedDetail,
    upcomingEvents,
    todayScore,
    todayPhotography,
    goToPrevMonth,
    goToNextMonth,
    selectDay,
    clearSelectedDay,
    refresh
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/composables/useMoonCalendar.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/composables/useMoonCalendar.ts tests/composables/useMoonCalendar.test.ts
git commit -m "feat(moon): add useMoonCalendar composable"
```

---

### Task 11: Moon UI components (today, score, photography, illustration)

**Files:**
- Create: `app/components/moon/MoonPhaseIllustration.vue`
- Create: `app/components/moon/MoonTodayCard.vue`
- Create: `app/components/moon/MoonObservationScore.vue`
- Create: `app/components/moon/MoonPhotographyGuide.vue`
- Test: manual / typecheck later (presentation)

**Interfaces:**
- Consumes: `MoonTodaySnapshot`, `ObservationScore`, `PhotographyGuide`
- Produces: presentational components only

- [ ] **Step 1: Implement `MoonPhaseIllustration.vue`**

SVG circle with illuminated crescent via CSS/`clipPath` or overlapping circles driven by `phaseAngleDeg` (0=new … 180=full). Keep it simple: dark disk + light hemisphere rotated by phase. Props: `phaseAngleDeg: number`, `iconKey?: string`.

Minimal acceptable approach: full disk; white overlay width based on illumination; label `aria-label` = phase name passed as prop `label`.

```vue
<script setup lang="ts">
const props = defineProps<{
  phaseAngleDeg: number
  label: string
  illuminatedPercentage: number
}>()

const shadeOffset = computed(() => {
  // -50..50% horizontal shadow shift heuristic from phase angle
  const n = ((props.phaseAngleDeg % 360) + 360) % 360
  return ((n / 180) - 1) * 50
})
</script>

<template>
  <div
    class="relative mx-auto h-40 w-40 overflow-hidden rounded-full bg-slate-900 ring-1 ring-slate-600"
    role="img"
    :aria-label="label"
  >
    <div class="absolute inset-0 rounded-full bg-amber-100" />
    <div
      class="absolute inset-0 rounded-full bg-slate-950/90"
      :style="{ transform: `translateX(${shadeOffset}%)` }"
    />
  </div>
</template>
```

Refine visually if needed, but keep logic out of astronomy-engine.

- [ ] **Step 2: Implement `MoonTodayCard.vue`**

Props: `today: MoonTodaySnapshot`. Use `SkyCard` + `SectionTitle` “Mặt Trăng hôm nay”. Grid fields: phase, illumination, age, rise, set, altitude, azimuth, distance km, angular diameter. Embed `MoonPhaseIllustration`. Format null times as `—`.

- [ ] **Step 3: Implement `MoonObservationScore.vue`**

Props: `score: ObservationScore`. Show `★` repeated `stars` times (filled) + empty to 5, label, reasons list.

- [ ] **Step 4: Implement `MoonPhotographyGuide.vue`**

Props: `guide: PhotographyGuide`. Show three boolean rows (landscape / crater / moonrise), focal length range, notes.

- [ ] **Step 5: Commit**

```bash
git add app/components/moon/MoonPhaseIllustration.vue app/components/moon/MoonTodayCard.vue app/components/moon/MoonObservationScore.vue app/components/moon/MoonPhotographyGuide.vue
git commit -m "feat(moon): add today, score, and photography UI cards"
```

---

### Task 12: Calendar grid, day detail panel, upcoming events UI

**Files:**
- Create: `app/components/moon/MoonMonthCalendar.vue`
- Create: `app/components/moon/MoonDayDetailPanel.vue`
- Create: `app/components/moon/MoonUpcomingEvents.vue`

**Interfaces:**
- Consumes: `MoonCalendarDay`, `MoonDayDetail`, `MoonQuarterEvent`
- Produces: emit `select` / `prev` / `next` / `clear` as needed

- [ ] **Step 1: Implement `MoonMonthCalendar.vue`**

Props: `year`, `month`, `days: MoonCalendarDay[]`, `selectedDateISO: string | null`.  
Emit: `prev`, `next`, `select(dateISO: string)`.  
Header with month/year (Vietnamese `Intl` ok) + prev/next buttons.  
Grid `grid-cols-7`; weekday headers `T2…CN`.  
Each cell: date number, small phase glyph (unicode 🌑… or CSS dot), illumination `%`, rise/set short times.  
Disable / mute styling when `!inCurrentMonth`; only emit select when `inCurrentMonth`.  
Highlight `isToday` and selected.

- [ ] **Step 2: Implement `MoonDayDetailPanel.vue`**

Props: `detail: MoonDayDetail`. Show metrics + nested score/photography summaries (or reuse score/photo components with mapped props). Emit `close` for clear selection.

- [ ] **Step 3: Implement `MoonUpcomingEvents.vue`**

Props: `events: MoonQuarterEvent[]`. Map type → Vietnamese label (`New Moon` → “Trăng mới”, etc.) while keeping English type available. Show date/time via `Intl`, `daysRemaining` as “còn X ngày”.

- [ ] **Step 4: Commit**

```bash
git add app/components/moon/MoonMonthCalendar.vue app/components/moon/MoonDayDetailPanel.vue app/components/moon/MoonUpcomingEvents.vue
git commit -m "feat(moon): add calendar grid, day panel, and events UI"
```

---

### Task 13: Page `/moon-calendar` + home entry link

**Files:**
- Create: `app/pages/moon-calendar.vue`
- Modify: `app/pages/index.vue`

**Interfaces:**
- Consumes: `useGeolocationInput`, `useMoonCalendar`, moon components
- Produces: routed page + home `NuxtLink`

- [ ] **Step 1: Create `app/pages/moon-calendar.vue`**

Copy location bootstrap pattern from `app/pages/telescope.vue` / `iss.vue` (query lat/lng → GPS → manual; `LoadingLocation`, `PermissionDenied`, `CurrentLocation`).

Wire:

```ts
const {
  viewedYear,
  viewedMonth,
  selectedDateISO,
  error,
  today,
  monthDays,
  selectedDetail,
  upcomingEvents,
  todayScore,
  todayPhotography,
  goToPrevMonth,
  goToNextMonth,
  selectDay,
  clearSelectedDay,
  refresh
} = useMoonCalendar(coordinates)
```

Section order after coords:

1. Header “Moon Calendar” / “Lịch Mặt Trăng” + home link  
2. Location  
3. `MoonTodayCard`  
4. `MoonObservationScore`  
5. `MoonPhotographyGuide`  
6. `MoonMonthCalendar` + conditional `MoonDayDetailPanel`  
7. `MoonUpcomingEvents`  
8. Show `error` banner if present; refresh button optional  

`useHead({ title: 'Moon Calendar · What\'s Above Me?' })`

- [ ] **Step 2: Add home link in `app/pages/index.vue`**

Add `moonCalendarLink` computed like `issLink`:

```ts
const moonCalendarLink = computed(() => {
  if (!coordinates.value) return null
  return {
    path: '/moon-calendar',
    query: {
      lat: String(coordinates.value.lat),
      lng: String(coordinates.value.lng)
    }
  }
})
```

Add `NuxtLink` next to ISS/Telescope: label **Moon Calendar** or **Lịch Mặt Trăng**.

- [ ] **Step 3: Smoke typecheck**

Run: `npm run typecheck`  
Expected: no errors related to moon calendar files

- [ ] **Step 4: Commit**

```bash
git add app/pages/moon-calendar.vue app/pages/index.vue
git commit -m "feat(moon): add moon-calendar page and home entry link"
```

---

### Task 14: Final verification

**Files:**
- None new (fix only if failures)

- [ ] **Step 1: Run full unit suite**

Run: `npm test`  
Expected: PASS

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`  
Expected: PASS

- [ ] **Step 3: Manual checklist (dev server)**

Run: `npm run dev`  
Verify:

- `/moon-calendar` loads with GPS or `?lat=21.0285&lng=105.8542`
- Today metrics + illustration render
- Score + photography render
- Month prev/next works; selecting a day opens panel below grid
- Upcoming events show four quarters
- Home link appears when location known
- `/api/moon` still works (hit existing moon endpoint or sky page MoonCard)

- [ ] **Step 4: Final commit only if fixes were needed**

```bash
git add -A
git commit -m "fix(moon): address verification findings"
```

---

## Spec coverage checklist (self-review)

| Spec requirement | Task |
|------------------|------|
| Today’s Moon metrics + illustration | 3, 7, 11, 13 |
| Monthly calendar prev/next + day fields | 7, 12, 13 |
| Day detail panel below calendar | 10, 12, 13 |
| Upcoming quarters date/time/daysRemaining | 8, 12, 13 |
| Observation score heuristic | 5, 11, 13 |
| Photography guide | 6, 11, 13 |
| Eclipse types + stub only | 1, 9 |
| Future hooks types | 1 |
| Refactor `lib/moon.ts` → `lib/moon/` | 4 |
| Preserve `/api/moon` | 4, 14 |
| Client-side, no new API | all |
| Home entry link | 13 |
| Unit tests | 2–10, 14 |
| No business logic in Vue | 11–13 |

## Placeholder / consistency notes

- Quarter index mapping locked: `0 new / 1 first / 2 full / 3 last`.
- Score label table locked in Task 5.
- Calendar Monday-start + August 2026 fixture locked in Task 7.
- `buildMoonDayDetailFromISO` exists for composable select path.
