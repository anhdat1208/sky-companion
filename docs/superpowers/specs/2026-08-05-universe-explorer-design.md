# Universe Explorer - Design Spec

## 1) Product Goal

Add an interactive educational **Universe Explorer** to Sky Companion: help users understand where they are in the Universe by zooming through scale levels from “You” to the Observable Universe.

This is **not** a physics simulator (Universe Sandbox). It is an exploration experience inspired by NASA Eyes, Solar System Scope, Google Earth, and Powers of Ten. Prefer usability and education over perfect physical accuracy; use realistic scales when practical.

## 2) Confirmed Decisions

- **MVP scope (B):** Levels 1–4 fully interactive; Levels 5–9 schematic with smooth transitions and educational captions. Deeper galactic content later.
- **Architecture:** Scene-graph per level + pure Three.js `UniverseRenderer` (no Vue inside renderer). Approach 1 from brainstorming.
- **Scale (A):** Hybrid — relative orbital radii; exaggerated body sizes; mild distance compression. Constants live in `lib/universe/scale/` so a future Realistic mode can plug in without major refactor.
- **Textures (B):** Public licensed textures (NASA/JPL or equivalent) for Sun/Earth/Moon/major planets under `public/universe/textures/` with attribution; solid/gradient fallback if a texture fails to load.
- **Location (A):** Reuse `useGeolocationInput` (GPS → manual fallback). User marker on Earth uses lat/lng. Page link from home when coordinates known.
- **i18n (A):** Full EN + VI for UI chrome and educational catalog via `locales/`.
- **Ephemeris:** Client-side `astronomy-engine` → `UniverseSnapshot`; renderer never imports astronomy-engine.
- **Page path:** `app/pages/universe.vue` → route `/universe` (Nuxt 4 `app/` layout).
- **New dependency:** `three` (lazy-loaded only on `/universe`).
- **Sky AI:** Not in MVP. Detail cards use static content; types include `contentRef` / object id for future AI hooks.

## 3) Scope

### In Scope (MVP)

- Page `/universe` with home entry link when coordinates are known.
- Zoom levels 1–9 with animated transitions; Level rail (click + prev/next).
- **Level 1 You:** Marker at user lat/lng on Earth; camera near marker.
- **Level 2 Earth:** Rotation from simulation time; day/night terminator; user location marker; season label.
- **Level 3 Earth–Moon:** Moon orbit, phase, Earth–Moon distance.
- **Level 4 Solar System:** Sun, Mercury, Venus, Earth, Moon, Mars, Jupiter, Saturn (simple ring), Uranus, Neptune; hybrid scale; orbits; click → detail.
- **Levels 5–9:** Schematic scenes (stars / Milky Way annotations / Local Group / Virgo / Observable Universe) with labels and short captions.
- Timeline: Pause, Play, warp 1x / 10x / 100x / 1000x (simulated days per real second), Jump to date, Reset to now.
- Camera: Rotate, Zoom, Pan, Reset, Follow Planet, Focus Planet.
- Overlays: Show/Hide Labels, Orbits, Distances.
- Planet / body detail card: name, radius, mass, gravity, distance from Sun, orbital period, rotation period, current position, interesting facts, Learn More (same card / expanded static section).
- Lazy-load Three.js; dispose on leave; desktop + modern mobile.
- Unit tests for ephemeris helpers, scale model, content catalog completeness, composable time state.
- Rendering architecture doc: `lib/universe/docs/rendering.md`.
- Future-ready types/registry hooks for spacecraft, small bodies, exoplanets (no rendering in MVP).

### Out of Scope (now)

- Spacecraft (ISS, JWST, Voyagers, New Horizons) rendering.
- Comets, asteroids, exoplanets, Galaxy Explorer deep mode.
- Realistic-scale UI toggle.
- Sky AI inside Learn More.
- N-body physics, VR/AR.
- Visual/WebGL e2e tests.

## 4) Architecture

```text
useGeolocationInput ──┐
                      ▼
              useUniverse.ts
              (level, simTime, warp, playing,
               selection, overlays, cameraMode)
                      │
     ┌────────────────┼────────────────┐
     ▼                ▼                ▼
lib/universe/    types/universe.ts   locales universe.*
ephemeris/       content catalog
scale/
                      │
                      ▼
lib/universe/renderer/     # Three.js only, lazy import
UniverseRenderer
  LevelController
  scenes: You, Earth, EarthMoon, SolarSystem, Schematic(5–9)
  CameraController
  OverlaySystem
                      │
                      ▼
components/universe/*  →  app/pages/universe.vue
```

### Principles

