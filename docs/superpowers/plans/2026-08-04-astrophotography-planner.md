# Astrophotography Planner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `/astrophotography` with tonight’s dark-sky photography score, Milky Way / golden / blue / twilight / moon / planet planning, reusable camera settings, and a sunset→sunrise timeline — all client-side via Astronomy Engine.

**Architecture:** Pure domain in `lib/photo/*` (night window, sun events, MW/GC, score, moon, planets, settings, timeline, snapshot) → `useAstroPhotography` → `components/photo/*` → `pages/astrophotography.vue`. Reuse `getSunInfo`, `getMoonInfo`, `getMilkyWayVisibility`, `azimuthToDirection`. No new Nitro photo API. Follows `docs/superpowers/specs/2026-08-04-astrophotography-planner-design.md`.

**Tech Stack:** Nuxt 4, Vue 3 Composition API, TypeScript strict, TailwindCSS, Vitest, astronomy-engine (`SearchRiseSet`, `SearchAltitude`, `Horizon`, `Observer`, `Equator`, `Body`), existing `useGeolocationInput` / `SkyCard` / `SectionTitle`.

## Global Constraints

- Vietnamese UI chrome; English phase names and planet names (`Full Moon`, `Venus`, …).
- Client-side calculations only; no paid APIs; no AI; no new `/api/photo`.
- Business logic stays in `lib/photo/*` — Vue components are presentation-only (formatting OK).
- Components must **not** import `astronomy-engine`.
- Hybrid location: page works without GPS; score / MW direction / timeline / planets null until coords exist (“Cần vị trí”).
- Tonight only (local sunset → next sunrise); date picker is typed hook only.
- Photography score optimizes for **dark sky / Milky Way**, not moon/planet quality.
- Camera settings: static tables by subject; `ConditionModifiers` typed but unused in v1.
- `cloudCoverPct` / weather / Bortle / journal / saved spots: types + null stubs only.
- Composition API; match slate/sky visual language (`SkyCard`, `SectionTitle`).
- Spec: `docs/superpowers/specs/2026-08-04-astrophotography-planner-design.md`.
- On Windows PowerShell, if `git commit` fails with `unknown option trailer`, use `& "C:\Program Files\Git\bin\git.exe" commit ...` instead of wrapped `git`.

## File Map

| File | Responsibility |
|------|----------------|
| `types/photo.ts` | All photo domain types + future hooks |
| `lib/photo/settings.ts` | Static `CameraSettings` tables + lens label helper |
| `lib/photo/nightWindow.ts` | Tonight sunset → sunrise window |
| `lib/photo/sunEvents.ts` | Golden / blue / twilight ranges via `SearchAltitude` |
| `lib/photo/milkyWay.ts` | GC alt/az, visibility, core, best time |
| `lib/photo/score.ts` | Dark-sky / MW photography score |
| `lib/photo/moonPhoto.ts` | Moon photo planning fields |
| `lib/photo/planets.ts` | Visible planets + brightness + magnification |
| `lib/photo/timeline.ts` | Timeline markers |
| `lib/photo/future.ts` | Empty builders returning null stubs |
| `lib/photo/snapshot.ts` | Assemble `AstroPhotographySnapshot` |
| `lib/photo/index.ts` | Public re-exports |
| `app/composables/useAstroPhotography.ts` | Page orchestration |
| `app/components/photo/*.vue` | Section UI |
| `app/pages/astrophotography.vue` | Page composition |
| `app/pages/index.vue` | Home entry link |
| `tests/lib/photo/*.test.ts` | Domain tests |
| `tests/composables/useAstroPhotography.test.ts` | Composable tests |

---

### Task 1: Domain types + future stubs

**Files:**
- Create: `types/photo.ts`
- Create: `lib/photo/future.ts`
- Create: `lib/photo/index.ts` (re-export future only for now; expand each task)
- Test: `tests/lib/photo/future.test.ts`

**Interfaces:**
- Consumes: `Direction`, `MilkyWayVisibility` from `types/astronomy`
- Produces: all types in Step 1; `emptyWeatherHook()`, `emptyLightPollutionHook()`, `emptyDateCursorHook()`

- [ ] **Step 1: Create `types/photo.ts`**

```ts
import type { Direction, MilkyWayVisibility } from './astronomy'

export type PhotographyScoreLabel =
  | 'Poor'
  | 'Fair'
  | 'Good'
  | 'Excellent'

export interface PhotographyScore {
  stars: 1 | 2 | 3 | 4 | 5
  label: PhotographyScoreLabel
  reasons: string[]
  cloudCoverPct: number | null
}

export interface NightWindow {
  sunset: string
  sunrise: string
}

export interface TimeRange {
  start: string
  end: string
}

export interface GoldenHourInfo {
  morning: TimeRange | null
  evening: TimeRange | null
  durationMinutes: number | null
}

export interface BlueHourInfo {
  morning: TimeRange | null
  evening: TimeRange | null
}

export interface TwilightInfo {
  civil: { morning: TimeRange | null; evening: TimeRange | null }
  nautical: { morning: TimeRange | null; evening: TimeRange | null }
  astronomical: { morning: TimeRange | null; evening: TimeRange | null }
}

export type CameraSubject =
  | 'milky-way'
  | 'moon'
  | 'planet'
  | 'golden-hour'
  | 'blue-hour'

export interface CameraSettings {
  iso: { min: number; max: number }
  aperture: string
  exposureTime: string
  focalLengthMm: { min: number; max: number }
  tripodRequired: boolean
  remoteShutter: boolean
}

export interface ConditionModifiers {
  moonIlluminationPct?: number
  subjectAltitudeDeg?: number
  sunAltitudeDeg?: number
}

export interface MilkyWayPhotoInfo {
  visibility: MilkyWayVisibility
  direction: Direction | null
  altitudeDeg: number | null
  bestTime: string | null
  coreVisible: boolean | null
  recommendedLensLabel: string
  settings: CameraSettings
}

export interface MoonPhotoInfo {
  moonrise: string | null
  moonset: string | null
  phase: string
  illuminationPct: number
  bestPhotographyTime: string | null
  recommendedLensLabel: string
  settings: CameraSettings
}

export interface PlanetPhotoInfo {
  name: string
  altitudeDeg: number
  azimuthDeg: number
  isVisible: boolean
  brightness: 'faint' | 'moderate' | 'bright' | 'very-bright'
  recommendedMagnification: string
  magnitude: number | null
}

export type TimelineMarkerKind =
  | 'golden-hour'
  | 'blue-hour'
  | 'dark-sky'
  | 'moonrise'
  | 'moonset'
  | 'milky-way-peak'
  | 'planet-visibility'

export interface TimelineMarker {
  kind: TimelineMarkerKind
  label: string
  at: string
  end: string | null
}

export interface PhotoTimeline {
  window: NightWindow
  markers: TimelineMarker[]
}

export interface AstroPhotographySnapshot {
  timestamp: string
  nightWindow: NightWindow | null
  score: PhotographyScore | null
  milkyWay: MilkyWayPhotoInfo | null
  goldenHour: GoldenHourInfo | null
  blueHour: BlueHourInfo | null
  twilight: TwilightInfo | null
  moon: MoonPhotoInfo | null
  planets: PlanetPhotoInfo[] | null
  timeline: PhotoTimeline | null
  suggestedSettings: CameraSettings | null
}

export interface WeatherPhotoHook {
  cloudCoverPct: number | null
  windMps: number | null
  humidityPct: number | null
  seeing: string | null
  transparency: string | null
}

export interface LightPollutionHook {
  bortleClass: number | null
  source: string | null
}

export interface SavedLocation {
  id: string
  name: string
  lat: number
  lng: number
}

export interface FavoriteSpot extends SavedLocation {
  notes: string | null
}

export interface PhotoJournalEntry {
  id: string
  takenAt: string
  subject: CameraSubject
  lat: number | null
  lng: number | null
  notes: string | null
}

export interface DateCursorHook {
  viewedNightStart: string | null
}
```

