# Journey Mode Architecture

Journey Mode is a **data-driven cinematic layer** on top of Universe Explorer.
It does **not** create a second Three.js scene. It reuses `UniverseRenderer`,
`CameraController`, level scenes, ephemeris, and `useUniverse`.

## Layers

| Layer | Responsibility |
|-------|----------------|
| `lib/journey/journeys/*` | Pure journey definitions (steps, narration keys, keyframes) |
| `lib/journey/journey-engine/*` | Playback state machine, camera sequencing, audio stubs |
| `app/composables/useJourney.ts` | Vue-facing state + wiring to universe level / camera bridge |
| `app/components/journey/*` | Selection + playback UI only |
| `lib/universe/renderer/*` | Rendering + camera interpolation (never teleport) |

## Adding a new journey

1. Create `lib/journey/journeys/my-journey.ts` exporting a `Journey` object.
2. Register it in `lib/journey/journeys/index.ts`.
3. Add EN + VI strings under `journey.*` in `locales/`.
4. Keep `status: 'available'` only when steps are complete.

No engine or renderer changes are required if steps use existing
`UniverseLevel` values and known `FocusTarget`s.

## Step model

Each `JourneyStep` has:

- `level` — which Universe Explorer scene to show
- `camera[]` — ordered keyframes (position/target/relative focus, duration, easing)
- `holdMs` — pause for narration / educational card
- `narration` / `card` — i18n key refs (static content; AI hooks reserved)

City / Country / Laniakea style stops reuse an existing level with different
keyframes and copy — they are **not** new scenes.

## Reverse journeys

Set `reverseOf: 'where-am-i'` and optional `reverseNarrationOverrides`.
`resolveJourneySteps()` reverses the source steps and applies overrides.
`return-home` is the reference implementation.

## Camera rules

- Always interpolate via `CameraController.animateTo` / `UniverseRenderer.animateCamera`.
- Playback speed divides `durationMs` and `holdMs`.
- `prefers-reduced-motion` shortens moves (see `CameraAnimator`).
- While playing, OrbitControls are disabled; pause re-enables them.

## Audio (future)

`AudioBus` exposes `setAmbient`, `setSpace`, `setNarration`, `setMuted`.
MVP is architecture-only — do not ship copyrighted audio assets.

## Page

Route: `/universe/journey` → `app/pages/universe/journey.vue`

Explorer free-roam remains at `/universe`.