- Vue components: presentation and event wiring only — no astronomy math, no Three.js scene graph construction beyond calling renderer APIs.
- Ephemeris separated from rendering: `buildUniverseSnapshot(time, observer?)` → immutable snapshot consumed by renderer.
- Stable `CelestialBodyId` for every object; educational copy keyed by id.
- Extension: `UniverseObjectKind` + optional registry so spacecraft/comets can register later without rewriting the page.

### Why client-side ephemeris?

Time warp and orbital animation need frequent updates. Server round-trips are unsuitable. `astronomy-engine` is already a project dependency and runs in the browser.

## 5) Folder Structure

```text
types/universe.ts
lib/universe/
  ephemeris/
    bodies.ts           # heliocentric / relative positions
    earth.ts            # rotation, terminator sun direction, season
    moon.ts             # phase, distance
    snapshot.ts         # buildUniverseSnapshot
    index.ts
  scale/
    hybrid.ts           # AU → scene units, body radius exaggeration
    index.ts
  content/
    catalog.ts          # numeric facts + i18n key refs per body
    index.ts
  renderer/
    UniverseRenderer.ts
    LevelController.ts
    CameraController.ts
    OverlaySystem.ts
    scenes/
      YouScene.ts
      EarthScene.ts
      EarthMoonScene.ts
      SolarSystemScene.ts
      SchematicScene.ts   # levels 5–9 parameterized
    materials.ts
    loadTextures.ts
    index.ts
  docs/rendering.md
  index.ts
app/composables/useUniverse.ts
app/components/universe/
  UniverseCanvas.vue
  UniverseLevelRail.vue
  UniverseTimelineControls.vue
  UniverseCameraControls.vue
  UniverseOverlayToggles.vue
  UniverseDetailCard.vue
  UniverseLocationPrompt.vue
app/pages/universe.vue
public/universe/textures/   # + ATTRIBUTION.md
locales/en.json             # universe.* keys
locales/vi.json
tests/lib/universe/
  ephemeris.test.ts
  scale.test.ts
  catalog.test.ts
tests/composables/useUniverse.test.ts
```

## 6) Domain Types (`types/universe.ts`)

```ts
export type UniverseLevel =
  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

export type CelestialBodyId =
  | 'sun' | 'mercury' | 'venus' | 'earth' | 'moon'
  | 'mars' | 'jupiter' | 'saturn' | 'uranus' | 'neptune'
  | 'alpha-centauri' | 'sirius' | 'betelgeuse' | 'rigel' | 'polaris'
  | 'milky-way' | 'galactic-center' | 'orion-arm'
  | 'local-group' | 'virgo-supercluster' | 'observable-universe'

/** Future-ready — unused in MVP rendering */
export type SpacecraftId =
  | 'iss' | 'jwst' | 'voyager-1' | 'voyager-2' | 'new-horizons'

export type UniverseObjectKind =
  | 'star' | 'planet' | 'moon' | 'spacecraft' | 'small-body'
  | 'exoplanet' | 'galaxy' | 'structure' | 'marker'

export type CameraMode = 'free' | 'follow' | 'focus'
export type TimeWarpFactor = 1 | 10 | 100 | 1000

export interface OverlayFlags {
  labels: boolean
  orbits: boolean
  distances: boolean
}

export interface Vec3 {
  x: number
  y: number
  z: number
}

export interface BodyState {
  id: CelestialBodyId
  position: Vec3          // scene or km depending on layer; snapshot documents units
  positionKm: Vec3        // physical heliocentric or relative km for UI
  radiusKm: number
  rotationRad: number
}

export interface EarthExtras {
  sunDirection: Vec3
  seasonKey: 'spring' | 'summer' | 'autumn' | 'winter'
  userLat: number
  userLng: number
}

export interface MoonExtras {
  phaseFraction: number   // 0–1 illuminated
  phaseNameKey: string
  distanceKm: number
}

export interface UniverseSnapshot {
  timeIso: string
  bodies: BodyState[]
  earth?: EarthExtras
  moon?: MoonExtras
}

export interface BodyEducationalContent {
  id: CelestialBodyId
  i18nPrefix: string      // e.g. universe.bodies.earth
  radiusKm: number
  massKg: number
  gravityMs2: number
  distanceFromSunAu: number | null
  orbitalPeriodDays: number | null
  rotationPeriodHours: number | null
  contentRef: string      // stable id for future Sky AI
}

export interface TimeControlState {
  playing: boolean
  warp: TimeWarpFactor
  simulationTime: Date
}

export interface UniverseUiState {
  level: UniverseLevel
  selectedBodyId: CelestialBodyId | null
  overlays: OverlayFlags
  cameraMode: CameraMode
  time: TimeControlState
}
```

## 7) Ephemeris & Scale

### Ephemeris

