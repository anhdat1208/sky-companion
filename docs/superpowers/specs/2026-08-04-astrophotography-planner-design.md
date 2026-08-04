# Astrophotography Planner - Design Spec

## 1) Product Goal

Add an **Astrophotography Planner** module to Sky Companion: help photographers know when and where to capture astronomical subjects for the current night.

Show tonight’s photography score (dark-sky / Milky Way focused), Milky Way planning, golden/blue hour, twilight bands, moon photography, planet photography, reusable camera-setting recommendations, and a sunset→sunrise planning timeline.

Use **Astronomy Engine** for all astronomical calculations. Do **not** use AI. Do **not** call external paid APIs.

## 2) Confirmed Decisions

- Data approach: **client-side** pure calculations in `lib/photo/*` + `useAstroPhotography` (same spirit as Meteor Showers / Moon Calendar / Telescope Mode). No new Nitro photo API.
- Architecture: dedicated `lib/photo/` module that **reuses** existing helpers (`getSunInfo`, `getMoonInfo`, `getMilkyWayVisibility`, `azimuthToDirection`) via import — does **not** dump photo logic into `lib/moon` or `lib/astronomy.ts`.
- Location: **hybrid** — page loads without coordinates; score, MW direction/altitude/core/best time, timeline markers, planet altitudes that need an observer become `null` with UI copy “Cần vị trí”. GPS, manual, or `?lat=&lng=` via `useGeolocationInput`.
- Night scope: **tonight only** — local sunset (today) → sunrise (next morning). Date picker is a typed future hook only.
- Tonight’s Photography Score: optimizes for **dark sky / Milky Way** (not a blended “any subject” score). Moon/planet quality stays in their own sections.
- Milky Way: **visibility label** from existing `getMilkyWayVisibility` (or thin wrapper); **direction / altitude / core / best time** from approximate Galactic Center (Sgr A*) RA/Dec via Astronomy Engine.
- Camera settings: **static recommendation tables** by subject for v1; `ConditionModifiers` typed but unused.
- UI language: Vietnamese chrome; keep English phase names and planet names (`Full Moon`, `Venus`, …).
- Page: dedicated `/astrophotography` with home entry link when coordinates are known.
- Future-ready: weather, cloud, wind, humidity, seeing, transparency, light pollution, saved locations, favorite spots, photo journal — **types + unused hooks only**.

## 3) Scope

### In Scope

- Page `/astrophotography` (`app/pages/astrophotography.vue`).
- **Tonight’s Photography Score**: 1–5 stars + label (Poor / Fair / Good / Excellent) from moon phase/illumination, moon altitude, sun altitude, astronomical darkness, MW visibility.
- **Milky Way**: visibility, direction, altitude, best time, core visible, recommended lens, recommended camera settings.
- **Golden Hour**: morning, evening, duration.
- **Blue Hour**: morning, evening.
- **Twilight**: civil, nautical, astronomical (morning + evening bounds as practical).
- **Moon Photography**: moonrise, moonset, phase, illumination, best photography time, recommended lens.
- **Planet Photography**: visible planets (Mercury–Saturn), altitude, brightness heuristic, recommended magnification.
- **Suggested Camera Settings**: reusable `CameraSettings` model + subject tables.
- **Planning Timeline**: sunset→sunrise with markers for golden, blue, dark sky, moonrise/set, MW peak, planet visibility.
- Future-ready type hooks listed above.
- Unit tests for lib modules + composable smoke tests.
- Home entry link when coordinates known.

### Out of Scope (now)

- Weather / cloud / seeing / transparency / light-pollution APIs.
- Persisted locations, favorite spots, photo journal storage.
- Date navigation / multi-night planner.
- Condition-based ISO/exposure modifiers (typed only).
- AI assistance or paid astronomy APIs.
- New server API for this page.
- Large refactors of `lib/moon` or homepage `buildSkySnapshot` beyond optional home link.

## 4) Architecture

```text
GPS / manual / ?lat&lng (optional)
        │
        ▼
useGeolocationInput
        │
        ▼
useAstroPhotography.ts     # tonight window, refresh, error, derived UI state
        │
        ├── nightWindow.ts      # sunset → sunrise bounds
        ├── sunEvents.ts        # golden / blue / twilight searches
        ├── milkyWay.ts         # GC position, visibility, core, best time
        ├── score.ts            # dark-sky / MW photography score
        ├── moonPhoto.ts        # moon photo planning fields
        ├── planets.ts          # visible planets + brightness + magnification
        ├── settings.ts         # CameraSettings tables + modifier hooks
        ├── timeline.ts         # markers across night window
        ├── future.ts           # weather / spots / journal type stubs
        └── index.ts
        │
        ▼
types/photo.ts
components/photo/* → pages/astrophotography.vue
```

### Principles

- Pure calculation in `lib/photo/*` (no Vue, no DOM).
- `useAstroPhotography` orchestrates location, “now”, tonight window, and derived UI state.
- Components render only; they do **not** import `astronomy-engine` directly.
- Missing coordinates must not block the page shell; location-sensitive fields are `null` with “Cần vị trí”.
- Polar / no sunset–sunrise in the search window → null events + short Vietnamese message.

