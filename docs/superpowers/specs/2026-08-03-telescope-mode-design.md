# Telescope Mode - Design Spec

## 1) Product Goal

Extend Sky Companion with **Telescope Mode**: guide amateur astronomers to locate celestial objects with binoculars or telescopes, step by step.

Use only GPS, compass, device orientation, and astronomical calculations. Do **not** build AR.

The feature must be production-quality, modular, strongly typed, and ready for future GoTo, Bluetooth mounts, Messier/NGC catalogs, camera assistance, and AR guidance without major refactoring.

## 2) Confirmed Decisions

- Architecture: layered domain modules under existing Nuxt conventions (`types/`, `lib/telescope/`, `composables/`, `components/telescope/`, `pages/telescope.vue`).
- Deep-sky positions: local fixed RA/Dec catalog + `astronomy-engine` conversion to alt/az for ranking and guidance.
- Moon & planets: dynamic positions via `astronomy-engine` (same approach as existing `lib/planets.ts` / `lib/moon.ts`).
- Guidance input: **hybrid** — prefer DeviceOrientation (compass + pitch); fall back to manual az/alt controls when unsupported or denied.
- Telescope profiles: mock local data; selected profile affects lock threshold (via FOV) and instrument recommendations.
- UI language: Vietnamese labels; keep international English celestial object names (Moon, Saturn, Andromeda Galaxy, etc.).
- Star hopping: interfaces + stub API only; no full algorithm in this version.
- No database; no new sky API required for MVP (client-side `lib/telescope` calculations are acceptable and preferred to keep telescope domain isolated).
- No AR, Bluetooth, or GoTo implementation in this version (types/hooks only).

## 3) Scope

### In Scope

- Page: `/telescope` (`app/pages/telescope.vue`).
- **Tonight's Best Targets** ranked list with:
  - name, object type, altitude, azimuth, direction
  - visibility score (1–5), best observation time
  - difficulty, eye / binocular / telescope recommendation
- **Target Detail**: altitude, azimuth, rise/set, constellation, apparent magnitude, distance (when available).
- **Telescope Guidance**: rotate left/right, raise/lower, Target Locked.
- **Star Hopping**: reusable interfaces (`HopStep`, `ReferenceStar`, `TargetObject`) + stub builder.
- **Telescope Profiles**: interfaces (`Telescope`, `Eyepiece`, `Magnification`, `FieldOfView`) + local mock data + selector UI.
- Link entry from home (and optionally compass) with `lat`/`lng` query when available.
- Unit tests for ranking, guidance deltas/lock, profile optics math, star-hop stub contract.

### Seed catalog objects

- Moon
- Mercury, Venus, Mars, Jupiter, Saturn
- Andromeda Galaxy
- Orion Nebula
- Pleiades

### Out of Scope (now)

- AR guidance UI or camera overlay.
- Bluetooth / GoTo mount control.
- Full Messier / NGC / deep-sky database.
- Full star-hop pathfinding algorithm.
- Weather, light pollution APIs, authentication, persistence.

## 4) Architecture

```text
GPS / manual coords          DeviceOrientation (or manual az/alt)
        │                              │
        ▼                              ▼
useGeolocationInput            device pointing (hybrid)
        │                              │
        └──────────┬───────────────────┘
                   ▼
           useTelescope.ts
                   │
     ┌─────────────┼──────────────────┐
     ▼             ▼                  ▼
 catalog       ranking            guidance
 profiles      starHop (stub)     position math
                   │
                   ▼
        components/telescope/*
                   ▼
           pages/telescope.vue
```

### Principles

- Pure calculation in `lib/telescope/*` (no Vue, no DOM).
- `useTelescope` orchestrates location, selected target, profile, pointing, and derived UI state.
- Components render only; they do not call `astronomy-engine` directly.
- Catalog is a swappable data module (`CatalogProvider`-ready) so Messier/NGC can replace the seed list later.
- Guidance mode is typed (`manual` | `sensor` | future `goto` | `ar`) so adapters can plug in without rewriting UI.

### Why not extend `/api/sky`?

Telescope Mode adds ranking, profiles, live pointing, and a larger object model. Keeping it in `lib/telescope` avoids bloating `SkySnapshot` and homepage contracts. Shared helpers (`azimuthToDirection`, existing planet/moon math patterns) may be reused or thin-wrapped.

## 5) Folder Structure

```text
types/telescope.ts
lib/telescope/
  catalog.ts          # seed TargetObject definitions (RA/Dec / dynamic body keys)
  position.ts         # observer alt/az, rise/set for a TargetObject
  ranking.ts          # Tonight's Best Targets scoring + sort
  guidance.ts         # deltas, lock threshold, instruction strings
  profiles.ts         # mock telescopes/eyepieces + mag/FOV helpers
  starHop.ts          # stub buildStarHopPlan
app/composables/
  useTelescope.ts
  useDevicePointing.ts  # hybrid sensor + manual fallback (required split from useTelescope)
app/components/telescope/
  TonightTargetsList.vue
  TargetDetailCard.vue
  TelescopeGuidancePanel.vue
  TelescopeProfilePicker.vue
  StarHopPlaceholder.vue
app/pages/telescope.vue
```

