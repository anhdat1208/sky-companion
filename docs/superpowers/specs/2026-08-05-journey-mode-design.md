# Journey Mode — Design Spec

## 1) Product Goal

Add **Journey Mode** to Sky Companion’s Universe Explorer: a guided cinematic camera experience that travels through cosmic scales to communicate humanity’s place in the Universe.

Inspired by Carl Sagan’s Cosmos, Powers of Ten, Google Earth Voyager, NASA Eyes, and Kurzgesagt storytelling. Prefer emotional clarity and education over scientific precision of scale transitions. Think guided documentary, not simulator.

**Do not rebuild** the Universe Explorer renderer, scenes, ephemeris, or free-roam page. Reuse existing rendering, camera, astronomical objects, and data structures.

## 2) Confirmed Decisions

| Topic | Choice |
|-------|--------|
| Architecture | Data-driven Journey Engine overlaying Universe Explorer (Approach 1) |
| MVP journeys | Where Am I? + Return Home + Journey to the Sun; other cards `coming-soon` |
| City / Country | Same You/Earth levels; pause + narration cards; no new scenes |
| City / Country labels | Generic i18n (“Your city”, “Your country”); no reverse geocode |
| Route | Dedicated page `/universe/journey` (Explorer stays free-roam at `/universe`) |
| Return Home | Engine reverse support + optional narration overrides (`reverseOf`) |
| Narration | Static i18n content only; types ready for future AI/audio |
| Audio | Architecture only (`AudioBus` stubs); no copyrighted assets |
| i18n | Full EN + VI for UI, narration, educational cards |
| Laniakea stop | Narration/card on existing schematic level (Virgo/Observable); no new scene |

## 3) Scope

### In Scope (MVP)

- Page `app/pages/universe/journey.vue` → `/universe/journey`
- Journey selection UI (beautiful dark cards)
- Playback UI: timeline, play/pause/restart/skip/prev/next, speed 1x/2x/4x/8x
- Educational cards per stop (title, description, facts, scale, distance, size comparison, learn more)
- Narration + subtitle/captions
- `types/journey.ts` + pure journey definitions under `lib/journey/journeys/`
- `JourneyEngine`, `CameraAnimator`, `AudioBus` (stub)
- `useJourney` composable
- Light extensions to `CameraController` / `UniverseRenderer` for keyframe animation (never teleport)
- Keyboard navigation, `prefers-reduced-motion`, pause, subtitles
- Unit tests for engine, registry, camera animator timing, composable
- Architecture doc: `lib/journey/docs/journey-architecture.md`
- Entry link from `/universe` and/or home (minimal)

### Out of Scope (MVP)

- New City / Country / Laniakea Three.js scenes
- Reverse geocoding of real place names
- AI narration / TTS
- Real ambient/space/narration audio files
- Spacecraft rendering (Voyager, ISS, JWST)
- Changing Explorer free-roam UI beyond a link to Journey Mode
- Multiple Three.js scenes / second renderer instance
- Visual / WebGL e2e tests

## 4) Architecture

```text
app/pages/universe/journey.vue
        │
        ├─ selection UI ── lib/journey/journeys (registry)
        │
        └─ playback UI ── useJourney ── JourneyEngine
                              │              │
                              │              ├─ CameraAnimator → UniverseRenderer.animateCamera
                              │              ├─ setLevel via useUniverse
                              │              └─ AudioBus (stub)
                              │
                              └─ useUniverse + UniverseCanvas (reuse)
                                        │
                                        ▼
                              lib/universe/renderer/*
                              (single scene, CameraController keyframes)
```

### Principles

- **Journeys are pure data** — no animation logic inside journey files.
- **Vue = UI only** — no Three.js scene graph construction in components.
- **Engine = timing / state machine** — play, pause, skip, reverse, speed.
- **Renderer = camera + levels** — Journey Mode never creates a second WebGL context.
- **Separation** — animation, rendering, and UI are independent layers.
- New journeys (Saturn, Andromeda, Voyager, …) = new data files + registry entry; engine unchanged.

## 5) Folder Structure

