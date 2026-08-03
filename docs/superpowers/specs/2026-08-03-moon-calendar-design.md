# Moon Calendar - Design Spec

## 1) Product Goal

Add a **Moon Calendar** experience to Sky Companion: help users understand the Moon throughout the year and plan astronomy or photography sessions.

Show today’s Moon details, a monthly calendar with per-day phase/rise/set, upcoming quarter events, an observation score, and a rule-based photography guide.

Use **Astronomy Engine** for all astronomical calculations. Do **not** use AI. Do **not** call external paid APIs.

## 2) Confirmed Decisions

- Data approach: **client-side** pure calculations in `lib/moon/*` + `useMoonCalendar` (same spirit as Telescope Mode). No new Nitro calendar API.
- Refactor existing `lib/moon.ts` into `lib/moon/`; keep `getMoonInfo` for `/api/moon` and homepage sky snapshot compatibility.
- Monthly calendar: current month + **prev/next** (no year bound); default “now”.
- Observation score: **one** heuristic from altitude + phase + illumination → 1–5 stars + label.
- Selecting a calendar day opens a **detail panel below the calendar** (not a modal).
- UI language: Vietnamese chrome; keep English phase names (`New Moon`, `Full Moon`, etc.).
- Lunar eclipse: **types/interfaces only** — no eclipse search or API integration in this version.
- Page: dedicated `/moon-calendar` with home entry link when coordinates are known (`?lat=&lng=`).
- Moon phase illustration: local SVG/CSS driven by phase angle / icon key (no external images, no AI).

## 3) Scope

### In Scope

- Page `/moon-calendar` (`app/pages/moon-calendar.vue`).
- **Today’s Moon**: current phase, illumination %, moon age (days), moonrise, moonset, altitude, azimuth, distance from Earth, angular diameter + phase illustration.
- **Monthly Calendar**: each day shows phase icon, illumination, rise time, set time; select day → detail panel.
- **Upcoming Events**: next New Moon, First Quarter, Full Moon, Last Quarter with date, time, days remaining.
- **Observation Score**: ★ mapping + label (Poor / Fair / Good / Excellent) + short reasons.
- **Photography Guide**: best-for landscape / crater / moonrise + recommended focal length range + notes.
- Reusable eclipse-related interfaces (`LunarEclipse`, `EclipseType`, `Visibility`, `Magnitude`) without computation.
- Future-ready type hooks for Supermoon, Blue Moon, Blood Moon, notifications, calendar export, widget summary.
- Unit tests for phase/position/calendar/events/score/photography and `getMoonInfo` regression; composable smoke tests.
- Home entry link when coordinates known.

### Out of Scope (now)

- Real lunar eclipse prediction / visibility maps.
- Supermoon, Blue Moon, Blood Moon detection logic.
- Push notifications, iCal/export, home-screen widget.
- Weather or light-pollution APIs.
- Auth, database, new paid services.
- New server API for the calendar page.

## 4) Architecture

```text
GPS / manual / ?lat&lng
        │
        ▼
useGeolocationInput
        │
        ▼
useMoonCalendar.ts       # month cursor, selected day, refresh, error
        │
        ├── phase.ts           # phase name, illumination, age, icon key
        ├── position.ts        # alt/az, distance, angular diameter, rise/set
        ├── calendar.ts        # month grid cells
        ├── events.ts          # next four quarter events
        ├── score.ts           # observation score 1–5
        ├── photography.ts     # photography recommendations
        ├── eclipse.ts         # types-only stubs (no search)
        └── snapshot.ts        # getMoonInfo() for /api/moon
        │
        ▼
components/moon/* → pages/moon-calendar.vue
```

### Principles

- Pure calculation in `lib/moon/*` (no Vue, no DOM).
- `useMoonCalendar` orchestrates location, viewed month, selected day, and derived UI state.
- Components render only; they do **not** import `astronomy-engine` directly.
- Keep `MoonInfo` (`types/astronomy.ts`) unchanged; richer calendar types live in `types/moon.ts`.
- Existing `/api/moon` continues to call `getMoonInfo` after the file move.

### Why not extend `/api/moon` for the calendar?

A month grid needs ~28–42 day cells with rise/set searches. Doing that client-side avoids large payloads and round-trips, keeps the domain testable offline, and matches Telescope Mode’s isolation pattern. Homepage / sky API keep using the slim `MoonInfo` snapshot.