### Why not a `/api/photo`?

All inputs are observer time + lat/lng + deterministic Astronomy Engine math and static setting tables. Client-side matches Meteor / Moon Calendar, stays offline-testable, and avoids round-trips for a single-night planner.

### Why not put twilight in `lib/sun.ts` only?

README already notes golden/blue as a natural `sun.ts` extension. v1 keeps photo-oriented event packaging in `lib/photo/sunEvents.ts` (may call shared sun helpers). A later thin extract into `lib/sun.ts` is allowed if duplication becomes painful; do not block the feature on that refactor.

## 5) Folder Structure

```text
types/photo.ts
lib/photo/
  nightWindow.ts
  sunEvents.ts
  milkyWay.ts
  score.ts
  moonPhoto.ts
  planets.ts
  settings.ts
  timeline.ts
  future.ts
  index.ts
app/composables/useAstroPhotography.ts
app/components/photo/
  PhotoScoreCard.vue
  MilkyWayPhotoCard.vue
  GoldenHourCard.vue
  BlueHourCard.vue
  TwilightCard.vue
  MoonPhotoCard.vue
  PlanetPhotoCard.vue
  CameraSettingsCard.vue
  PhotoTimeline.vue
  PhotoLocationPrompt.vue
app/pages/astrophotography.vue
tests/lib/photo/
  nightWindow.test.ts
  sunEvents.test.ts
  milkyWay.test.ts
  score.test.ts
  moonPhoto.test.ts
  planets.test.ts
  settings.test.ts
  timeline.test.ts
tests/composables/useAstroPhotography.test.ts
```

Wire a homepage link to `/astrophotography` (with `lat`/`lng` query when known), parallel to Moon / ISS / Telescope / Meteor.

## 6) Domain Types (`types/photo.ts`)

### Score & shared labels

```ts
export type PhotographyScoreLabel =
  | 'Poor'
  | 'Fair'
  | 'Good'
  | 'Excellent'

export interface PhotographyScore {
  stars: 1 | 2 | 3 | 4 | 5
  label: PhotographyScoreLabel
  reasons: string[] // short Vietnamese strings; max 3
  /** Always null in v1; reserved for weather. */
  cloudCoverPct: number | null
}

/** Star display mapping for UI copy:
 * 5 → ★★★★★ Excellent
 * 4 → ★★★★ Good
 * 2–3 → ★★ / ★★★ Fair
 * 1 → ★ Poor
 */
```

### Night window & sun events

```ts
export interface NightWindow {
  sunset: string // ISO UTC
  sunrise: string // ISO UTC
}

export interface TimeRange {
  start: string // ISO UTC
  end: string // ISO UTC
}

export interface GoldenHourInfo {
  morning: TimeRange | null
  evening: TimeRange | null
  /** Total minutes of morning+evening when both exist; else single side or null. */
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
```

**Altitude bands (sun, degrees):**

| Event | Approximate sun altitude |
| --- | --- |
| Golden Hour | +6° → −4° |
| Blue Hour | −4° → −6° |
| Civil twilight | 0° → −6° (bounds via rise/set-style searches at 0° / −6°) |
| Nautical twilight | −6° → −12° |
| Astronomical twilight | −12° → −18° |

Implementation: Astronomy Engine altitude-crossing searches around local sunset/sunrise. Exact helper choice (`SearchAltitude` / iterative sample) is an implementation detail; tests lock expected ordering and non-null behavior at mid-latitudes.

### Milky Way

```ts
import type { Direction, MilkyWayVisibility } from './astronomy'

export interface MilkyWayPhotoInfo {
  visibility: MilkyWayVisibility
  direction: Direction | null
  altitudeDeg: number | null
  bestTime: string | null // ISO UTC peak suggestion within night window
  coreVisible: boolean | null
  recommendedLensLabel: string
  settings: CameraSettings
}
```

**Galactic Center approximation (v1):** fixed J2000-ish RA/Dec for Sgr A* (document constants in `milkyWay.ts`, e.g. RA ≈ 17.761h, Dec ≈ −29.01°). Convert with Astronomy Engine `Equator`/`Horizon` (or equivalent star vector) at observer time.

**Core visible:** `true` when sun altitude < −18°, GC altitude ≥ 20°, and moon interference is not severe (moon below horizon **or** illumination < 30% while moon altitude is modest — align thresholds with score/MW visibility spirit). Without coordinates → `null`.

**Best time:** within tonight’s astronomical-dark window, maximize a simple score of GC altitude − moon penalty; return that instant as ISO. If no dark window or GC never rises enough → `null`.

### Moon & planets

```ts
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
  /** Heuristic 0–1 or label; v1 uses coarse brightness class. */
  brightness: 'faint' | 'moderate' | 'bright' | 'very-bright'
  recommendedMagnification: string
  /** Always null in v1; reserved for catalog magnitude. */
  magnitude: number | null
}
```

Visible planets: Mercury, Venus, Mars, Jupiter, Saturn. Visibility rule aligned with existing `getPlanetInfos`: altitude > 0 and sun altitude < −6°. Brightness class is a static map by name (Venus/Jupiter → very-bright, etc.), optionally nudged down if altitude < 15°.

