# ISS Now - Design Spec

## 1) Product Goal

Add an **ISS Now** experience to Sky Companion: show the International Space Station’s current position, altitude, speed, ground track, next visible pass (with duration), and estimated brightness for the user’s location.

Use **TLE + local SGP4 propagation** (no paid tracking API). Do **not** implement real push notifications in this version — only a “Sắp có” stub.

## 2) Confirmed Decisions

- Scope MVP: Current Position, Altitude, Speed, Ground Track, Next Pass, Duration, Brightness; Notifications stub only.
- Data approach: Hybrid TLE/SGP4 — fetch public TLE (e.g. Celestrak), cache on server, compute position/track/pass/brightness locally ($0 tracking API fees).
- Ground Track: SVG schematic world map (no Mapbox dependency).
- Page: dedicated `/iss` with link from home (same pattern as Compass / Telescope).
- Architecture: layered modules under existing Nuxt conventions (`types/`, `lib/iss/`, `server/api`, `composables/`, `components/iss/`, `pages/iss.vue`).
- UI language: Vietnamese chrome; keep technical labels like “ISS”, magnitude numbers, and lat/lng conventions clear.
- Single primary API: `GET /api/iss` with optional `lat`/`lng` (when present, include `nextPass` and observer-relative brightness).

## 3) Scope

### In Scope

- Replace mocked `server/api/iss.get.ts` with real TLE-backed snapshot.
- Page `/iss` sections listed in Product Goal.
- SVG ground track for ~1–2 orbits with current-position marker.
- Next visible pass prediction for observer GPS/manual coordinates.
- Estimated visual magnitude + relative brightness label.
- Notifications placeholder card (“Sắp có”) — no Notification API, no service worker, no scheduling.
- Unit tests for propagation helpers, ground-track sampling, pass finder, API contract.
- Home entry link when coordinates are known (`/iss?lat=&lng=`).

### Out of Scope (now)

- Browser / push notifications and reminder scheduling.
- Mapbox or interactive slippy map.
- Multi-satellite catalog (Starlink, Hubble, etc.).
- AR sky overlay for ISS.
- Auth, database, Redis (in-memory TLE cache only).

## 4) Architecture

```text
Celestrak TLE (HTTP fetch)
        │
        ▼
  lib/iss/tle.ts          # fetch + in-memory cache (3–6h) + bundled fallback
        │
        ▼
  lib/iss/propagate.ts    # SGP4 → lat/lng/alt/velocity (satellite.js)
        │
        ├── groundTrack.ts
        ├── passes.ts
        └── brightness.ts
        │
        ▼
  server/api/iss.get.ts   # optional lat/lng validation → IssSnapshot
        │
        ▼
  useIss.ts + useGeolocationInput
        │
        ▼
  components/iss/* → pages/iss.vue
```

### Principles

- Pure calculation in `lib/iss/*` (no Vue, no DOM).
- Nitro handler validates query, orchestrates TLE + lib calls, returns typed JSON.
- UI never talks to Celestrak directly.
- Keep business logic unit-testable with fixture TLEs.

### Dependency

Add `satellite.js` as the SGP4 library (exact package name in `package.json`). Use it only from `lib/iss` / server path — not from browser bundles if tree-shaken poorly; prefer importing in Nitro/server and `lib` consumed by server tests. If client-side reuse is needed later, revisit bundling; MVP computation stays server-side via `/api/iss`.

## 5) Folder Structure

```text
types/iss.ts                 # IssPosition, IssGroundTrackPoint, IssPassPrediction, IssSnapshot
lib/iss/
  tle.ts
  propagate.ts
  groundTrack.ts
  passes.ts
  brightness.ts
  fixtures/iss-tle.txt       # offline fallback + tests
server/api/iss.get.ts        # replace mock
app/composables/useIss.ts
app/components/iss/
  IssPositionCard.vue
  IssStatsCard.vue           # altitude + speed
  IssGroundTrackMap.vue      # SVG schematic
  IssNextPassCard.vue        # includes duration
  IssBrightnessCard.vue
  IssNotificationsStub.vue
app/pages/iss.vue
```

Update `types/api.ts`: deprecate or type-alias old `ISSPass` toward `IssPosition` / `IssSnapshot` with a clear migration note in `docs/api.md`. Prefer exporting the new shapes from `types/iss.ts` and re-exporting from `types/api.ts` if needed for compatibility.

## 6) Domain Types

```ts
export interface IssPosition {
  timestamp: string
  latitude: number
  longitude: number
  altitudeKm: number
  velocityKph: number
}

export interface IssGroundTrackPoint {
  latitude: number
  longitude: number
  timestamp: string
}

export interface IssPassPrediction {
  riseTime: string
  maxTime: string
  setTime: string
  durationSeconds: number
  maxElevationDeg: number
  direction: string
  magnitude: number | null
}

export type BrightnessLabel = 'Bright' | 'Moderate' | 'Dim' | 'Not Visible'

export interface IssBrightness {
  magnitude: number | null
  label: BrightnessLabel
}

export interface IssSnapshot {
  position: IssPosition
  groundTrack: IssGroundTrackPoint[]
  nextPass: IssPassPrediction | null
  brightness: IssBrightness | null  // null when no observer coords
  tleEpoch: string
  source: 'live-tle' | 'cached-tle' | 'fallback-tle'
}
```

## 7) Business Logic

### TLE (`lib/iss/tle.ts`)

- Fetch ISS line set from Celestrak: `https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=tle` (parse the `ISS (ZARYA)` block). Document the URL as a named constant `ISS_TLE_URL`.
- In-memory cache TTL: **4 hours** (explicit).
- On network failure: use last good cache if still present; else bundled fixture TLE and set `source: 'fallback-tle'`.
- Never throw uncaught network errors to the client — degrade with `source` flag.