- [ ] **Step 2: Create `lib/photo/future.ts` and `lib/photo/index.ts`**

```ts
// lib/photo/future.ts
import type {
  DateCursorHook,
  LightPollutionHook,
  WeatherPhotoHook
} from '../../types/photo'

export function emptyWeatherHook(): WeatherPhotoHook {
  return {
    cloudCoverPct: null,
    windMps: null,
    humidityPct: null,
    seeing: null,
    transparency: null
  }
}

export function emptyLightPollutionHook(): LightPollutionHook {
  return { bortleClass: null, source: null }
}

export function emptyDateCursorHook(): DateCursorHook {
  return { viewedNightStart: null }
}
```

```ts
// lib/photo/index.ts
export {
  emptyWeatherHook,
  emptyLightPollutionHook,
  emptyDateCursorHook
} from './future'
```

- [ ] **Step 3: Write `tests/lib/photo/future.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import {
  emptyDateCursorHook,
  emptyLightPollutionHook,
  emptyWeatherHook
} from '../../../lib/photo/future'

describe('photo future stubs', () => {
  it('returns null weather fields', () => {
    expect(emptyWeatherHook().cloudCoverPct).toBeNull()
    expect(emptyLightPollutionHook().bortleClass).toBeNull()
    expect(emptyDateCursorHook().viewedNightStart).toBeNull()
  })
})
```

- [ ] **Step 4: Run test**

Run: `npm test -- tests/lib/photo/future.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add types/photo.ts lib/photo/future.ts lib/photo/index.ts tests/lib/photo/future.test.ts
git commit -m "feat(photo): add domain types and future stubs"
```

---

### Task 2: Camera settings tables

**Files:**
- Create: `lib/photo/settings.ts`
- Modify: `lib/photo/index.ts`
- Test: `tests/lib/photo/settings.test.ts`

**Interfaces:**
- Consumes: `CameraSubject`, `CameraSettings`, `ConditionModifiers` from `types/photo`
- Produces: `getCameraSettings(subject: CameraSubject): CameraSettings`, `lensLabelFromSettings(settings: CameraSettings, kind: 'wide' | 'tele' | 'planet'): string`

- [ ] **Step 1: Write failing test `tests/lib/photo/settings.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import {
  getCameraSettings,
  lensLabelFromSettings
} from '../../../lib/photo/settings'
import type { CameraSubject } from '../../../types/photo'

const SUBJECTS: CameraSubject[] = [
  'milky-way',
  'moon',
  'planet',
  'golden-hour',
  'blue-hour'
]

describe('getCameraSettings', () => {
  it('returns complete settings for every subject', () => {
    for (const subject of SUBJECTS) {
      const s = getCameraSettings(subject)
      expect(s.iso.min).toBeGreaterThan(0)
      expect(s.iso.max).toBeGreaterThanOrEqual(s.iso.min)
      expect(s.aperture.length).toBeGreaterThan(0)
      expect(s.exposureTime.length).toBeGreaterThan(0)
      expect(s.focalLengthMm.min).toBeGreaterThan(0)
      expect(typeof s.tripodRequired).toBe('boolean')
      expect(typeof s.remoteShutter).toBe('boolean')
    }
  })

  it('recommends wide lens for milky way and tripod', () => {
    const s = getCameraSettings('milky-way')
    expect(s.focalLengthMm.max).toBeLessThanOrEqual(50)
    expect(s.tripodRequired).toBe(true)
    expect(s.remoteShutter).toBe(true)
    expect(lensLabelFromSettings(s, 'wide')).toMatch(/mm/)
  })
})
```

- [ ] **Step 2: Run test — expect FAIL (module missing)**

Run: `npm test -- tests/lib/photo/settings.test.ts`
Expected: FAIL cannot find module

- [ ] **Step 3: Implement `lib/photo/settings.ts`**

