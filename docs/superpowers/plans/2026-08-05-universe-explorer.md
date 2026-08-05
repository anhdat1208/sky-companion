# Universe Explorer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship MVP Universe Explorer at `/universe` with Levels 1–4 interactive (You → Solar System), Levels 5–9 schematic, client ephemeris, Three.js renderer isolated from Vue, i18n EN/VI.

**Architecture:** `useUniverse` owns UI/time state; `lib/universe/ephemeris` builds snapshots; `lib/universe/renderer` (lazy Three.js) renders; Vue components are chrome only.

**Tech Stack:** Nuxt 4, Vue 3, TypeScript, astronomy-engine, three, Vitest, @nuxtjs/i18n

## Global Constraints

- Page: `app/pages/universe.vue` (route `/universe`)
- No business logic / astronomy / scene graph inside Vue SFCs beyond calling composable + renderer APIs
- Lazy-load `three` and renderer only on client when canvas mounts
- Hybrid scale only (no Realistic toggle)
- Textures under `public/universe/textures/` with attribution; colored fallbacks required
- Full i18n EN + VI for universe strings
- Branch: `feature/universe-explorer` from `main`
- Follow existing patterns: `useGeolocationInput`, home link with `lat`/`lng`, Vitest in `tests/`

---

## File Structure

```text
types/universe.ts
lib/universe/ephemeris/{bodies,earth,moon,snapshot,index}.ts
lib/universe/scale/{hybrid,index}.ts
lib/universe/content/{catalog,index}.ts
lib/universe/renderer/{UniverseRenderer,LevelController,CameraController,OverlaySystem,materials,loadTextures,index}.ts
lib/universe/renderer/scenes/{YouScene,EarthScene,EarthMoonScene,SolarSystemScene,SchematicScene}.ts
lib/universe/docs/rendering.md
lib/universe/index.ts
app/composables/useUniverse.ts
app/components/universe/*.vue
app/pages/universe.vue
public/universe/textures/ATTRIBUTION.md
tests/lib/universe/{ephemeris,scale,catalog}.test.ts
tests/composables/useUniverse.test.ts
locales/en.json, locales/vi.json  (universe.* + nav.universe)
app/pages/index.vue, package.json  (three dependency)
```

---

### Task 1: Types + content catalog + scale

**Files:**
- Create: `types/universe.ts`
- Create: `lib/universe/content/catalog.ts`, `lib/universe/content/index.ts`
- Create: `lib/universe/scale/hybrid.ts`, `lib/universe/scale/index.ts`
- Test: `tests/lib/universe/catalog.test.ts`, `tests/lib/universe/scale.test.ts`

**Interfaces:**
- Produces: types from spec §6; `getBodyContent(id)`, `MVP_SOLAR_BODY_IDS`; `auToScene(au)`, `radiusKmToScene(radiusKm, id)`

- [ ] **Step 1: Write failing catalog + scale tests**

```ts
// tests/lib/universe/catalog.test.ts
import { describe, expect, it } from 'vitest'
import { getBodyContent, MVP_SOLAR_BODY_IDS } from '../../../lib/universe/content'

describe('universe content catalog', () => {
  it('covers every MVP solar-system body', () => {
    for (const id of MVP_SOLAR_BODY_IDS) {
      const c = getBodyContent(id)
      expect(c.id).toBe(id)
      expect(c.i18nPrefix).toBe(`universe.bodies.${id}`)
      expect(c.radiusKm).toBeGreaterThan(0)
      expect(c.contentRef).toBe(`universe:${id}`)
    }
  })
})
```