## 5) Folder Structure

```text
types/moon.ts
lib/moon/
  phase.ts
  position.ts
  calendar.ts
  events.ts
  score.ts
  photography.ts
  eclipse.ts              # stub exports only (no Astronomy Engine search yet)
  snapshot.ts             # migrated getMoonInfo from lib/moon.ts
  index.ts                # public re-exports
app/composables/useMoonCalendar.ts
app/components/moon/
  MoonTodayCard.vue
  MoonPhaseIllustration.vue
  MoonMonthCalendar.vue
  MoonDayDetailPanel.vue
  MoonUpcomingEvents.vue
  MoonObservationScore.vue
  MoonPhotographyGuide.vue
app/pages/moon-calendar.vue
tests/lib/moon/
  phase.test.ts
  position.test.ts
  calendar.test.ts
  events.test.ts
  score.test.ts
  photography.test.ts
  snapshot.test.ts
tests/composables/useMoonCalendar.test.ts
```

Delete root `lib/moon.ts` after migration. Update imports in `server/api/moon.get.ts` (and any other consumers) to `lib/moon` / `lib/moon/snapshot`.

## 6) Domain Types (`types/moon.ts`)

### Phase & today

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
```

### Calendar

```ts
export interface MoonCalendarDay {
  dateISO: string // YYYY-MM-DD (local calendar date for the viewed month)
  phase: MoonPhaseName
  iconKey: MoonPhaseIconKey
  illuminatedPercentage: number
  riseTime: string | null
  setTime: string | null
  isToday: boolean
  inCurrentMonth: boolean
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
```

Calendar cells for padding days from adjacent months set `inCurrentMonth: false` and are **not selectable** in MVP (only days in the viewed month).

### Events

```ts
export type MoonQuarterType =
  | 'new'
  | 'first-quarter'
  | 'full'
  | 'last-quarter'

export interface MoonQuarterEvent {
  type: MoonQuarterType
  at: string // ISO
  daysRemaining: number // ceil of ms until event from `now`; 0 if within the same day window as defined in events.ts
}
```

### Score & photography

```ts
export type ObservationScoreLabel =
  | 'Poor'
  | 'Fair'
  | 'Good'
  | 'Excellent'

export interface ObservationScore {
  stars: 1 | 2 | 3 | 4 | 5
  label: ObservationScoreLabel
  reasons: string[] // short Vietnamese strings for UI
}

export interface PhotographyGuide {
  bestForLandscape: boolean
  bestForCraters: boolean
  bestForMoonrise: boolean
  recommendedFocalLengthMm: { min: number; max: number }
  notes: string[] // Vietnamese
}
```

### Star → label mapping (explicit)

| Stars | Label |
|------:|-------|
| 1 | Poor |
| 2 | Fair |
| 3 | Fair |
| 4 | Good |
| 5 | Excellent |

### Lunar eclipse (architecture only)

```ts
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
  peakTime: string // ISO
  magnitude: Magnitude
  visibility: Visibility
  /** Observer-relative; null until visibility engine exists */
  observerLat: number | null
  observerLng: number | null
}
```

All eclipse interfaces live in `types/moon.ts`. `lib/moon/eclipse.ts` only exports a stub `listUpcomingLunarEclipses(): LunarEclipse[]` that returns `[]` — **no** Astronomy Engine eclipse search in this version.

### Future-ready hooks (types only)

```ts
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

No UI for these hooks in MVP except that types exist so later features do not require a types rewrite.

## 7) Business Logic

### Shared constants

- Synodic month for age: **29.530588853** days.
- Mean Moon radius for angular diameter: **1737.4 km**.
- Round altitudes/azimuths/illumination like existing moon helper (typically 1 decimal); distance km to 0 decimals; angular diameter to 3 decimals; age to 1 decimal.

### Phase (`lib/moon/phase.ts`)

- `moonPhaseName(phaseAngleDeg)` — reuse existing 8-way bucket (`round(angle/45) % 8`), same names as today.
- `moonPhaseIconKey(phaseAngleDeg)` — parallel mapping to `MoonPhaseIconKey`.
- `illuminatedPercentage(when)` via `Illumination(Body.Moon, when).phase_fraction * 100`.
- `moonAgeDays(phaseAngleDeg)` = `(normalizedPhaseAngle / 360) * SYNODIC_MONTH_DAYS`.