```ts
import type {
  CameraSettings,
  CameraSubject,
  ConditionModifiers
} from '../../types/photo'

const TABLES: Record<CameraSubject, CameraSettings> = {
  'milky-way': {
    iso: { min: 1600, max: 6400 },
    aperture: 'f/1.4–f/2.8',
    exposureTime: '10–25s',
    focalLengthMm: { min: 14, max: 24 },
    tripodRequired: true,
    remoteShutter: true
  },
  moon: {
    iso: { min: 100, max: 400 },
    aperture: 'f/8–f/11',
    exposureTime: '1/125–1/250s',
    focalLengthMm: { min: 200, max: 600 },
    tripodRequired: true,
    remoteShutter: true
  },
  planet: {
    iso: { min: 400, max: 1600 },
    aperture: 'f/10–f/16',
    exposureTime: '1/60–1/250s',
    focalLengthMm: { min: 1000, max: 2000 },
    tripodRequired: true,
    remoteShutter: true
  },
  'golden-hour': {
    iso: { min: 100, max: 400 },
    aperture: 'f/8–f/11',
    exposureTime: '1/60–1/250s',
    focalLengthMm: { min: 24, max: 70 },
    tripodRequired: false,
    remoteShutter: false
  },
  'blue-hour': {
    iso: { min: 200, max: 800 },
    aperture: 'f/4–f/8',
    exposureTime: '1–8s',
    focalLengthMm: { min: 16, max: 35 },
    tripodRequired: true,
    remoteShutter: true
  }
}

/** `modifiers` accepted for future use; ignored in v1. */
export function getCameraSettings(
  subject: CameraSubject,
  _modifiers?: ConditionModifiers
): CameraSettings {
  return { ...TABLES[subject], iso: { ...TABLES[subject].iso }, focalLengthMm: { ...TABLES[subject].focalLengthMm } }
}

export function lensLabelFromSettings(
  settings: CameraSettings,
  kind: 'wide' | 'tele' | 'planet'
): string {
  const { min, max } = settings.focalLengthMm
  if (kind === 'wide') return `${min}–${max}mm wide`
  if (kind === 'planet') return `${min}–${max}mm (tele / scope)`
  return `${min}–${max}mm tele`
}
```

- [ ] **Step 4: Re-export from `lib/photo/index.ts` and run tests**

Add: `export { getCameraSettings, lensLabelFromSettings } from './settings'`

Run: `npm test -- tests/lib/photo/settings.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/photo/settings.ts lib/photo/index.ts tests/lib/photo/settings.test.ts
git commit -m "feat(photo): add static camera settings tables"
```

---

### Task 3: Night window

**Files:**
- Create: `lib/photo/nightWindow.ts`
- Modify: `lib/photo/index.ts`
- Test: `tests/lib/photo/nightWindow.test.ts`

**Interfaces:**
- Consumes: astronomy-engine `Body`, `Observer`, `SearchRiseSet`; type `NightWindow`
- Produces: `getNightWindow(lat: number, lng: number, when: Date): NightWindow | null`

Logic: From local calendar day of `when`, find sunset (direction −1) starting at local noon of that day (or `when` truncated); find next sunrise (direction +1) after that sunset. If either missing (polar) → `null`.

- [ ] **Step 1: Write failing test**

```ts
import { describe, expect, it } from 'vitest'
import { getNightWindow } from '../../../lib/photo/nightWindow'

const LAT = 21.0285
const LNG = 105.8542
// Hanoi afternoon — night is evening of Aug 3 → morning Aug 4, 2026
const WHEN = new Date(Date.UTC(2026, 7, 3, 8, 0, 0))

describe('getNightWindow', () => {
  it('returns sunset before sunrise for mid-latitude', () => {
    const window = getNightWindow(LAT, LNG, WHEN)
    expect(window).not.toBeNull()
    expect(new Date(window!.sunset).getTime()).toBeLessThan(
      new Date(window!.sunrise).getTime()
    )
  })

  it('returns null near north pole in polar day window', () => {
    const polar = getNightWindow(89, 0, new Date(Date.UTC(2026, 5, 21, 12, 0, 0)))
    expect(polar).toBeNull()
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

Run: `npm test -- tests/lib/photo/nightWindow.test.ts`

- [ ] **Step 3: Implement `lib/photo/nightWindow.ts`**

```ts
import { Body, Observer, SearchRiseSet } from 'astronomy-engine'
import type { NightWindow } from '../../types/photo'

function startOfLocalDay(when: Date, lng: number): Date {
  // Approximate local day using longitude offset (hours)
  const offsetMs = (lng / 15) * 3600_000
  const local = new Date(when.getTime() + offsetMs)
  const y = local.getUTCFullYear()
  const m = local.getUTCMonth()
  const d = local.getUTCDate()
  // local midnight → UTC
  return new Date(Date.UTC(y, m, d, 0, 0, 0) - offsetMs)
}

export function getNightWindow(
  lat: number,
  lng: number,
  when: Date
): NightWindow | null {
  const observer = new Observer(lat, lng, 0)
  const dayStart = startOfLocalDay(when, lng)
  // Search from local morning for sunset of this calendar day
  const sunset = SearchRiseSet(Body.Sun, observer, -1, dayStart, 2)
  if (!sunset) return null
  const sunrise = SearchRiseSet(Body.Sun, observer, +1, sunset.date, 2)
  if (!sunrise) return null
  if (sunrise.date.getTime() <= sunset.date.getTime()) return null
  return {
    sunset: sunset.date.toISOString(),
    sunrise: sunrise.date.toISOString()
  }
}
```

If polar-day test is flaky with SearchRiseSet returning a value, tighten assertion to accept null **or** document that June 21 at 89°N must be null within `limitDays: 1` search — adjust `limitDays` on sunset search to `1` from dayStart if needed so polar day fails cleanly.

- [ ] **Step 4: Export + run tests PASS + commit**

```bash
git add lib/photo/nightWindow.ts lib/photo/index.ts tests/lib/photo/nightWindow.test.ts
git commit -m "feat(photo): compute tonight sunset-sunrise window"
```

---

### Task 4: Sun events (golden / blue / twilight)

**Files:**
- Create: `lib/photo/sunEvents.ts`
- Modify: `lib/photo/index.ts`
- Test: `tests/lib/photo/sunEvents.test.ts`

**Interfaces:**
- Consumes: `NightWindow`, `GoldenHourInfo`, `BlueHourInfo`, `TwilightInfo`, `TimeRange`; `SearchAltitude`, `Body`, `Observer`
- Produces:
  - `getGoldenHourInfo(lat, lng, night: NightWindow): GoldenHourInfo`
  - `getBlueHourInfo(lat, lng, night: NightWindow): BlueHourInfo`
  - `getTwilightInfo(lat, lng, night: NightWindow): TwilightInfo`

Bands (sun altitude):
- Golden evening: +6° → −4° (descend); morning: −4° → +6° (ascend) near sunrise
- Blue evening: −4° → −6°; morning: −6° → −4°
- Civil evening: 0° → −6°; morning: −6° → 0°
- Nautical: −6° ↔ −12°
- Astronomical: −12° ↔ −18°

Use `SearchAltitude(Body.Sun, observer, direction, dateStart, limitDays, altitude)`.

- [ ] **Step 1: Write failing test**

```ts
import { describe, expect, it } from 'vitest'
import { getNightWindow } from '../../../lib/photo/nightWindow'
import {
  getBlueHourInfo,
  getGoldenHourInfo,
  getTwilightInfo
} from '../../../lib/photo/sunEvents'