```ts
// tests/lib/universe/scale.test.ts
import { describe, expect, it } from 'vitest'
import { auToScene, radiusKmToScene } from '../../../lib/universe/scale'

describe('hybrid scale', () => {
  it('maps larger AU to larger scene distance', () => {
    expect(auToScene(1)).toBeGreaterThan(0)
    expect(auToScene(5.2)).toBeGreaterThan(auToScene(1))
  })

  it('exaggerates Mercury radius but keeps it below Jupiter display radius', () => {
    const mercury = radiusKmToScene(2439.7, 'mercury')
    const jupiter = radiusKmToScene(69911, 'jupiter')
    expect(mercury).toBeGreaterThan(0)
    expect(jupiter).toBeGreaterThan(mercury)
  })
})
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `npm test -- tests/lib/universe/catalog.test.ts tests/lib/universe/scale.test.ts`

- [ ] **Step 3: Implement types, catalog (numeric facts), hybrid scale**

- [ ] **Step 4: Run tests — expect PASS**

- [ ] **Step 5: Commit** `feat(universe): add types, content catalog, and hybrid scale`

---

### Task 2: Ephemeris snapshot

**Files:**
- Create: `lib/universe/ephemeris/{bodies,earth,moon,snapshot,index}.ts`
- Test: `tests/lib/universe/ephemeris.test.ts`

**Interfaces:**
- Consumes: `CelestialBodyId`, `UniverseSnapshot`, scale optional at render time
- Produces: `buildUniverseSnapshot(time: Date, observer?: { lat: number, lng: number }): UniverseSnapshot`

- [ ] **Step 1: Write failing ephemeris tests** (fixed date 2024-01-01 UTC — Earth–Sun distance ~1 AU ± 3%; Moon distance 350k–410k km; bodies include sun+planets+moon)

- [ ] **Step 2: Run — FAIL**

- [ ] **Step 3: Implement with astronomy-engine** (`HelioVector`, `Body`, Illumination/Moon APIs, season from sun longitude)

- [ ] **Step 4: Run — PASS**

- [ ] **Step 5: Commit** `feat(universe): add client ephemeris snapshot builder`

---

### Task 3: useUniverse composable

**Files:**
- Create: `app/composables/useUniverse.ts`
- Test: `tests/composables/useUniverse.test.ts`

**Interfaces:**
- Produces: `level`, `overlays`, `cameraMode`, `selectedBodyId`, `playing`, `warp`, `simulationTime`, `snapshot`, `setLevel`, `play`, `pause`, `setWarp`, `jumpToDate`, `resetToNow`, `selectBody`, `setOverlays`, `setCameraMode`, `tick(dtMs)` 

- [ ] **Step 1: Failing tests** for warp advance (`tick` with playing+warp 10 advances ~10 days per 1000ms), pause no advance, `jumpToDate`, level set

- [ ] **Step 2–4: Implement + pass** (snapshot via `buildUniverseSnapshot`; observer coords injected from page)

- [ ] **Step 5: Commit** `feat(universe): add useUniverse time and selection state`

---

### Task 4: Three.js renderer core + Solar System scene

**Files:**
- Create: renderer modules listed in File Structure
- Create: `lib/universe/docs/rendering.md`
- Modify: `package.json` — add `three` (+ `@types/three` if needed)

**Interfaces:**
- Produces: `createUniverseRenderer(): UniverseRenderer` with `mount`, `setLevel`, `setSnapshot`, `setOverlays`, `setCameraMode`, `dispose`

- [ ] **Step 1: `npm install three`**

- [ ] **Step 2: Implement `UniverseRenderer` + `SolarSystemScene` + `CameraController` + `OverlaySystem` + texture loader with color fallbacks

- [ ] **Step 3: Implement LevelController transitions; Earth / EarthMoon / You scenes; SchematicScene for 5–9**

- [ ] **Step 4: Write `rendering.md`** (pipeline, scale factors, extension hooks)

- [ ] **Step 5: Manual smoke in browser after Task 5 wires canvas; commit** `feat(universe): add lazy Three.js universe renderer`

---

### Task 5: Vue chrome + page + i18n + home link

**Files:**
- Create: `app/components/universe/*.vue`, `app/pages/universe.vue`
- Modify: `locales/en.json`, `locales/vi.json`, `app/pages/index.vue`
- Create: `public/universe/textures/ATTRIBUTION.md` (and placeholder or downloaded textures)

- [ ] **Step 1: Add i18n keys** (`nav.universe`, levels, timeline, camera, overlays, bodies, seasons, schematic captions)

- [ ] **Step 2: Build components** — Canvas lazy-imports renderer; Timeline/Level/Camera/Overlays/Detail/LocationPrompt

- [ ] **Step 3: Wire `universe.vue`** with `useGeolocationInput` + `useUniverse`; Level 1 requires coords

- [ ] **Step 4: Home link** when coords known

- [ ] **Step 5: `npm run typecheck` + `npm test`; fix; commit** `feat(universe): add explorer page, UI chrome, and i18n`

---

### Task 6: Polish verification

- [ ] **Step 1: Verify Level transitions, play/warp, planet click detail, overlays, dispose on navigate away**

- [ ] **Step 2: Confirm EN/VI switch updates labels**

- [ ] **Step 3: Final commit if polish needed**; ensure branch ready for PR

---

## Spec coverage checklist

| Spec area | Task |
|-----------|------|
| Types / future hooks | 1 |
| Catalog + i18n content refs | 1, 5 |
| Hybrid scale | 1 |
| Ephemeris L1–4 data | 2 |
| Timeline / warp | 3, 5 |
| Renderer isolation + lazy three | 4 |
| Levels 1–9 + transitions | 4, 5 |
| Camera / overlays | 4, 5 |
| Detail card / Learn More | 5 |
| Location | 5 |
| Home link | 5 |
| rendering.md | 4 |
| Tests | 1–3, 5 |

## Execution

Implement tasks in order on `feature/universe-explorer`. Prefer inline execution in this session unless subagent-driven is requested.