### Position (`lib/moon/position.ts`)

- Observer: `new Observer(lat, lng, 0)`.
- Alt/az: `Equator(Body.Moon, …)` + `Horizon(…, 'normal')`.
- Rise/set: `SearchRiseSet(Body.Moon, observer, ±1, when, 2)` — same window style as current `getMoonInfo`.
- Distance: `GeoVector(Body.Moon, when, true)` → length in AU → km (`AU_KM` constant).
- Angular diameter (degrees): `2 * atan(MOON_RADIUS_KM / distanceKm) * (180 / π)`.

### Snapshot (`lib/moon/snapshot.ts`)

- `getMoonInfo(lat, lng, when): MoonInfo` — preserve existing return shape and rounding so `/api/moon` and sky snapshot stay compatible.
- Internally compose `phase` + `position` helpers (no duplicated Astronomy Engine calls beyond what’s needed).

### Calendar (`lib/moon/calendar.ts`)

- Input: `lat`, `lng`, `year`, `month` (1–12), `now` for `isToday`.
- Build a Sunday-start or Monday-start grid — **Monday-start** to match common VN calendars (explicit: week starts Monday).
- For each cell date at local noon (or 12:00 local constructed via `Date`), compute phase, illumination, rise/set.
- Return `MoonCalendarDay[]` (typically 35 or 42 entries).

### Day detail

- `buildMoonDayDetail(lat, lng, date, now)` composes position at a representative time for that local day (noon local), plus `score` and `photography` for that instant.
- Today’s card uses `now` (live clock) rather than noon.

### Events (`lib/moon/events.ts`)

- Use Astronomy Engine `SearchMoonQuarter` / successive search from `now`.
- Collect the next **four chronological** Astronomy Engine moon-quarter results from `now`, then map each quarter index → `MoonQuarterType`.
- `daysRemaining = max(0, ceil((at - now) / 86_400_000))`.

### Observation score (`lib/moon/score.ts`)

Inputs: `altitudeDeg`, `phaseAngleDeg`, `illuminatedPercentage`.

Algorithm (deterministic):

1. Start from altitude base:
   - `altitude < 0` → base `1`
   - `0 ≤ altitude < 15` → base `2`
   - `15 ≤ altitude < 40` → base `3`
   - `altitude ≥ 40` → base `4`
2. Phase / illumination adjustments:
   - Illumination `< 5` (near New): `stars = min(stars, 1)` and reason about low surface visibility.
   - Illumination in `[30, 70]`: `+1` (terminator / crater conditions).
   - Illumination `≥ 90` and altitude `≥ 15`: `+1` (good landscape moon), but do not imply best for craters.
3. Clamp to `1…5`.
4. Map label per table in §6.
5. Emit 1–3 short Vietnamese `reasons` explaining the dominant factors.

### Photography guide (`lib/moon/photography.ts`)

Rule-based (no AI):

- `bestForLandscape` = illumination `≥ 70`.
- `bestForCraters` = illumination in `[30, 70]`.
- `bestForMoonrise` = `riseTime != null` AND illumination `≥ 50` AND (for “today” context) rise is within the selected local day; for historical/future day cells, true when that day’s rise exists and illumination `≥ 50`.
- Focal length defaults:
  - If `bestForCraters`: `{ min: 200, max: 600 }`
  - Else if `bestForMoonrise` && !`bestForLandscape`: `{ min: 70, max: 200 }`
  - Else if `bestForLandscape`: `{ min: 24, max: 70 }`
  - Else: `{ min: 50, max: 200 }`
- `notes`: short Vietnamese tips derived from the flags above.

## 8) API

No new calendar HTTP API.

| Existing | Change |
|----------|--------|
| `GET /api/moon` | Import path only → `getMoonInfo` from `lib/moon` |
| `GET /api/sky` | Unaffected if it already uses `getMoonInfo` / moon helper |

## 9) Composable & UI

### `useMoonCalendar`

- Accepts `Ref<Coordinates | null>` and optional `when` (`Date` or `() => Date`), same pattern as `useTelescope`.
- State: `viewedYear`, `viewedMonth`, `selectedDateISO`, `error`, `refreshToken`.
- Derived (computed / recomputed): `today`, `monthDays`, `selectedDetail`, `upcomingEvents`, `todayScore`, `todayPhotography`.
- Actions: `goToPrevMonth`, `goToNextMonth`, `selectDay(dateISO)`, `clearSelectedDay`, `refresh`.
- When coords are null: clear derived data; do not throw.