```text
types/journey.ts

lib/journey/
  journeys/
    where-am-i.ts
    return-home.ts          # thin: reverseOf + narration overrides
    to-the-sun.ts
    stubs.ts                # coming-soon catalog entries
    index.ts                # registry
  journey-engine/
    JourneyEngine.ts
    CameraAnimator.ts
    AudioBus.ts
    index.ts
  content/                  # optional helpers mapping i18n prefixes
  docs/journey-architecture.md
  index.ts

app/composables/useJourney.ts

app/components/journey/
  JourneySelection.vue
  JourneyPlayback.vue
  JourneyTimeline.vue
  JourneyControls.vue
  JourneyNarration.vue
  JourneyEduCard.vue
  JourneyCard.vue

app/pages/universe/journey.vue

locales/en.json             # journey.* keys
locales/vi.json

tests/lib/journey/
  engine.test.ts
  registry.test.ts
  camera-animator.test.ts
tests/composables/useJourney.test.ts
```

## 6) Domain Types (`types/journey.ts`)

```ts
export type JourneyId =
  | 'where-am-i'
  | 'return-home'
  | 'to-the-sun'
  | 'solar-system'
  | 'milky-way'
  | 'edge-of-universe'
  | 'voyager'
  | 'iss'
  | 'galaxy-tour'

export type JourneyStatus = 'available' | 'coming-soon'

export type JourneyPlaybackSpeed = 1 | 2 | 4 | 8

export type CameraEasing = 'easeInOut' | 'easeOut' | 'linear'

export interface FocusTarget {
  kind: 'body' | 'marker' | 'level-default'
  id?: import('./universe').CelestialBodyId
}

export interface CameraKeyframe {
  position?: import('./universe').Vec3
  target?: import('./universe').Vec3
  relativeTo?: FocusTarget
  distance?: number
  fov?: number
  durationMs: number
  easing: CameraEasing
}

export interface Narration {
  titleKey: string
  bodyKey: string
  subtitleKey?: string
  /** Future: static or AI audio */
  audioRef?: string
  aiPromptRef?: string
}

export interface EducationalCard {
  titleKey: string
  descriptionKey: string
  factsKeys: string[]
  scaleKey?: string
  distanceKey?: string
  sizeComparisonKey?: string
  learnMoreKey?: string
}

export interface JourneyTransition {
  toLevel?: import('./universe').UniverseLevel
  fadeMs?: number
}

export interface JourneyStep {
  id: string
  level: import('./universe').UniverseLevel
  holdMs: number
  camera: CameraKeyframe[]
  focus?: FocusTarget
  narration: Narration
  card: EducationalCard
  transition?: JourneyTransition
}

export interface JourneyAudioHooks {
  ambientKey?: string
  spaceKey?: string
}

export interface Journey {
  id: JourneyId
  status: JourneyStatus
  titleKey: string
  descriptionKey: string
  coverEmoji?: string
  steps: JourneyStep[]
  reverseOf?: JourneyId
  reverseNarrationOverrides?: Record<string, Narration>
  audio?: JourneyAudioHooks
}

export type JourneyEnginePhase =
  | 'idle'
  | 'transitioning'
  | 'holding'
  | 'paused'
  | 'completed'
```

## 7) Camera System

Reuse `CameraController`. Extend (do not replace):

- `animateTo(keyframe)` — smooth lerp of position, target, optional FOV; easing from keyframe; **never teleport**
- `isAnimating` / `cancelAnimation`
- Keep existing `beginLevelTransition(level)` for level default poses
- During journey **playing**: disable user OrbitControls drag; when **paused**, optional re-enable
- `UniverseRenderer` exposes `animateCamera(kf)` and idle notification so Vue/engine never import Three.js directly

`CameraAnimator` (journey-engine) sequences keyframes for a step, respects playback speed (`durationMs / speed`), and honors reduced motion (near-instant durations + fade).

## 8) Journey Engine

`JourneyEngine` responsibilities:

