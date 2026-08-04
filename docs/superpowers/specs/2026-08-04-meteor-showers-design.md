# Meteor Showers - Design Spec

## 1) Product Goal

Add a **Meteor Showers** module to Sky Companion: inform users about upcoming meteor showers and the best observation conditions for the current location when available.

Show an upcoming list, per-event detail, an observation guide, a yearly calendar of major showers, a visibility score when GPS/query coordinates exist, and architecture-only notification hooks.

Use **open astronomical datasets** (IMO Working List metadata) plus **Astronomy Engine** for solar-longitude peak timing and Moon illumination. Do **not** use AI. Do **not** call external paid APIs.

## 2) Confirmed Decisions

- Data approach: **client-side** pure calculations in `lib/meteor/*` + `useMeteor` (same spirit as Moon Calendar / Telescope Mode). No new Nitro meteor API.
- Catalog strategy: **static IMO-based definitions** keyed by **peak solar longitude** (λ☉). Peak date/time recomputed each calendar year; ZHR, radiant, parent comet, and prose metadata live in the catalog file. Yearly updates = edit `catalog.ts` only when IMO numbers change.
- MVP catalog: **exactly 8 showers** — Quadrantids, Lyrids, Eta Aquariids, Perseids, Orionids, Leonids, Geminids, Ursids.
- Location: **hybrid** — list + yearly calendar work without coordinates; visibility score, best direction, and location-sensitive guide lines require lat/lng (GPS, manual, or `?lat=&lng=`).
- Visibility score inputs: Moon interference + radiant altitude + expected ZHR; **cloud cover hook typed but unused** in v1 (`null`).
- Notifications: **types + builder + UI stub only** — no Notification API, service worker, or scheduling.
- Visibility map: **future hook + “Sắp có” placeholder** only.
- UI language: Vietnamese chrome; keep English shower names (Perseids, Geminids, …).
- Page: dedicated `/meteor-showers` with home entry link when coordinates are known.
- Reuse existing Moon phase illumination helpers from `lib/moon/phase` where practical; do not couple meteor UI to the Moon Calendar page.

## 3) Scope

### In Scope

- Page `/meteor-showers` (`app/pages/meteor-showers.vue`).
- **Upcoming Meteor Showers**: name, active period, peak date, peak time, expected meteors/hour (ZHR), Moon illumination, Moon interference, visibility score (or location prompt), best observation time, best direction (or location prompt), difficulty.
- **Event Detail**: description, origin constellation, radiant position, expected speed, parent comet, peak duration, visibility map placeholder.
- **Observation Guide**: recommended time, dark-sky requirement, moonlight impact, cloud reminder, equipment (naked eye / binoculars / telescope).
- **Year Calendar**: all 8 showers for the viewed year with prev/next year navigation.
- **Notifications architecture**: `MeteorNotificationHook` kinds `t-minus-24h`, `t-minus-2h`, `peak-started` + stub card.
- Future-ready type hooks: push notifications surface, offline cache, weather / cloud cover, observation reports, community photos, visibility map.
- Unit tests for catalog/peak/moon-interference/visibility/guide/notifications and composable smoke tests.
- Home entry link when coordinates known.

### Out of Scope (now)

- Real push notifications / service workers.
- Weather or cloud-cover APIs.
- Rendered visibility / geographic maps.
- Offline service-worker cache.
- Observation reports or community photo uploads.
- Expanding beyond the 8 major showers.
- AI assistance or paid astronomy APIs.
- New server API for this page.

## 4) Architecture

```text
GPS / manual / ?lat&lng (optional)
        │
        ▼
useGeolocationInput
        │
        ▼
useMeteor.ts              # year cursor, selected shower, refresh, error
        │
        ├── catalog.ts         # 8 IMO-backed shower definitions
        ├── peak.ts            # solar λ → peak Instant per year; active window
        ├── moon.ts            # illumination % + interference label at peak
        ├── visibility.ts      # radiant alt/az, direction, score (+ cloud hook)
        ├── guide.ts           # observation guide rules
        ├── notifications.ts   # build MeteorNotificationHook[] (no push)
        └── index.ts
        │
        ▼
components/meteor/* → pages/meteor-showers.vue
```

### Principles