### Page `/moon-calendar`

Bootstrap location like `/iss` / `/telescope` (query coords → GPS → manual fallback; reuse `LoadingLocation`, `PermissionDenied`, `CurrentLocation`).

Section order after coordinates are available:

1. Header — Moon Calendar intro + link home  
2. Location status  
3. **Today’s Moon** (`MoonTodayCard` + `MoonPhaseIllustration`)  
4. **Observation Score**  
5. **Photography Guide**  
6. **Monthly Calendar** + **Day Detail Panel** (panel visible only when a day is selected)  
7. **Upcoming Events**

Visual language: existing `SkyCard` / `SectionTitle`, slate / sky accents consistent with ISS and Telescope pages.

Home (`index.vue`): add Moon Calendar link when coordinates known (`/moon-calendar?lat=&lng=`).

### Components

| Component | Responsibility |
|-----------|----------------|
| `MoonPhaseIllustration` | SVG phase disk from `phaseAngleDeg` or `iconKey` |
| `MoonTodayCard` | Metrics list for today |
| `MoonMonthCalendar` | Month header, prev/next, day grid; emits `select` |
| `MoonDayDetailPanel` | Selected-day metrics + score + photo summary |
| `MoonUpcomingEvents` | Four upcoming quarters |
| `MoonObservationScore` | Stars + label + reasons |
| `MoonPhotographyGuide` | Flags + focal length + notes |

No business logic inside these components beyond light formatting (time locale strings).

## 10) Error & Edge Cases

| Case | Behavior |
|------|----------|
| GPS denied / unavailable | Manual lat/lng; calendar waits for coords |
| Rise or set null | Show “—” in UI; photography moonrise flag false if rise null |
| Calculation throw | Catch in composable; Vietnamese error message; keep last good data if any |
| Select padding day | Not allowed (`inCurrentMonth === false`) |
| Month navigation across year | Dec/Jan roll year correctly |
| Polar / unusual rise-set windows | Null times acceptable; score still uses altitude at evaluation time |

## 11) Testing

Vitest:

- `phase`: known angle → expected name/icon; age formula bounds (0…~29.53).
- `position`: finite alt/az/distance/diameter for a fixed lat/lng/`when`; rise/set null-safe.
- `calendar`: correct month length coverage; `inCurrentMonth` flags; Monday-start week alignment for a known month.
- `events`: four events, chronological, mapped types, `daysRemaining ≥ 0`.
- `score`: below-horizon → 1; quarter illumination mid-range boost; clamp 1–5; label table.
- `photography`: flag thresholds and focal-length branches.
- `snapshot` / `getMoonInfo`: shape matches `MoonInfo`; non-breaking vs prior behavior for a frozen fixture time.
- `useMoonCalendar`: prev/next month; select day sets detail; null coords clears/disables safely.

## 12) Future Extensions

| Feature | Hook |
|---------|------|
| Lunar eclipse predictions | Fill `listUpcomingLunarEclipses` using Astronomy Engine; reuse `LunarEclipse` |
| Supermoon / Blue Moon / Blood Moon | Populate `MoonSpecialEvent[]` from distance + calendar rules |
| Moon notifications | Build `MoonNotificationHook` from `MoonQuarterEvent.at` |
| Calendar export | `MoonCalendarExportHook` from month days / events |
| Widget | `MoonWidgetSummary` from today + next quarter |
| Server cache API | Optional later if widget/SSR needs shared payload — not required now |

## 13) Success Criteria

- User opens `/moon-calendar` with location and sees today’s phase metrics plus an SVG phase illustration.
- Month grid shows icon, illumination, rise/set per day; prev/next changes months; selecting a day opens the detail panel below the grid.
- Upcoming quarter events show date, time, and days remaining.
- Observation score and photography guide update for today (and for the selected day in the panel).
- `/api/moon` still returns valid `MoonInfo` after the `lib/moon` refactor.
- No paid APIs; no AI; eclipse types exist but no eclipse integration UI/logic beyond stubs.
- Domain logic covered by unit tests; Vue components stay presentation-only.