### Propagate (`lib/iss/propagate.ts`)

- Input: TLE + `when: Date`.
- Output: `IssPosition` (lat/lng degrees, altitude km, velocity km/h).
- Round lat/lng to 4 decimals; altitude/velocity to 1 decimal (match existing mock precision style).

### Ground track (`lib/iss/groundTrack.ts`)

- Sample positions every **60 seconds** for a fixed window: from `now - 15 minutes` through `now + 120 minutes` (135 minutes total → ~136 points including endpoints). Constants named in code (`TRACK_LOOKBACK_MS`, `TRACK_LOOKAHEAD_MS`, `TRACK_STEP_MS`).
- Handle antimeridian splits for SVG path drawing (break polyline when longitude jumps > 180°).

### Passes (`lib/iss/passes.ts`)

Given observer `lat`/`lng` and TLE:

1. Search forward **36 hours** from `now` with coarse step **60 seconds**, then refine rise/set crossings to **~5 second** precision by binary search or short stepping.
2. A candidate pass starts when ISS altitude relative to observer crosses **0°** upward and ends when it crosses **0°** downward.
3. Visible pass requires:
   - `maxElevationDeg >= 10`
   - Sun altitude at observer `< -6°` at `maxTime` (astronomical-ish darkness heuristic)
   - ISS sunlit at `maxTime` (not in Earth shadow — use library eclipse flag or simple shadow cone heuristic)
4. Return the soonest visible pass, or `null`.
5. `durationSeconds = floor((setTime - riseTime) / 1000)`.
6. `direction`: compass labels from rise azimuth → set azimuth using existing `azimuthToDirection` style (e.g. `"South-West → North-East"`).

### Brightness (`lib/iss/brightness.ts`)

- Estimate visual magnitude from range + phase angle (standard satellite magnitude approximation; document formula in code comments).
- Map to label:
  - magnitude `<= -2` → `Bright`
  - `<= 0` → `Moderate`
  - `<= 3` → `Dim`
  - else / not sunlit / daytime → `Not Visible`
- When observer coords absent: `brightness: null` on snapshot.
- When coords present but ISS currently not a viewing opportunity: still return magnitude for **current** geometry if meaningful, else `Not Visible`.

## 8) API

### `GET /api/iss`

Query (optional):

| Param | Type | Notes |
|-------|------|--------|
| `lat` | number | −90…90; if provided, `lng` required |
| `lng` | number | −180…180; if provided, `lat` required |

Validation: reuse / extend Zod patterns from `utils/validation.ts` (same spirit as sky query).

Response: `IssSnapshot`

- Without coords: `nextPass: null`, `brightness: null`, still include `position` + `groundTrack`.
- With coords: populate `nextPass` and `brightness`.

Errors: typed `ApiError` via existing error helper patterns (`400` validation, `502` if even fallback TLE cannot be loaded — rare).

Polling: client may refresh every **20 seconds** while the page is visible; server cache prevents TLE refetch storms.

## 9) Composable & UI

### `useIss`

- Accepts `Ref<Coordinates | null>`.
- Fetches `/api/iss` with optional query.
- Exposes `snapshot`, `loading`, `error`, `refresh`.
- Optional interval refresh (20s) while mounted; pause when document hidden if easy (`visibilitychange`).

### Page `/iss`

Section order:

1. Header — ISS Now intro + home link  
2. Location — loading / permission / manual (reuse existing components)  
3. Position card  
4. Altitude + Speed card  
5. Ground Track SVG  
6. Next Pass (+ Duration) — disabled/empty copy if no coords or `nextPass === null`  
7. Brightness  
8. Notifications stub  

Visual language: existing `SkyCard` / `SectionTitle`, slate-950 / sky accents.

Home: add “ISS Now” link when coordinates known.

## 10) Error & Edge Cases

| Case | Behavior |
|------|----------|
| GPS denied | Manual lat/lng; pass/brightness wait for coords |
| TLE network fail | Cached or fallback TLE; show subtle `source` note |
| No visible pass in 36h | `nextPass: null` + Vietnamese explanation |
| Antimeridian track | Split SVG paths |
| Tab hidden | Stop or slow polling |

## 11) Testing

Vitest:

- `propagate` with fixture TLE → finite lat/lng/alt/speed in expected bands for ISS (~400 km alt class).
- `groundTrack` length / time ordering / antimeridian split helper.
- `passes`: fixture observer where a known-visible-ish geometry can be asserted at least for structure (`durationSeconds > 0` when pass found) — prefer deterministic frozen `when` + fixture TLE.
- `brightness` label thresholds.
- API handler: no-query snapshot; with lat/lng; invalid query → 400.

## 12) Future Extensions

| Feature | Hook |
|---------|------|
| Push notifications | Schedule from `IssPassPrediction.riseTime`; keep stub UI until then |
| Mapbox ground track | Swap SVG component for Mapbox layer using same `groundTrack` points |
| Multi-satellite | Generalize TLE catalog + `satelliteId` |
| AR guidance | Reuse observer alt/az of ISS from pass geometry |

## 13) Success Criteria

- User opens `/iss` and sees live-ish position, altitude, speed updating on refresh.
- SVG ground track shows a continuous (or intentionally split) orbital path with a “now” marker.
- With GPS/manual location, user sees next pass times, duration, and brightness estimate — or a clear empty state.
- Notifications section is visibly a stub only.
- No paid ISS tracking API; TLE fetch is cached.
- Domain logic covered by unit tests; mock-only `/api/iss` is gone.