### Camera settings

```ts
export type CameraSubject =
  | 'milky-way'
  | 'moon'
  | 'planet'
  | 'golden-hour'
  | 'blue-hour'

export interface CameraSettings {
  iso: { min: number; max: number }
  aperture: string // e.g. "f/2.8" or "f/8–f/11"
  exposureTime: string // human-readable, e.g. "10–20s" or "1/125s"
  focalLengthMm: { min: number; max: number }
  tripodRequired: boolean
  remoteShutter: boolean
}

/** Typed for future dynamic tweaks; unused in v1 builders. */
export interface ConditionModifiers {
  moonIlluminationPct?: number
  subjectAltitudeDeg?: number
  sunAltitudeDeg?: number
}
```

`settings.ts` exports `getCameraSettings(subject: CameraSubject): CameraSettings` from static tables. Lens labels on MW/Moon cards derive from `focalLengthMm` (e.g. “14–24mm wide”).

### Timeline

```ts
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
  label: string // Vietnamese short label
  at: string // ISO UTC (start of range or instant)
  end: string | null // ISO UTC for ranges
}

export interface PhotoTimeline {
  window: NightWindow
  markers: TimelineMarker[]
}
```

Sampling: build markers from computed events (not a dense minute grid in the UI). Optional internal sampling at 5–10 minute steps may be used to find MW peak; do not render hundreds of points.

### Aggregate snapshot (composable output)

```ts
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
  /** Featured settings for default subject (milky-way) when coords exist. */
  suggestedSettings: CameraSettings | null
}
```

Without coordinates, composable still returns a shell: location prompt flag, static suggested settings for browsing, and nulls for observer-dependent fields.

### Future-ready hooks (types only)

```ts
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

/** Reserved for multi-night planner. */
export interface DateCursorHook {
  viewedNightStart: string | null
}
```

`future.ts` may re-export these types and empty builders that return nulls — no persistence, no network.

## 7) Score Algorithm (v1)

Inputs at a representative dark-sky instant (prefer local midnight inside night window, else middle of astronomical-dark span, else “now” if already dark):

1. Start from MW visibility mapping:
   - Excellent → 5, Good → 4, Poor → 2, Not Visible → 1
2. Adjust:
   - No astronomical darkness tonight → cap at 1, reason về trời chưa tối thiên văn.
   - Moon above horizon and illumination ≥ 70% → −1 (min 1).
   - Moon below horizon during dark window → +0 already reflected in Excellent path; add reason “Trăng dưới chân trời”.
   - GC core not visible (when coords exist) → −1 if stars > 1.
3. Clamp to 1–5; label: 1 Poor, 2–3 Fair, 4 Good, 5 Excellent.
4. `reasons`: up to 3 short Vietnamese strings.
5. `cloudCoverPct`: always `null` in v1.

## 8) Moon Photography Heuristics

- Prefer best time when illumination ∈ [30, 70] and moon altitude ≥ 15° during the night (craters / terminator).
- Else if illumination ≥ 50% and moonrise exists → suggest near moonrise (silhouette / landscape).
- Else null or nearest time moon is above horizon with a note in UI via settings/lens only.
- Lens/settings from `getCameraSettings('moon')`; may mirror ranges already used in `lib/moon/photography.ts` without coupling UI to Moon Calendar components.

## 9) Composable `useAstroPhotography`

Responsibilities:

- Resolve coordinates (query → geo).
- Compute `AstroPhotographySnapshot` for `new Date()` (tonight relative to “now”).
- Expose `loading`, `error`, `needsLocation`, `refresh()`, snapshot fields.
- Do not import astronomy-engine in the composable; only call `lib/photo`.

## 10) UI Structure

Page sections in order:

1. Header + location status / `PhotoLocationPrompt`
2. `PhotoScoreCard`
3. `MilkyWayPhotoCard`
4. `GoldenHourCard`
5. `BlueHourCard`
6. `TwilightCard`
7. `MoonPhotoCard`
8. `PlanetPhotoCard`
9. `CameraSettingsCard` (default subject milky-way; optional simple subject tabs if cheap)
10. `PhotoTimeline`

Follow existing page visual patterns (SectionTitle, Tailwind tokens). No new design system. Vietnamese labels; star characters for score as in product copy.

## 11) Testing

- `sunEvents` / `nightWindow`: mid-latitude fixture has sunset before sunrise next day; golden evening before blue evening before astronomical night.
- `milkyWay`: GC altitude finite; coreVisible false when sun > −18°.
- `score`: full moon + high moon altitude → low stars; new moon + dark + good MW → high stars.
- `settings`: every `CameraSubject` returns complete `CameraSettings`.
- `timeline`: markers sorted by `at`; kinds cover dark-sky and moon events when present.
- `useAstroPhotography`: null coords → `needsLocation` true and score null; with coords → score non-null (unless polar edge handled).

## 12) Non-Goals Reminder

No weather integration, no Bortle lookup, no journal DB, no notifications, no AI captions, no server photo endpoint.
