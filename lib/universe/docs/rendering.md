# Universe Explorer — Rendering Architecture

## Separation of concerns

```text
astronomy-engine  →  lib/universe/ephemeris  →  UniverseSnapshot
                                                    │
Vue (useUniverse)  ←→  snapshot / UI state          │
                                                    ▼
                              lib/universe/renderer (Three.js only)
```

- **Ephemeris** never imports Three.js.
- **Renderer** never imports Vue or astronomy-engine.
- **Vue components** call `createUniverseRenderer()` via dynamic import and push state through the `UniverseRenderer` API.

## Pipeline

1. `createUniverseRenderer()` dynamically imports `three` + OrbitControls.
2. `mount(canvas)` builds WebGLRenderer, Scene, PerspectiveCamera, OrbitControls, starfield, lights.
3. Textures load asynchronously from `/universe/textures/*`; failures fall back to `BODY_COLORS`.
4. `LevelController.setLevel(n)` swaps the active `BaseLevelScene` (You / Earth / EarthMoon / SolarSystem / Schematic).
5. Each animation frame: `CameraController.update` → overlay update → `renderer.render`.
6. `dispose()` cancels RAF, disposes geometries/materials/controls/renderer.

## Hybrid scale

Defined in `lib/universe/scale/hybrid.ts`:

- `AU_SCENE_UNITS = 50` for 1 AU.
- Distances beyond 1 AU use soft log compression so Neptune remains reachable.
- Body radii are exaggerated with per-body factors and clamped (`MIN_DISPLAY_RADIUS` … `MAX_DISPLAY_RADIUS`).
- Moon separation is further boosted in Solar System view so it remains visible beside Earth.

## Levels

| Level | Scene class | Notes |
|------|-------------|--------|
| 1 | `YouScene` | Earth close-up + user lat/lng marker |
| 2 | `EarthScene` | Rotation + terminator light + season via snapshot |
| 3 | `EarthMoonScene` | Local Earth–Moon layout |
| 4 | `SolarSystemScene` | Helio bodies + Saturn ring |
| 5–9 | `SchematicScene` | Static educational point layouts |

Camera transitions tween position/target over ~1s (`CameraController.beginLevelTransition`).

## Public renderer API

```ts
mount(canvas)
setLevel(level)
setSnapshot(snapshot)
setOverlays(flags)
setCameraMode(mode, bodyId?)
onSelectBody(handler)
resize(width, height)
dispose()
```

## Future extensions

Register additional objects without rewriting the page:

- Add `UniverseObjectKind` + `UniverseObjectRegistration` (already in `types/universe.ts`).
- Extend `SolarSystemScene.sync` or add a `SpacecraftLayer` that reads optional snapshot fields.
- Schematic levels can accept config catalogs for exoplanets / galaxy tours.

Do **not** put spacecraft ephemeris inside Vue SFCs — keep the snapshot builder as the single enrichment point.