- Pure calculation in `lib/meteor/*` (no Vue, no DOM).
- `useMeteor` orchestrates location, viewed year, selected shower id, and derived UI state.
- Components render only; they do **not** import `astronomy-engine` directly.
- Catalog is the single place to refresh IMO numbers each year; peak timing stays algorithmic.
- Missing coordinates must not block list/calendar; score and direction fields become `null` with UI copy “Cần vị trí”.

### Why not a `/api/meteor`?

Peaks and scores are deterministic from catalog + time + optional observer position. Client-side calculation matches Moon Calendar, stays testable offline, and avoids round-trips for a yearly static set of eight events.

## 5) Folder Structure

```text
types/meteor.ts
lib/meteor/
  catalog.ts
  peak.ts
  moon.ts
  visibility.ts
  guide.ts
  notifications.ts
  index.ts
app/composables/useMeteor.ts
app/components/meteor/
  MeteorUpcomingList.vue
  MeteorEventDetail.vue
  MeteorObservationGuide.vue
  MeteorVisibilityScore.vue
  MeteorYearCalendar.vue
  MeteorNotificationsStub.vue
app/pages/meteor-showers.vue
tests/lib/meteor/
  catalog.test.ts
  peak.test.ts
  moon.test.ts
  visibility.test.ts
  guide.test.ts
  notifications.test.ts
tests/composables/useMeteor.test.ts
```

Wire a homepage link to `/meteor-showers` (with `lat`/`lng` query when known), parallel to Moon / ISS / Telescope.

## 6) Domain Types (`types/meteor.ts`)

### Catalog & year instance

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
  /** IMO / IAU shower code when known, e.g. "PER" */
  iauCode: string
  description: string
  originConstellation: string
  /** Peak solar longitude in degrees (IMO Working List). */
  peakSolarLongitudeDeg: number
  /** Active solar-longitude window [start, end] inclusive degrees. */
  activeSolarLongitudeDeg: { start: number; end: number }
  zhr: number
  radiantRaHours: number
  radiantDecDeg: number
  speedKmS: number
  parentComet: string | null
  /** Typical useful peak window length in hours. */
  peakDurationHours: number
  difficulty: MeteorDifficulty
  /** Source note for yearly maintenance (IMO citation). */
  sourceNote: string
}

export interface MeteorShowerEvent {
  id: MeteorShowerId
  year: number
  name: string
  peakAt: string // ISO UTC
  activeStart: string // ISO UTC
  activeEnd: string // ISO UTC
  zhr: number
  difficulty: MeteorDifficulty
}
```

### Moon interference & cards

```ts
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
  reasons: string[] // short Vietnamese strings for UI
  /** Always null in v1; reserved for weather integration. */
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
  /** Architecture stub — UI shows “Sắp có”. */
  visibilityMap: MeteorVisibilityMapHook
}
```

### Observation guide

```ts
export type MeteorEquipmentKind = 'naked-eye' | 'binoculars' | 'telescope'

export interface MeteorEquipmentAdvice {
  kind: MeteorEquipmentKind
  recommended: boolean
  note: string // Vietnamese
}

export interface MeteorObservationGuide {
  recommendedTime: string
  darkSkyRequirement: string
  moonlightImpact: string
  cloudReminder: string
  equipment: MeteorEquipmentAdvice[]
}
```

### Notifications (architecture)

```ts
export type MeteorNotificationKind =
  | 't-minus-24h'
  | 't-minus-2h'
  | 'peak-started'