- Solar System: heliocentric vectors via astronomy-engine (`HelioVector` / body APIs) for planets; Moon relative to Earth for L3/L4.
- Earth rotation angle from sidereal/solar approximation tied to `simulationTime`.
- Terminator: sun direction in Earth-local frame from ephemeris.
- Season: from Sun ecliptic longitude bands → `seasonKey` (Northern-hemisphere labels; copy notes hemisphere in i18n).
- Moon phase: reuse patterns from `lib/moon/phase` where practical, or Illumination API; keep universe module free of Vue.

### Hybrid scale (`scale/hybrid.ts`)

- Input: positions in AU or km.
- Output: Three.js scene units.
- Body display radius = `f(physicalRadius)` with clamps so Mercury remains visible and Jupiter does not swallow the inner system.
- Document exaggeration factors in `rendering.md`.

### Time warp

- `warp` = simulated days advanced per real second while `playing`.
- Composable advances `simulationTime` with `requestAnimationFrame` delta; rebuilds snapshot; pushes to renderer via `renderer.setSnapshot(snapshot)`.

## 8) Renderer

Documented in `lib/universe/docs/rendering.md`:

1. `UniverseRenderer.mount(canvas)` — create WebGLRenderer, scene, camera, controls.
2. `setLevel(n)` — LevelController transitions camera/scale, activates scene module.
3. `setSnapshot(snapshot)` — update body meshes / Earth lighting / Moon phase shading.
4. `setOverlays(flags)` — labels, orbit lines, distance sprites.
5. `setCameraMode(mode, bodyId?)` — free / follow / focus.
6. `dispose()` — cancel RAF, dispose geometries/materials/textures/controls.

Textures loaded asynchronously; until ready, use colored MeshStandardMaterial fallbacks.

Levels 5–9 share `SchematicScene` with config: point markers, optional disk/mesh, annotation sprites, caption key.

## 9) UI / UX

- Full-viewport canvas; overlay HUD (level rail, timeline, camera, toggles).
- Without coordinates: `UniverseLocationPrompt` (reuse GPS/manual patterns); explorer can still open at Level 4 demo Earth position only after location — **MVP requires location for Level 1 marker**; if missing, prompt blocks deep “You” personalization but Solar System still usable with default Earth (no user pin) — prefer: show prompt banner; Levels 2–9 work; Level 1 disabled until coords.
- Detail card slides in on body select; Learn More expands facts section.
- Distance display: AU at Solar System; km for Moon distance; use `useUnits` for km↔mi where applicable.
- Attribution footer/link for texture sources.

## 10) i18n Keys (sketch)

```text
universe.page.title
universe.levels.1 … universe.levels.9
universe.timeline.play | pause | warp | jump | resetNow
universe.camera.reset | follow | focus
universe.overlays.labels | orbits | distances
universe.season.spring|summer|autumn|winter
universe.bodies.<id>.name | summary | facts.0 | facts.1 | …
universe.schematic.5…9.caption
universe.textures.attribution
nav.universe
```

## 11) Performance

- Dynamic `import('three')` and dynamic import of `lib/universe/renderer` only from `UniverseCanvas` on client.
- Pause → skip ephemeris rebuild except on date jump.
- Limit orbit line segments; schematic levels low poly.
- `pixelRatio` capped (e.g. `min(devicePixelRatio, 2)`).
- Dispose on `onBeforeUnmount`.

## 12) Testing

- Fixed `Date` → Moon distance and Earth–Sun vector sanity ranges.
- Scale: monotonic mapping; exaggerated radii within expected bounds.
- Catalog: every MVP `CelestialBodyId` used in L1–4 has content + i18n prefixes present (test against key list or catalog fields).
- `useUniverse`: play/pause, warp change, jumpToDate, level change clears follow appropriately.

## 13) Home Integration

Mirror ISS / Meteor pattern: `universeLink` computed with `lat`/`lng` query when coordinates exist; nav card/link labeled via `nav.universe`.

## 14) Future-Ready Hooks

- `SpacecraftId`, `UniverseObjectKind`, unused registry interface:

```ts
export interface UniverseObjectRegistration {
  id: string
  kind: UniverseObjectKind
  levelMin: UniverseLevel
  levelMax: UniverseLevel
}
```

No MVP implementations for spacecraft/comets/exoplanets beyond types + short note in `rendering.md`.

## 15) Success Criteria

- User with location can open `/universe`, see themselves on Earth, zoom out through Moon and Solar System with moving planets, and continue out through schematic cosmic levels.
- Play + 1000x shows obvious orbital motion.
- Clicking Earth/Mars opens an i18n detail card with Learn More facts.
- Leaving the page does not leave WebGL contexts / RAF leaks (manual check).
- `npm test` covers new unit tests; `nuxt typecheck` passes.
