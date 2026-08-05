# Journey Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship Journey Mode at `/universe/journey` — guided cinematic camera tours reusing Universe Explorer renderer.

**Architecture:** Pure journey data + JourneyEngine + light CameraController keyframes; Vue UI only; single Three.js scene.

**Tech Stack:** Nuxt 4, Vue 3, TypeScript, Three.js (existing), Vitest, vue-i18n EN/VI.

## Global Constraints

- Do NOT rebuild Universe Explorer renderer or create a second Three.js scene.
- Never teleport camera; always interpolate.
- Journeys are pure data; engine has no journey-specific hardcoding beyond registry.
- City/Country/Laniakea = narration stops on existing levels, not new scenes.
- Audio = stubs only; no copyrighted assets.
- i18n EN + VI required.
- Branch: `feature/journey-mode` (from main).

---

### Task 1: Types + Camera keyframe API

**Files:**
- Create: `types/journey.ts`
- Modify: `lib/universe/renderer/CameraController.ts`
- Modify: `lib/universe/renderer/types.ts`
- Modify: `lib/universe/renderer/UniverseRenderer.ts`
- Modify: `app/components/universe/UniverseCanvas.vue` (expose animateCamera if needed)

- [ ] Add journey domain types per design spec
- [ ] Extend CameraController with `animateTo`, `cancelAnimation`, `isAnimating`, optional FOV lerp, `setControlsEnabled`
- [ ] Expose on UniverseRenderer: `animateCamera`, `cancelCameraAnimation`, `setControlsEnabled`, `onCameraIdle`
- [ ] Commit: `feat(journey): add types and camera keyframe API`

### Task 2: Journey engine core

**Files:**
- Create: `lib/journey/journey-engine/CameraAnimator.ts`
- Create: `lib/journey/journey-engine/AudioBus.ts`
- Create: `lib/journey/journey-engine/JourneyEngine.ts`
- Create: `lib/journey/journey-engine/index.ts`
- Create: `tests/lib/journey/engine.test.ts`
- Create: `tests/lib/journey/camera-animator.test.ts`

- [ ] Implement AudioBus stubs
- [ ] Implement CameraAnimator (sequence keyframes, speed, reduced motion)
- [ ] Implement JourneyEngine (play/pause/next/prev/skip/restart/jump/speed/reverse resolution)
- [ ] Unit tests
- [ ] Commit: `feat(journey): add JourneyEngine and CameraAnimator`

### Task 3: Journey definitions + registry

**Files:**
- Create: `lib/journey/journeys/where-am-i.ts`
- Create: `lib/journey/journeys/return-home.ts`
- Create: `lib/journey/journeys/to-the-sun.ts`
- Create: `lib/journey/journeys/stubs.ts`
- Create: `lib/journey/journeys/index.ts`
- Create: `lib/journey/index.ts`
- Create: `tests/lib/journey/registry.test.ts`

- [ ] Define Where Am I (12 steps), Return Home (reverseOf), To the Sun, coming-soon stubs
- [ ] Registry helpers: `listJourneys()`, `getJourney(id)`, `resolveJourneySteps(journey)`
- [ ] Tests
- [ ] Commit: `feat(journey): add journey definitions and registry`

### Task 4: useJourney composable

**Files:**
- Create: `app/composables/useJourney.ts`
- Create: `tests/composables/useJourney.test.ts`

- [ ] Wire engine to universe level + camera callbacks
- [ ] Expose UI state: phase, stepIndex, speed, current step, selection
- [ ] Tests
- [ ] Commit: `feat(journey): add useJourney composable`

### Task 5: UI + page + i18n

**Files:**
- Create: `app/components/journey/*.vue`
- Create: `app/pages/universe/journey.vue`
- Modify: `app/pages/universe.vue` (link to journey)
- Modify: `locales/en.json`, `locales/vi.json`
- Create: `lib/journey/docs/journey-architecture.md`

- [ ] Selection + playback UI (dark, minimal)
- [ ] Timeline, controls, narration, edu card
- [ ] Keyboard + reduced motion
- [ ] i18n EN/VI
- [ ] Architecture doc
- [ ] Commit: `feat(journey): add Journey Mode page and UI`

### Task 6: Verify

- [ ] `npm test`
- [ ] `npm run typecheck`
- [ ] Fix failures