export interface MeteorNotificationHook {
  eventId: string
  showerId: MeteorShowerId
  kind: MeteorNotificationKind
  fireAt: string // ISO
  title: string
  body: string
}
```

`lib/meteor/notifications.ts` exports `buildMeteorNotificationHooks(event: MeteorShowerEvent): MeteorNotificationHook[]` that derives the three fire times from `peakAt`. No browser scheduling in this version.

### Future-ready hooks (types only)

```ts
export interface MeteorVisibilityMapHook {
  status: 'unavailable'
  message: string
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

No UI for these hooks in MVP except:

- Notifications stub card (“Sắp có”).
- Visibility map placeholder inside event detail.
- Score type field `cloudCoverPct: null`.

## 7) Business Logic

### Catalog (`lib/meteor/catalog.ts`)

Export `METEOR_SHOWER_CATALOG: readonly MeteorShowerDefinition[]` with the eight showers. Each entry documents IMO Working List fields used (peak λ☉, ZHR, radiant, speed, parent body) in `sourceNote`.

Approximate IMO peak solar longitudes (verify against current IMO Working List when implementing; values below are the design baseline):

| Id | Name | Peak λ☉ (°) | Typical ZHR |
|----|------|------------:|------------:|
| quadrantids | Quadrantids | 283.15 | 120 |
| lyrids | Lyrids | 32.32 | 18 |
| eta-aquariids | Eta Aquariids | 45.5 | 50 |
| perseids | Perseids | 140.0 | 100 |
| orionids | Orionids | 208.0 | 20 |
| leonids | Leonids | 235.27 | 15 |
| geminids | Geminids | 262.2 | 150 |
| ursids | Ursids | 270.7 | 10 |

Active windows use each shower’s published solar-longitude activity range from the same list (implement exact numbers from IMO tables in `catalog.ts`).

### Peak timing (`lib/meteor/peak.ts`)

- `findSolarLongitudeTime(year, targetLonDeg): Date` — search within the calendar year (and handle year-boundary wrap for early-January showers like Quadrantids) for the instant when apparent solar longitude equals `targetLonDeg`.
- `buildShowerEvent(def, year): MeteorShowerEvent` — peak + active start/end from λ windows.
- `listShowerEventsForYear(year): MeteorShowerEvent[]` — all eight, sorted by `peakAt`.
- `listUpcomingShowerEvents(now, limit?): MeteorShowerEvent[]` — from `now` forward, including next year’s early showers if needed so the upcoming list never goes empty in late December.

### Moon at peak (`lib/meteor/moon.ts`)

- Illumination at `peakAt` via existing moon illumination helper (`illuminatedPercentage` / Astronomy Engine Moon illumination).
- Interference mapping:

| Illumination % | Interference |
|---------------:|--------------|
| < 10 | none |
| 10 – < 30 | low |
| 30 – < 60 | moderate |
| 60 – < 85 | high |
| ≥ 85 | severe |

### Visibility (`lib/meteor/visibility.ts`)

When coordinates are present at `peakAt`:

1. Convert radiant RA/Dec → local altitude/azimuth (Astronomy Engine equator → horizon).
2. `bestDirection` from azimuth buckets: N, NE, E, SE, S, SW, W, NW.
3. Score heuristic (deterministic):