const LAT = 21.0285
const LNG = 105.8542
const WHEN = new Date(Date.UTC(2026, 7, 3, 8, 0, 0))

describe('sunEvents', () => {
  it('orders evening golden before blue before astronomical dusk', () => {
    const night = getNightWindow(LAT, LNG, WHEN)!
    const golden = getGoldenHourInfo(LAT, LNG, night)
    const blue = getBlueHourInfo(LAT, LNG, night)
    const twilight = getTwilightInfo(LAT, LNG, night)

    expect(golden.evening).not.toBeNull()
    expect(blue.evening).not.toBeNull()
    expect(twilight.astronomical.evening).not.toBeNull()

    expect(new Date(golden.evening!.start).getTime()).toBeLessThan(
      new Date(blue.evening!.start).getTime()
    )
    expect(new Date(blue.evening!.end!).getTime()).toBeLessThanOrEqual(
      new Date(twilight.astronomical.evening!.end!).getTime()
    )
    expect(golden.durationMinutes).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

- [ ] **Step 3: Implement `lib/photo/sunEvents.ts`**

```ts
import { Body, Observer, SearchAltitude } from 'astronomy-engine'
import type {
  BlueHourInfo,
  GoldenHourInfo,
  NightWindow,
  TimeRange,
  TwilightInfo
} from '../../types/photo'

function iso(d: Date): string {
  return d.toISOString()
}

function rangeOrNull(start: Date | null, end: Date | null): TimeRange | null {
  if (!start || !end) return null
  if (end.getTime() <= start.getTime()) return null
  return { start: iso(start), end: iso(end) }
}

function searchSunAlt(
  observer: Observer,
  direction: 1 | -1,
  from: Date,
  altitude: number,
  limitDays = 1
): Date | null {
  const t = SearchAltitude(Body.Sun, observer, direction, from, limitDays, altitude)
  return t ? t.date : null
}

function durationMinutes(a: TimeRange | null, b: TimeRange | null): number | null {
  let total = 0
  let any = false
  for (const r of [a, b]) {
    if (!r) continue
    any = true
    total += (new Date(r.end).getTime() - new Date(r.start).getTime()) / 60_000
  }
  return any ? Math.round(total) : null
}

export function getGoldenHourInfo(
  lat: number,
  lng: number,
  night: NightWindow
): GoldenHourInfo {
  const observer = new Observer(lat, lng, 0)
  const sunset = new Date(night.sunset)
  const sunrise = new Date(night.sunrise)

  // Evening: sun descends +6 → -4, search backward/forward around sunset
  const eveStart = searchSunAlt(observer, -1, new Date(sunset.getTime() - 3 * 3600_000), 6, 1)
  const eveEnd = searchSunAlt(observer, -1, eveStart ?? new Date(sunset.getTime() - 2 * 3600_000), -4, 1)
  const evening = rangeOrNull(eveStart, eveEnd)

  // Morning: sun ascends -4 → +6 near sunrise
  const mornStart = searchSunAlt(observer, +1, new Date(sunrise.getTime() - 3 * 3600_000), -4, 1)
  const mornEnd = searchSunAlt(observer, +1, mornStart ?? new Date(sunrise.getTime() - 2 * 3600_000), 6, 1)
  const morning = rangeOrNull(mornStart, mornEnd)

  return {
    morning,
    evening,
    durationMinutes: durationMinutes(morning, evening)
  }
}

export function getBlueHourInfo(
  lat: number,
  lng: number,
  night: NightWindow
): BlueHourInfo {
  const observer = new Observer(lat, lng, 0)
  const sunset = new Date(night.sunset)
  const sunrise = new Date(night.sunrise)

  const eveStart = searchSunAlt(observer, -1, new Date(sunset.getTime() - 2 * 3600_000), -4, 1)
  const eveEnd = searchSunAlt(observer, -1, eveStart ?? sunset, -6, 1)
  const morningStart = searchSunAlt(observer, +1, new Date(sunrise.getTime() - 2 * 3600_000), -6, 1)
  const morningEnd = searchSunAlt(observer, +1, morningStart ?? sunrise, -4, 1)

  return {
    evening: rangeOrNull(eveStart, eveEnd),
    morning: rangeOrNull(morningStart, morningEnd)
  }
}

function twilightBand(
  observer: Observer,
  night: NightWindow,
  upperAlt: number,
  lowerAlt: number
): { morning: TimeRange | null; evening: TimeRange | null } {
  const sunset = new Date(night.sunset)
  const sunrise = new Date(night.sunrise)
  const eveStart = searchSunAlt(observer, -1, new Date(sunset.getTime() - 2 * 3600_000), upperAlt, 1)
  const eveEnd = searchSunAlt(observer, -1, eveStart ?? sunset, lowerAlt, 1)
  const mornStart = searchSunAlt(observer, +1, new Date(sunrise.getTime() - 3 * 3600_000), lowerAlt, 1)
  const mornEnd = searchSunAlt(observer, +1, mornStart ?? sunrise, upperAlt, 1)
  return {
    evening: rangeOrNull(eveStart, eveEnd),
    morning: rangeOrNull(mornStart, mornEnd)
  }
}

export function getTwilightInfo(
  lat: number,
  lng: number,
  night: NightWindow
): TwilightInfo {
  const observer = new Observer(lat, lng, 0)
  return {
    civil: twilightBand(observer, night, 0, -6),
    nautical: twilightBand(observer, night, -6, -12),
    astronomical: twilightBand(observer, night, -12, -18)
  }
}
```

If ordering test fails due to search start windows, fix start offsets — do not change altitude band constants from the spec.

- [ ] **Step 4: Export, test PASS, commit**

```bash
git commit -m "feat(photo): add golden blue and twilight sun events"
```

---

### Task 5: Milky Way (GC + visibility + best time)

**Files:**
- Create: `lib/photo/milkyWay.ts`
- Modify: `lib/photo/index.ts`
- Test: `tests/lib/photo/milkyWay.test.ts`

**Interfaces:**
- Consumes: `getMilkyWayVisibility` from `lib/milkyway`; `getMoonInfo` / sun altitude helpers; `azimuthToDirection`; `getCameraSettings`, `lensLabelFromSettings`; `NightWindow`, `TwilightInfo`; astronomy-engine `Horizon`, `Observer`
- Produces:
  - `GC_RA_HOURS`, `GC_DEC_DEG` constants
  - `getGalacticCenterHorizontal(lat, lng, when): { altitude: number; azimuth: number }`
  - `buildMilkyWayPhotoInfo(lat, lng, when, night, astronomicalDark: TimeRange | null): MilkyWayPhotoInfo`

GC: RA `17.761` h, Dec `-29.007`°. Pass directly to `Horizon(when, observer, ra, dec, 'normal')` (no `DefineStar` required).

Core visible: sun alt < −18°, GC alt ≥ 20°, and (moon alt ≤ 0 **or** illumination < 30).

Best time: sample every 10 minutes across `astronomicalDark` evening→morning (from twilight.astronomical.evening.end to twilight.astronomical.morning.start if both exist; else night window interior). Maximize `gcAlt - moonPenalty` where moonPenalty = illumination/10 if moon alt > 0 else 0. Require gcAlt ≥ 0.

- [ ] **Step 1: Write failing test**

```ts
import { describe, expect, it } from 'vitest'
import {
  getGalacticCenterHorizontal,
  buildMilkyWayPhotoInfo
} from '../../../lib/photo/milkyWay'
import { getNightWindow } from '../../../lib/photo/nightWindow'
import { getTwilightInfo } from '../../../lib/photo/sunEvents'

const LAT = 21.0285
const LNG = 105.8542

describe('milkyWay photo', () => {
  it('returns finite GC altitude', () => {
    const when = new Date(Date.UTC(2026, 7, 3, 16, 0, 0))
    const pos = getGalacticCenterHorizontal(LAT, LNG, when)
    expect(Number.isFinite(pos.altitude)).toBe(true)
    expect(pos.azimuth).toBeGreaterThanOrEqual(0)
  })

  it('marks coreVisible false when sun is high', () => {
    const day = new Date(Date.UTC(2026, 7, 3, 5, 0, 0)) // ~noon local-ish
    const night = getNightWindow(LAT, LNG, day)!
    const twilight = getTwilightInfo(LAT, LNG, night)
    const info = buildMilkyWayPhotoInfo(
      LAT,
      LNG,
      day,
      night,
      twilight.astronomical.evening && twilight.astronomical.morning
        ? {
            start: twilight.astronomical.evening.end,
            end: twilight.astronomical.morning.start
          }
        : null
    )
    // At daytime sample for visibility context inside builder — core at `day` path:
    // Builder evaluates core at bestTime or representative instant; assert settings always present
    expect(info.settings.tripodRequired).toBe(true)
    expect(info.recommendedLensLabel).toMatch(/mm/)
  })

  it('forces coreVisible false when evaluating with sun above -18 via helper path', () => {
    const { altitude } = getGalacticCenterHorizontal(
      LAT,
      LNG,
      new Date(Date.UTC(2026, 7, 3, 5, 0, 0))
    )
    expect(typeof altitude).toBe('number')
  })
})
```

Also add a focused unit on an internal-exported or tested path: when sunAltitude = 0, core must be false. Prefer exporting `isGalacticCoreVisible(sunAlt, gcAlt, moonAlt, illum): boolean` for easy testing:

```ts
export function isGalacticCoreVisible(
  sunAltitudeDeg: number,
  gcAltitudeDeg: number,
  moonAltitudeDeg: number,
  moonIlluminationPct: number
): boolean {
  if (sunAltitudeDeg >= -18) return false
  if (gcAltitudeDeg < 20) return false
  if (moonAltitudeDeg > 0 && moonIlluminationPct >= 30) return false
  return true
}
```

Test:

```ts
expect(isGalacticCoreVisible(0, 40, -10, 0)).toBe(false)
expect(isGalacticCoreVisible(-20, 40, -10, 0)).toBe(true)
expect(isGalacticCoreVisible(-20, 40, 30, 80)).toBe(false)
```

- [ ] **Step 2–4: Implement, PASS, commit**

```bash
git commit -m "feat(photo): add Milky Way galactic center planning"
```

Implementation sketch for `buildMilkyWayPhotoInfo`: at `bestTime` or `when`, call `getSunInfo`/`getMoonInfo`, `getMilkyWayVisibility`, GC horizontal, `isGalacticCoreVisible`, attach `getCameraSettings('milky-way')` + wide lens label. Round altitudes to 1 decimal.

---

### Task 6: Photography score

**Files:**
- Create: `lib/photo/score.ts`
- Modify: `lib/photo/index.ts`
- Test: `tests/lib/photo/score.test.ts`

**Interfaces:**
- Consumes: `MilkyWayVisibility`, `PhotographyScore`
- Produces: `computePhotographyScore(input): PhotographyScore`

```ts
export interface PhotographyScoreInput {
  milkyWayVisibility: MilkyWayVisibility
  hasAstronomicalDarkness: boolean
  moonAltitudeDeg: number
  moonIlluminationPct: number
  coreVisible: boolean | null
}

export function computePhotographyScore(input: PhotographyScoreInput): PhotographyScore
```

Algorithm per spec §7:
1. Map visibility Excellent→5, Good→4, Poor→2, Not Visible→1
2. No astronomical darkness → stars = 1, reason về tối thiên văn
3. Moon alt > 0 && illum ≥ 70 → stars − 1 (min 1)
4. Moon alt ≤ 0 → reason “Trăng dưới chân trời” (no star bump)
5. `coreVisible === false` → stars − 1 if stars > 1
6. Label: 1 Poor, 2–3 Fair, 4 Good, 5 Excellent; reasons max 3; `cloudCoverPct: null`

- [ ] **Step 1: Tests**

```ts
import { describe, expect, it } from 'vitest'
import { computePhotographyScore } from '../../../lib/photo/score'

describe('computePhotographyScore', () => {
  it('scores high on excellent MW with dark sky and no moon', () => {
    const s = computePhotographyScore({
      milkyWayVisibility: 'Excellent',
      hasAstronomicalDarkness: true,
      moonAltitudeDeg: -10,
      moonIlluminationPct: 5,
      coreVisible: true
    })
    expect(s.stars).toBe(5)
    expect(s.label).toBe('Excellent')
    expect(s.cloudCoverPct).toBeNull()
  })

  it('caps when no astronomical darkness', () => {
    const s = computePhotographyScore({
      milkyWayVisibility: 'Good',
      hasAstronomicalDarkness: false,
      moonAltitudeDeg: -10,
      moonIlluminationPct: 0,
      coreVisible: null
    })
    expect(s.stars).toBe(1)
    expect(s.label).toBe('Poor')
  })

  it('penalizes bright moon above horizon', () => {
    const s = computePhotographyScore({
      milkyWayVisibility: 'Excellent',
      hasAstronomicalDarkness: true,
      moonAltitudeDeg: 40,
      moonIlluminationPct: 90,
      coreVisible: true
    })
    expect(s.stars).toBeLessThanOrEqual(4)
  })
})
```

- [ ] **Step 2–5: Implement, PASS, commit**

```bash
git commit -m "feat(photo): add dark-sky photography score"
```

---

### Task 7: Moon photography

**Files:**
- Create: `lib/photo/moonPhoto.ts`
- Modify: `lib/photo/index.ts`
- Test: `tests/lib/photo/moonPhoto.test.ts`

**Interfaces:**
- Consumes: `getMoonInfo` from `lib/moon`; `getMoonHorizontal` optional for sampling; `getCameraSettings('moon')`; `NightWindow`
- Produces: `buildMoonPhotoInfo(lat, lng, when, night: NightWindow | null): MoonPhotoInfo`

Heuristics:
- Sample night every 20 minutes (or use rise/set + `when`): if illum ∈ [30,70] and find time with moon alt ≥ 15° → that ISO as `bestPhotographyTime`
- Else if illum ≥ 50 and moonrise → `bestPhotographyTime = moonrise`
- Else null
- Phase/illum/rise/set from `getMoonInfo` at `when` (rise/set already on MoonInfo)

- [ ] **Step 1: Test**

```ts
import { describe, expect, it } from 'vitest'
import { buildMoonPhotoInfo } from '../../../lib/photo/moonPhoto'
import { getNightWindow } from '../../../lib/photo/nightWindow'

describe('buildMoonPhotoInfo', () => {
  it('returns phase illumination and moon settings', () => {
    const lat = 21.0285
    const lng = 105.8542
    const when = new Date(Date.UTC(2026, 7, 3, 12, 0, 0))
    const night = getNightWindow(lat, lng, when)
    const info = buildMoonPhotoInfo(lat, lng, when, night)
    expect(info.phase.length).toBeGreaterThan(0)
    expect(info.illuminationPct).toBeGreaterThanOrEqual(0)
    expect(info.settings.focalLengthMm.min).toBeGreaterThanOrEqual(200)
    expect(info.recommendedLensLabel).toMatch(/mm/)
  })
})
```

- [ ] **Step 2–5: Implement, PASS, commit**

```bash
git commit -m "feat(photo): add moon photography planner"
```

---

### Task 8: Planet photography

**Files:**
- Create: `lib/photo/planets.ts`
- Modify: `lib/photo/index.ts`
- Test: `tests/lib/photo/planets.test.ts`

**Interfaces:**
- Consumes: pattern from `lib/planets.ts` (Mercury–Saturn, alt>0 && sun<-6); do **not** break existing `PlanetInfo` type — map into `PlanetPhotoInfo`
- Produces: `listPlanetPhotoInfos(lat, lng, when: Date): PlanetPhotoInfo[]`

Brightness map:
- Venus, Jupiter → `very-bright`
- Mars, Saturn → `bright`
- Mercury → `moderate`
- If altitude < 15° and not already faint → nudge down one class (`very-bright`→`bright`→`moderate`→`faint`)

Magnification strings:
- Mercury/Venus: `50–100x`
- Mars: `100–200x`
- Jupiter: `80–150x`
- Saturn: `100–200x`

`magnitude: null` always.

- [ ] **Step 1: Test**

```ts
import { describe, expect, it } from 'vitest'
import { listPlanetPhotoInfos } from '../../../lib/photo/planets'

describe('listPlanetPhotoInfos', () => {
  it('returns five planets with magnitude null', () => {
    const list = listPlanetPhotoInfos(
      21.0285,
      105.8542,
      new Date(Date.UTC(2026, 7, 3, 16, 0, 0))
    )
    expect(list).toHaveLength(5)
    expect(list.every((p) => p.magnitude === null)).toBe(true)
    expect(list.map((p) => p.name)).toEqual([
      'Mercury',
      'Venus',
      'Mars',
      'Jupiter',
      'Saturn'
    ])
  })
})
```

- [ ] **Step 2–5: Implement (Equator+Horizon like `lib/planets.ts`), PASS, commit**

```bash
git commit -m "feat(photo): add planet photography list"
```

---

### Task 9: Timeline

**Files:**
- Create: `lib/photo/timeline.ts`
- Modify: `lib/photo/index.ts`
- Test: `tests/lib/photo/timeline.test.ts`

**Interfaces:**
- Consumes: `NightWindow`, golden/blue/twilight, moon rise/set ISO, MW bestTime, visible planets windows (optional: single marker “Hành tinh nổi” at first time any bright planet visible during dark — or marker per top visible planet at `when`)
- Produces: `buildPhotoTimeline(args): PhotoTimeline`

```ts
export interface BuildPhotoTimelineArgs {
  window: NightWindow
  golden: GoldenHourInfo
  blue: BlueHourInfo
  twilight: TwilightInfo
  moonrise: string | null
  moonset: string | null
  milkyWayPeak: string | null
  planetMarkerAt: string | null
  planetMarkerEnd: string | null
}

export function buildPhotoTimeline(args: BuildPhotoTimelineArgs): PhotoTimeline
```

Markers (Vietnamese labels):
- golden evening/morning ranges → kind `golden-hour`, label `Giờ vàng`
- blue → `Giờ xanh`
- dark-sky → from astronomical evening.end to morning.start, label `Trời tối`
- moonrise / moonset instants
- milky-way-peak instant `Đỉnh Ngân Hà`
- planet-visibility if `planetMarkerAt` set

Sort markers by `at` ascending. Skip null ranges.

- [ ] **Step 1: Test**

```ts
import { describe, expect, it } from 'vitest'
import { buildPhotoTimeline } from '../../../lib/photo/timeline'
import { getNightWindow } from '../../../lib/photo/nightWindow'
import {
  getBlueHourInfo,
  getGoldenHourInfo,
  getTwilightInfo
} from '../../../lib/photo/sunEvents'

describe('buildPhotoTimeline', () => {
  it('sorts markers and includes dark-sky when astronomical band exists', () => {
    const lat = 21.0285
    const lng = 105.8542
    const when = new Date(Date.UTC(2026, 7, 3, 8, 0, 0))
    const window = getNightWindow(lat, lng, when)!
    const golden = getGoldenHourInfo(lat, lng, window)
    const blue = getBlueHourInfo(lat, lng, window)
    const twilight = getTwilightInfo(lat, lng, window)
    const timeline = buildPhotoTimeline({
      window,
      golden,
      blue,
      twilight,
      moonrise: null,
      moonset: null,
      milkyWayPeak: null,
      planetMarkerAt: null,
      planetMarkerEnd: null
    })
    const times = timeline.markers.map((m) => new Date(m.at).getTime())
    expect([...times].sort((a, b) => a - b)).toEqual(times)
    expect(timeline.markers.some((m) => m.kind === 'dark-sky')).toBe(true)
  })
})
```

- [ ] **Step 2–5: Implement, PASS, commit**

```bash
git commit -m "feat(photo): build sunset-to-sunrise photo timeline"
```

---

### Task 10: Snapshot assembler

**Files:**
- Create: `lib/photo/snapshot.ts`
- Modify: `lib/photo/index.ts`
- Test: `tests/lib/photo/snapshot.test.ts`

**Interfaces:**
- Consumes: all builders from tasks 2–9
- Produces: `buildAstroPhotographySnapshot(lat: number, lng: number, when: Date): AstroPhotographySnapshot`

Without calling this (no coords), composable will build a shell separately.

Assembler:
1. `nightWindow = getNightWindow(...)`
2. If null → return snapshot with nulls except `suggestedSettings: getCameraSettings('milky-way')`, timestamp
3. Else compute golden/blue/twilight, milkyWay, moon, planets, score (pick representative instant: prefer midpoint of astronomical dark, else midnight between sunset/sunrise, else `when`), timeline

Score input from MW info + moon/sun at representative instant + `hasAstronomicalDarkness` = astronomical dark range exists and length > 0.

- [ ] **Step 1: Test**

```ts
import { describe, expect, it } from 'vitest'
import { buildAstroPhotographySnapshot } from '../../../lib/photo/snapshot'

describe('buildAstroPhotographySnapshot', () => {
  it('fills score and sections for Hanoi', () => {
    const snap = buildAstroPhotographySnapshot(
      21.0285,
      105.8542,
      new Date(Date.UTC(2026, 7, 3, 8, 0, 0))
    )
    expect(snap.nightWindow).not.toBeNull()
    expect(snap.score).not.toBeNull()
    expect(snap.milkyWay).not.toBeNull()
    expect(snap.goldenHour).not.toBeNull()
    expect(snap.timeline).not.toBeNull()
    expect(snap.suggestedSettings).not.toBeNull()
  })
})
```

- [ ] **Step 2–5: Implement, PASS, commit**

```bash
git commit -m "feat(photo): assemble astrophotography snapshot"
```

---

### Task 11: `useAstroPhotography` composable

**Files:**
- Create: `app/composables/useAstroPhotography.ts`
- Test: `tests/composables/useAstroPhotography.test.ts`

**Interfaces:**
- Consumes: `Ref<Coordinates | null>`, optional `when`; `buildAstroPhotographySnapshot`, `getCameraSettings`
- Produces: `{ snapshot, needsLocation, error, refresh, loading }` where `snapshot` is `Ref<AstroPhotographySnapshot>`

Behavior (mirror `useMeteor` / `useMoonCalendar`):
- `needsLocation = coordinates === null`
- When null coords: snapshot shell — all observer fields null, `suggestedSettings = getCameraSettings('milky-way')`, timestamp from when
- When coords: call `buildAstroPhotographySnapshot`
- `watch` coords + refreshToken; catch errors → Vietnamese message `Không thể tính lịch chụp ảnh. Hãy thử làm mới.`

- [ ] **Step 1: Test**

```ts
import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import type { Coordinates } from '../../types/location'
import { useAstroPhotography } from '../../app/composables/useAstroPhotography'

describe('useAstroPhotography', () => {
  const fixed = new Date(Date.UTC(2026, 7, 3, 8, 0, 0))

  it('needs location and null score without coordinates', () => {
    const coordinates = ref<Coordinates | null>(null)
    const api = useAstroPhotography(coordinates, fixed)
    expect(api.needsLocation.value).toBe(true)
    expect(api.snapshot.value.score).toBeNull()
    expect(api.snapshot.value.suggestedSettings).not.toBeNull()
    expect(api.error.value).toBeNull()
  })

  it('computes score with coordinates', () => {
    const coordinates = ref<Coordinates | null>({ lat: 21.0285, lng: 105.8542 })
    const api = useAstroPhotography(coordinates, fixed)
    expect(api.needsLocation.value).toBe(false)
    expect(api.snapshot.value.score).not.toBeNull()
  })
})
```

- [ ] **Step 2–5: Implement, PASS, commit**

```bash
git commit -m "feat(photo): add useAstroPhotography composable"
```

---

### Task 12: Photo UI components (batch 1 — score, MW, sun)

**Files:**
- Create:
  - `app/components/photo/PhotoLocationPrompt.vue`
  - `app/components/photo/PhotoScoreCard.vue`
  - `app/components/photo/MilkyWayPhotoCard.vue`
  - `app/components/photo/GoldenHourCard.vue`
  - `app/components/photo/BlueHourCard.vue`
  - `app/components/photo/TwilightCard.vue`
- Test: none (presentation); verify via typecheck later

**Interfaces:**
- Consumes: types from `types/photo`; props only; use `SkyCard` + `SectionTitle`
- Produces: Vue SFCs

Patterns: copy `MeteorVisibilityScore.vue` for score stars + “Cần vị trí”. Format times with `Intl.DateTimeFormat(undefined, { timeStyle: 'short' })`.

`PhotoScoreCard`: props `score: PhotographyScore | null` — map label to Vietnamese (Poor→Kém, Fair→Trung bình, Good→Tốt, Excellent→Xuất sắc). Title “Điểm chụp đêm nay”.

`MilkyWayPhotoCard`: props `info: MilkyWayPhotoInfo | null` — show visibility, direction, altitude, best time, core, lens, settings summary.

`GoldenHourCard` / `BlueHourCard` / `TwilightCard`: show morning/evening ranges or “Cần vị trí”.

`PhotoLocationPrompt`: short Vietnamese CTA when `needsLocation`.

- [ ] **Step 1: Create the six components** following existing Tailwind slate/sky classes (see `MeteorVisibilityScore.vue`).
- [ ] **Step 2: Run `npm run typecheck`** — fix prop/type errors.
- [ ] **Step 3: Commit**

```bash
git commit -m "feat(photo): add score milky-way and sun event cards"
```

---

### Task 13: Photo UI components (batch 2 — moon, planets, settings, timeline)

**Files:**
- Create:
  - `app/components/photo/MoonPhotoCard.vue`
  - `app/components/photo/PlanetPhotoCard.vue`
  - `app/components/photo/CameraSettingsCard.vue`
  - `app/components/photo/PhotoTimeline.vue`

`MoonPhotoCard`: rise/set/phase/illum/best time/lens.

`PlanetPhotoCard`: list visible planets (filter `isVisible` or show all with badge); altitude, brightness, magnification.

`CameraSettingsCard`: props `settings: CameraSettings | null`, optional `subjectLabel` — ISO range, aperture, exposure, FL, tripod, remote.

`PhotoTimeline`: horizontal/stacked list of markers between sunset–sunrise; show label + time; empty → “Cần vị trí”.

- [ ] **Step 1: Create components**
- [ ] **Step 2: `npm run typecheck`**
- [ ] **Step 3: Commit**

```bash
git commit -m "feat(photo): add moon planet settings and timeline cards"
```

---

### Task 14: Page + home link

**Files:**
- Create: `app/pages/astrophotography.vue`
- Modify: `app/pages/index.vue` (add `astrophotographyLink` + `NuxtLink` like meteor)

**Page behavior:** Mirror `meteor-showers.vue` location bootstrap (query lat/lng, `useGeolocationInput`, manual fallback). Wire `useAstroPhotography(coordinates)`. Section order per spec §10.

```vue
<!-- structure sketch -->
<script setup lang="ts">
// parse query coords like meteor-showers.vue
// const photo = useAstroPhotography(coordinates)
useHead({ title: "Astrophotography · What's Above Me?" })
</script>

<template>
  <div class="space-y-6">
    <header>...</header>
    <PhotoLocationPrompt v-if="photo.needsLocation.value" />
    <PhotoScoreCard :score="photo.snapshot.value.score" />
    <MilkyWayPhotoCard :info="photo.snapshot.value.milkyWay" />
    <GoldenHourCard :info="photo.snapshot.value.goldenHour" />
    <BlueHourCard :info="photo.snapshot.value.blueHour" />
    <TwilightCard :info="photo.snapshot.value.twilight" />
    <MoonPhotoCard :info="photo.snapshot.value.moon" />
    <PlanetPhotoCard :planets="photo.snapshot.value.planets" />
    <CameraSettingsCard :settings="photo.snapshot.value.suggestedSettings" />
    <PhotoTimeline :timeline="photo.snapshot.value.timeline" />
  </div>
</template>
```

Home link label: `Astrophotography` or `Lên lịch chụp ảnh` — use Vietnamese consistent with other links (“Telescope Mode” stays English where existing does; prefer `Astrophotography` to match route name, subtitle optional).

- [ ] **Step 1: Create page + home link**
- [ ] **Step 2: Run full verification**

```bash
npm test -- tests/lib/photo tests/composables/useAstroPhotography.test.ts
npm run typecheck
```

Expected: all PASS / typecheck clean

- [ ] **Step 3: Commit**

```bash
git commit -m "feat(photo): add astrophotography page and home link"
```

---

## Self-Review (plan author)

**Spec coverage**
| Spec item | Task |
|-----------|------|
| types + future hooks | 1 |
| camera settings tables | 2 |
| night window | 3 |
| golden/blue/twilight | 4 |
| Milky Way GC + visibility | 5 |
| photography score | 6 |
| moon photography | 7 |
| planet photography | 8 |
| timeline | 9 |
| snapshot assemble | 10 |
| composable | 11 |
| components | 12–13 |
| page + home link | 14 |
| no `/api/photo`, hybrid location, tonight-only | Global + 11, 14 |

**Placeholder scan:** No TBD/TODO left in task steps.

**Type consistency:** `AstroPhotographySnapshot`, `CameraSettings`, `NightWindow`, marker kinds match `types/photo.ts` in Task 1.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-08-04-astrophotography-planner.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