## 6) Domain Types (`types/telescope.ts`)

### Core sky objects

```ts
type ObjectType =
  | 'moon'
  | 'planet'
  | 'galaxy'
  | 'nebula'
  | 'starCluster'
  | 'star'
  | 'other'

type RecommendedInstrument = 'eye' | 'binocular' | 'telescope'
type Difficulty = 'easy' | 'moderate' | 'hard'

interface TargetObject {
  id: string
  name: string
  objectType: ObjectType
  /** Hours; null for dynamic solar-system bodies resolved via astronomy-engine */
  raHours: number | null
  /** Degrees; null for dynamic bodies */
  decDeg: number | null
  constellation: string
  apparentMagnitude: number | null
  distanceLy: number | null
  difficulty: Difficulty
  recommendedInstrument: RecommendedInstrument
  /** For Body.* planets/moon when ra/dec are not fixed catalog values */
  dynamicBody?: 'moon' | 'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn'
}
```

### Ranked / detail views

```ts
interface RankedTarget {
  target: TargetObject
  altitude: number
  azimuth: number
  direction: Direction // reuse existing Direction type
  visibilityScore: 1 | 2 | 3 | 4 | 5
  bestObservationTime: string // ISO
  difficulty: Difficulty
  recommendedInstrument: RecommendedInstrument
}

interface TargetDetail extends RankedTarget {
  riseTime: string | null
  setTime: string | null
}
```

### Guidance

```ts
type GuidanceMode = 'manual' | 'sensor' | 'goto' | 'ar'

interface DevicePointing {
  azimuth: number
  altitude: number
  source: 'sensor' | 'manual'
  accuracyDeg?: number | null
}

interface GuidanceInstruction {
  status: 'need-target' | 'below-horizon' | 'aligning' | 'locked'
  deltaAzimuthDeg: number  // signed: negative = rotate left, positive = right (document convention in code)
  deltaAltitudeDeg: number // signed: positive = raise, negative = lower
  messages: string[]       // Vietnamese UI strings, e.g. "Xoay trái 12°"
  locked: boolean
}
```

Convention (explicit): **negative Δaz → rotate left (counterclockwise on compass heading toward target)**; **positive Δaz → rotate right**; **positive Δalt → raise**; **negative Δalt → lower**. Implement once in `guidance.ts` and test it.

### Star hopping (future algorithm surface)

```ts
interface ReferenceStar {
  id: string
  name: string
  raHours: number
  decDeg: number
  magnitude: number
}

interface HopStep {
  id: string
  order: number
  from: ReferenceStar | TargetObject
  to: ReferenceStar | TargetObject
  angularDistanceDeg: number
  instruction: string
}
```

### Telescope profiles

```ts
interface Telescope {
  id: string
  name: string
  apertureMm: number
  focalLengthMm: number
  type: 'binocular' | 'refractor' | 'reflector' | 'compound' | 'other'
}

interface Eyepiece {
  id: string
  name: string
  focalLengthMm: number
  apparentFovDeg: number
}

interface Magnification {
  value: number
}

interface FieldOfView {
  trueFovDeg: number
}

interface TelescopeProfile {
  id: string
  label: string
  telescope: Telescope
  eyepiece: Eyepiece | null // null for fixed binoculars
  magnification: Magnification
  fieldOfView: FieldOfView
}
```

### Future-ready hooks (types only)

```ts
interface CatalogProvider {
  listTargets(): TargetObject[] | Promise<TargetObject[]>
}

interface TelescopeMountAdapter {
  mode: Extract<GuidanceMode, 'goto' | 'sensor'>
  connect?(): Promise<void>
  slewTo?(altAz: { altitude: number; azimuth: number }): Promise<void>
  disconnect?(): Promise<void>
}
```

## 7) Business Logic

### Position (`lib/telescope/position.ts`)

Given observer (`lat`, `lng`), `when: Date`, and `TargetObject`:

- Resolve equatorial coordinates (catalog RA/Dec or `astronomy-engine` for dynamic bodies).
- Convert to horizontal altitude/azimuth.
- Compute rise/set when applicable (reuse patterns from moon/sun modules where practical).
- Map azimuth → `Direction` via existing `azimuthToDirection`.

### Ranking (`lib/telescope/ranking.ts`)

Score each seed target for “tonight”. Night window: from `now` until the next sunrise at the observer (sample on a fixed interval, e.g. every 30 minutes).

1. Always include every seed target in the ranked list (never drop). If currently below horizon, cap `visibilityScore` at **1** and sort after above-horizon objects; detail view remains available when selected.
2. Prefer darker sky (sun altitude below astronomical twilight ≈ −18° best; civil/nautical weaker).
3. Higher altitude → higher score.
4. Brighter apparent magnitude → higher score / easier difficulty bias.
5. For deep-sky: penalize bright moon + small angular separation from moon.
6. Clamp to integer visibility score **1–5**.
7. `bestObservationTime`: sample time in the night window with the best local score for that object (ISO string).
8. Instrument recommendation may be adjusted by selected profile FOV/magnification (e.g. very faint object stays telescope-only).