   - Start from radiant altitude: `<0` → 1 base; `0–15` → 2; `15–40` → 3; `40–70` → 4; `≥70` → 5.
   - Adjust by Moon interference: none +0; low −0; moderate −1; high −2; severe −3 (floor at 1).
   - ZHR bonus: `zhr ≥ 100` → +1; `zhr ≥ 50` → +0 (no change beyond altitude); `zhr < 20` → −1 if stars > 1.
   - Clamp to 1–5; map labels like Moon: 1 Poor, 2–3 Fair, 4 Good, 5 Excellent.
   - `cloudCoverPct` always `null` in v1.
   - `reasons`: up to 3 short Vietnamese strings.

When coordinates are absent: `visibilityScore = null`, `bestDirection = null`.

**Best observation time label (MVP — fixed rule):** use the heuristic “sau nửa đêm đến trước bình minh (giờ địa phương) vào đêm peak”. When coordinates exist and radiant altitude at local midnight on the peak date is below 20°, append a short note that the radiant is still low then (prefer later pre-dawn hours). Full astronomical-twilight search is deferred (not in this version).

### Guide (`lib/meteor/guide.ts`)

Build `MeteorObservationGuide` from event + optional score/moon context:

- Recommended time mirrors best-observation label.
- Dark-sky requirement: remind to avoid city lights; darker sites improve faint meteors.
- Moonlight impact: sentence derived from `MoonInterference`.
- Cloud reminder: static Vietnamese reminder that clouds block meteors; points at future weather hook.
- Equipment:
  - Naked eye: `recommended: true` — primary method.
  - Binoculars: optional for tracing trains / wide rich fields; not for scanning the whole sky.
  - Telescope: `recommended: false` — field of view too narrow for shower watching.

### Notifications builder (`lib/meteor/notifications.ts`)

For a given `MeteorShowerEvent`:

| Kind | `fireAt` |
|------|----------|
| `t-minus-24h` | peakAt − 24h |
| `t-minus-2h` | peakAt − 2h |
| `peak-started` | peakAt |

Titles/bodies in Vietnamese, include shower `name`. Used only for architecture tests + future push wiring; UI stub does not schedule them.

## 8) Composable (`useMeteor`)

```ts
useMeteor(coordinates: Ref<Coordinates | null>, when?: Date | (() => Date))
```

Exposes:

- `viewedYear`, `goToPrevYear`, `goToNextYear`
- `selectedId`, `selectShower`, `clearSelected`
- `upcoming: MeteorUpcomingCard[]`
- `yearEvents: MeteorShowerEvent[]` (calendar)
- `selectedDetail: MeteorEventDetail | null`
- `selectedGuide: MeteorObservationGuide | null`
- `selectedScore: MeteorVisibilityScore | null`
- `notificationHooks: MeteorNotificationHook[]` (for selected or next upcoming; not scheduled)
- `error`, `refresh`

Recompute on coordinate changes, year changes, selection changes, and `refresh()`. Default selection: next upcoming shower (or first of viewed year if browsing another year).

Error copy (Vietnamese): calculation failures surface a short message; missing GPS is not an error.

## 9) UI Composition

Page structure (top → bottom), matching existing `SkyCard` / `SectionTitle` patterns:

1. Header + location bootstrap (same GPS / manual / query pattern as moon-calendar; **list remains usable without coords**).
2. `MeteorUpcomingList` — selectable cards with the upcoming fields.
3. `MeteorVisibilityScore` — for selected shower; location prompt when score is null.
4. `MeteorEventDetail` — detail fields + visibility map “Sắp có”.
5. `MeteorObservationGuide`.
6. `MeteorYearCalendar` — year label, prev/next, eight event rows/chips.
7. `MeteorNotificationsStub` — “Sắp có”; explain push arrives in a later version.

No new visual design system; reuse slate/sky Tailwind language from Moon / ISS pages.

## 10) Testing

- `catalog.test.ts` — eight ids present; unique; required fields populated.
- `peak.test.ts` — known-year peaks land near expected calendar dates (tolerance ±1 day); Quadrantids year-boundary behavior; upcoming list crosses year end.
- `moon.test.ts` — interference bucket boundaries.
- `visibility.test.ts` — altitude buckets, moon penalties, ZHR bonus, null coords → null score/direction.
- `guide.test.ts` — naked-eye recommended; telescope not recommended.
- `notifications.test.ts` — three hooks with correct offsets.
- `useMeteor.test.ts` — year navigation, selection, upcoming without coords, score appears when coords set.

## 11) Future Extension Map

| Future feature | Extension point |
|----------------|-----------------|
| Push notifications | Schedule from `MeteorNotificationHook`; replace stub with `MeteorPushNotificationHook` UI |
| Offline cache | Persist catalog + last computed year events via `MeteorOfflineCacheHook` |
| Weather / cloud cover | Fill `CloudCoverHook` / `MeteorWeatherHook`; feed `visibilityScore.cloudCoverPct` |
| Visibility map | Replace `MeteorVisibilityMapHook.status` and detail placeholder |
| Observation reports | `MeteorObservationReportHook` storage later |
| Community photos | `MeteorCommunityPhotoHook` gallery later |
| More showers | Append definitions to `METEOR_SHOWER_CATALOG` without API changes |

## 12) Acceptance Criteria

- `/meteor-showers` renders upcoming showers and a yearly calendar for the eight named showers.
- Peak dates update by year from solar longitude (no hard-coded calendar dates per year).
- With coordinates: Moon illumination/interference, visibility score, and best direction populate.
- Without coordinates: list + calendar + detail metadata still work; score/direction show location needed.
- Observation guide always available for the selected shower.
- Notifications section is visibly a stub; types + builder exist and are tested.
- Visibility map is visibly a stub.
- No AI; no paid APIs; no new meteor server route.
- Unit tests cover peak, moon interference, visibility, guide, notifications, and composable smoke.
- Homepage links into the page when coordinates are known.