- Load a `Journey` (resolve `reverseOf`: reverse steps + apply narration overrides)
- State: `phase`, `stepIndex`, `speed`, `playing`
- Controls: play, pause, restart, skip (finish current → next), previous, next, jumpToStep(i)
- Per step: set universe level → run camera keyframes → show narration/card → hold `holdMs / speed` → advance
- Emit events / callbacks for UI bindings
- On dispose / page leave: cancel animations, stop ticks

`useJourney` wraps the engine with Vue refs and wires `useUniverse.setLevel`, renderer camera API, and UI.

`AudioBus`: `setAmbient`, `setSpace`, `setNarration`, `setMuted`, `dispose` — no-op stubs documenting future hooks.

## 9) MVP Journey Content

### Where Am I? (`where-am-i`)

| Step id | Level | Notes |
|---------|-------|--------|
| you | 1 | User marker |
| city | 1 | Same level; wider/near Earth framing; generic “Your city” |
| country | 2 | Earth level; generic “Your country” |
| earth | 2 | Earth card |
| earth-moon | 3 | |
| solar-system | 4 | |
| orion-arm | 5 | Schematic |
| milky-way | 6 | |
| local-group | 7 | |
| virgo | 8 | |
| laniakea | 8 | Same level as Virgo; distinct narration/card |
| observable-universe | 9 | |

### Return Home (`return-home`)

- `reverseOf: 'where-am-i'`
- `reverseNarrationOverrides` for homecoming tone on key stops
- Engine builds reversed step list at load time

### Journey to the Sun (`to-the-sun`)

Short path: Earth (2) → Earth–Moon (3) → Solar System (4) → focus Sun keyframes + Sun educational card.

### Coming soon (stubs)

Solar System tour, Milky Way, Edge of Universe, Voyager, ISS, Galaxy Tour — registry entries with `status: 'coming-soon'`, empty or placeholder steps, selection cards disabled.

## 10) UI / UX

- **Look:** Minimal, dark, elegant, large typography, smooth fades; Apple-like restraint; no clutter
- **Selection:** Card grid; available vs coming-soon
- **Playback:** Full-bleed `UniverseCanvas`; overlays only — timeline, controls, narration, edu card
- **Hide** Explorer chrome (level rail free browsing, day warp, overlay toggles) during journey
- **End state:** Restart / Back to selection / Open Explorer (`/universe`)
- **Timeline:** e.g. `You ●────────○ Universe`; click to jump

## 11) Accessibility

- Keyboard: Space play/pause; ← / → previous / next; Esc pause or return to selection
- `prefers-reduced-motion: reduce` → shortened camera durations, prefer fade over long moves
- Pause always available
- Subtitles = narration text (visible by default or user toggle)

## 12) Performance

- Single `UniverseRenderer` instance (same as Explorer pattern)
- Lazy-load Three.js only when entering playback
- Dispose renderer and engine on leave
- Lazy-load journey definitions if needed (static imports acceptable for MVP count)

## 13) i18n

Keys under `journey.*` (and reuse `universe.bodies.*` / schematic copy where it already fits). EN + VI required for:

- Selection chrome and card titles/descriptions
- Every narration title/body/subtitle
- Educational card fields
- Control labels and a11y strings

## 14) Testing

- `JourneyEngine`: play/pause/next/prev/skip/restart/speed/jump; reverse resolution
- Registry: available vs coming-soon; Where Am I step count; return-home reverseOf
- `CameraAnimator`: timing with fake clock; reduced-motion path
- `useJourney`: state transitions
- No WebGL e2e in MVP

## 15) Error / Edge Cases

- Missing coordinates: journey still runs; city/country remain generic
- Jump mid-animation: cancel camera → set level → animate destination step
- Leave page mid-journey: dispose renderer + stop engine
- Coming-soon: cannot start engine

## 16) Future Ready

Adding a journey (e.g. Journey to Saturn, Voyager 1, Andromeda, Beginning of the Universe) requires:

1. New file in `lib/journey/journeys/`
2. Registry entry
3. i18n keys

No engine or renderer changes if steps only use existing levels and focus targets. New bodies/spacecraft still depend on future Universe Explorer object support.

## 17) Docs Deliverable

`lib/journey/docs/journey-architecture.md` — how the engine works, how to author a journey, camera keyframe rules, reverse journeys, audio hooks.
