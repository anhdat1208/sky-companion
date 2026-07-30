# What's Above Me? - MVP Design

## 1) Product Goal

Build a production-quality MVP web app that tells users what celestial objects are above them based on GPS location and current time.

The MVP must be clean, modular, strongly typed, and easy to extend without major refactoring.

## 2) Confirmed Decisions

- Architecture approach: Nuxt monolith with thin client and server-side astronomy logic.
- Astronomy calculations: server-side only (Nitro API).
- Compass: static compass (no DeviceOrientation sensor dependency).
- GPS denied fallback: manual latitude/longitude form is included in MVP.
- Mapbox: integration stubs only (env/config), no rendered map in MVP UI.

## 3) Scope

### In Scope (MVP)

- Home page with geolocation request and manual coordinate fallback.
- Display cards for:
  - Current location
  - Current time
  - Moon (altitude, azimuth, rise/set, illumination, phase)
  - Sun (altitude, azimuth, sunrise, sunset)
  - Visible planets (name, altitude, azimuth, isVisible)
  - Current constellation
  - Milky Way visibility (Excellent/Good/Poor/Not Visible)
  - Direction to look (e.g., South-East)
- Compass page with N/S/E/W and markers for Moon + selected planet direction.
- Typed API routes:
  - `GET /api/sky`
  - `GET /api/moon`
  - `GET /api/planets`
  - `GET /api/iss` (mocked response)

### Out of Scope (now)

- Authentication, database, Redis, Docker, microservices.
- AR, push notifications, PWA/offline, AI assistant.
- Real ISS tracking integration.
- Weather/light pollution external integrations.

## 4) Architecture

Single Nuxt 4 repository:

- UI layer: `app/pages`, `app/components`, `app/layouts`
- Composition/business layer: `app/composables`
- API layer: `server/api`
- Domain astronomy layer: `lib/*`
- Shared contracts: `types/*`
- Shared helpers: `utils/*`

Data flow:

1. UI obtains coordinates from browser geolocation or manual input.
2. UI calls server API endpoint(s), primarily `/api/sky`.
3. Nitro handler validates input and delegates calculations to `lib/*`.
4. Typed DTO returned to UI; UI renders reusable cards.

This keeps business logic independent of Vue rendering and testable in isolation.

## 5) Folder Structure

```text
/
  app/
    assets/
    components/
      Compass.vue
      CurrentLocation.vue
      LoadingLocation.vue
      MoonCard.vue
      PermissionDenied.vue
      PlanetCard.vue
      SectionTitle.vue
      SkyCard.vue
      SunCard.vue
    composables/
      useCompassData.ts
      useGeolocationInput.ts
      useSkyData.ts
    layouts/
      default.vue
    pages/
      index.vue
      compass.vue
  lib/
    astronomy.ts
    constellation.ts
    direction.ts
    milkyway.ts
    moon.ts
    planets.ts
    sun.ts
  public/
  server/
    api/
      iss.get.ts
      moon.get.ts
      planets.get.ts
      sky.get.ts
  types/
    api.ts
    astronomy.ts
    location.ts
  utils/
    time.ts
    validation.ts
  docs/
    superpowers/
      specs/
        2026-07-30-whats-above-me-design.md
  README.md
```

## 6) API Contracts

### `GET /api/sky`

Query params:

- `lat: number`
- `lng: number`
- `time?: ISO-8601 string` (defaults to server current time)

Response:

- `SkySnapshot`

### `GET /api/moon`

Query params: same as `/api/sky`

Response:

- `MoonInfo`

### `GET /api/planets`

Query params: same as `/api/sky`

Response:

- `PlanetInfo[]`

### `GET /api/iss`

Response:

- mocked `ISSPass` payload with realistic shape and static values.

### Validation and Error Format

- Latitude must be in `[-90, 90]`.
- Longitude must be in `[-180, 180]`.
- Invalid input returns HTTP 400 with typed error object.
- Unexpected calculation failure returns HTTP 500 with stable message.

## 7) Type System (Core)

Key interfaces:

- `Coordinates`
- `Direction`
- `MoonInfo`
- `SunInfo`
- `PlanetInfo`
- `ConstellationInfo`
- `MilkyWayVisibility` (union: `Excellent | Good | Poor | Not Visible`)
- `SkySnapshot`
- `ISSPass`
- `ApiError`

Type definitions are shared between UI and server to prevent drift.

## 8) UI and UX Design

Style goals:

- Dark mode by default.
- Minimal, card-based, large spacing, rounded corners.
- Mobile-first responsive layout.
- Readable, high-contrast typography.

UX states:

- Loading: skeletons/placeholder cards while location/data loads.
- Permission denied: friendly guidance + manual coordinate form.
- API/network failure: banner or inline error with retry action.
- Invalid coordinates: inline field validation and disabled submit.

## 9) Composable Responsibilities

- `useGeolocationInput`
  - Browser geolocation request
  - Permission state handling
  - Manual coordinate form state and validation
- `useSkyData`
  - Fetch snapshot from `/api/sky`
  - Expose data/loading/error/reload
- `useCompassData`
  - Derive compass markers from moon/planet azimuth values
  - Provide normalized angle values for the compass component

## 10) Domain Module Boundaries (`lib/*`)

- `moon.ts`: moon-specific calculations and normalization.
- `sun.ts`: sun metrics and sun events.
- `planets.ts`: planet list + visibility filtering rules.
- `constellation.ts`: derive current constellation context.
- `milkyway.ts`: rule-based visibility rating from sun/moon/altitude/time context.
- `direction.ts`: azimuth to cardinal/intercardinal labels.
- `astronomy.ts`: orchestrates modules into a final `SkySnapshot`.

Each module exposes small pure functions and avoids framework dependencies.

## 11) Performance and Scalability Notes

- Keep astronomy logic on server to avoid larger client bundles.
- Lazy-load heavy sections/components where it gives measurable UX value.
- Minimize watchers and avoid unnecessary reactive recomputation.
- Prefer one primary endpoint (`/api/sky`) for page hydration simplicity.
- Maintain module boundaries so future features plug into `lib` and `server/api`.

## 12) Testability Strategy

- `lib/*` functions stay framework-agnostic and deterministic where possible.
- Input validation is isolated in `utils/validation.ts`.
- API handlers remain thin and easy to test with mocked query input.
- UI components consume typed props and composables, reducing hidden logic.

## 13) Future Extension Path

Future features can be added with minimal disruption:

- ISS real-time: replace `iss.get.ts` mock with real provider adapter.
- Weather/light pollution/aurora: add external adapters + enrich `SkySnapshot`.
- Golden/Blue hour: extend `sun.ts` and `types`.
- AR/Compass sensor mode: add optional client composable without changing core API.
- PWA/offline: cache last successful snapshot and static assets.

## 14) Milestone Execution Plan

1. Project initialization (Nuxt 4, TypeScript strict, Tailwind, dependencies).
2. Folder structure and core shared types.
3. Layout and UI foundation (cards, typography, dark theme).
4. Astronomy Engine integration in `lib/*`.
5. Sky calculation modules and orchestrator.
6. Nitro typed API routes and validation.
7. Home page implementation.
8. Compass page implementation.
9. ISS mock API module.
10. Final cleanup, docs, README.

## 15) Risks and Mitigations

- Browser geolocation inconsistency across environments
  - Mitigation: manual coordinate fallback and clear user guidance.
- Astronomy computation edge cases
  - Mitigation: centralized normalization and strict type contracts.
- API latency perception on mobile
  - Mitigation: loading skeletons and single consolidated `/api/sky` request.