Sort descending by `visibilityScore`, then altitude, then magnitude (brighter first).

### Guidance (`lib/telescope/guidance.ts`)

Inputs: target alt/az, current `DevicePointing`, profile `FieldOfView`.

- Compute shortest-path Δazimuth in (−180, 180].
- Δaltitude = targetAlt − pointingAlt.
- Lock when `abs(Δaz) <= lockThreshold` and `abs(Δalt) <= lockThreshold`.
- `lockThreshold = clamp(trueFovDeg * 0.25, 0.5, 2.0)` degrees.
- If target altitude < 0 → status `below-horizon` (no lock).
- Emit Vietnamese instruction messages; when locked, messages include the English token `Target Locked` (plus a Vietnamese equivalent such as “Đã khóa mục tiêu”).

### Profiles (`lib/telescope/profiles.ts`)

- Mock profiles (examples):
  - Binocular 10×50 (fixed mag/FOV approximation)
  - Reflector 130/650 + 25 mm eyepiece
  - Reflector 130/650 + 10 mm eyepiece
- `magnification = telescope.focalLengthMm / eyepiece.focalLengthMm` (binoculars: stated power).
- `trueFovDeg ≈ apparentFovDeg / magnification` when eyepiece present; binoculars use approximate stated FOV.

### Star hop stub (`lib/telescope/starHop.ts`)

```ts
function buildStarHopPlan(target: TargetObject, _refs?: ReferenceStar[]): HopStep[]
```

Returns `[]` for now; documents the future contract in JSDoc. UI shows a “Sắp có” placeholder that references the architecture.

## 8) Composable API

`useTelescope()` responsibilities:

- Resolve coordinates (GPS via `useGeolocationInput`, or route query `lat`/`lng`, or manual fallback).
- Hold `selectedTargetId`, `selectedProfileId`.
- Compute `rankedTargets`, `selectedDetail`.
- Expose pointing state from hybrid sensor/manual helper.
- Expose `guidance` derived from detail + pointing + profile FOV.
- Expose `profiles` mock list and optics for the selected profile.
- Expose `starHopSteps` from stub (empty).

Sensor helper (`useDevicePointing`, required):

- Request / listen to DeviceOrientation when available.
- On failure or unsupported: `source: 'manual'` with adjustable azimuth/altitude defaults (e.g. 0° az, 30° alt).
- Never block the rest of the page if sensors fail.

## 9) UI (`/telescope`)

Visual language: match existing Sky Companion layout (`bg-slate-950`, sky accents, `SkyCard` / `SectionTitle` patterns). Vietnamese chrome; English object names.

Sections in order:

1. Header — Telescope Mode intro + nav links (home / compass when coords exist).
2. Location — loading, permission denied + manual form (reuse existing components).
3. Profile picker — select mock telescope/eyepiece combo; show mag + FOV.
4. Tonight's Best Targets — ranked interactive list; selecting sets detail + guidance target.
5. Target Detail — metrics listed in scope.
6. Telescope Guidance — live instructions + locked state; manual pointing controls when needed.
7. Star Hopping — architecture placeholder only.

Entry points:

- Home: link “Telescope Mode” when coordinates are known (`/telescope?lat=&lng=`).
- Optional: same pattern from compass page.

## 10) Error & Edge Cases

| Case | Behavior |
|------|----------|
| GPS denied / unavailable | Manual lat/lng form |
| DeviceOrientation denied / missing | Manual pointing controls + short explanation |
| No target selected | Guidance status `need-target` |
| Target below horizon | Detail visible; guidance `below-horizon` |
| Calculation failure | Inline error + retry (location / recompute) |

## 11) Testing

Vitest (follow existing `tests/lib` / `tests/composables` patterns):

- `ranking`: ordering, score bounds 1–5, below-horizon handling.
- `guidance`: left/right/raise/lower signs, lock with FOV-based threshold, below-horizon.
- `profiles`: magnification and true FOV formulas.
- `starHop`: stub returns empty array and accepts a `TargetObject`.
- Optional composable smoke test for selection → detail wiring with mocked pointing.

## 12) Future Extensions (no implementation now)

| Feature | Hook |
|---------|------|
| GoTo Telescope | `TelescopeMountAdapter.slewTo` + `GuidanceMode: 'goto'` |
| Bluetooth Telescope | adapter `connect` / `disconnect` |
| Messier / NGC / deep-sky catalog | `CatalogProvider` replacing seed `catalog.ts` |
| Camera Assistance | new guidance consumer; keep `guidance.ts` pure |
| AR Guidance | `GuidanceMode: 'ar'` overlay using same alt/az deltas |

## 13) Success Criteria

- User with location can open `/telescope`, see ranked tonight targets, inspect detail, pick a profile, and receive actionable alignment instructions.
- Sensor path and manual fallback both reach Target Locked for an above-horizon target.
- Star-hop and mount/catalog future types exist without implying unfinished UI features beyond the placeholder.
- Domain logic is unit-tested and UI-free.
