# What's Above Me MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-quality Nuxt 4 MVP that shows celestial objects above the user from coordinates and time.

**Architecture:** Single Nuxt repository with thin client and server-side astronomy calculations via Nitro API. UI stays in reusable Vue components/composables; astronomy logic is isolated in pure `lib/*` modules with shared `types/*`. API handlers validate query input and return typed JSON contracts.

**Tech Stack:** Nuxt 4, Vue 3, TypeScript (strict), TailwindCSS, VueUse, Pinia (available but only if needed), Astronomy Engine JS, Mapbox GL JS (stub only), Nitro server API.

## Global Constraints

- One repository only.
- Composition API only; no Options API.
- Strict TypeScript across app and server.
- Keep business logic independent from UI.
- Use small focused modules/functions; avoid giant classes/files.
- GPS denied flow must include manual coordinates form.
- Compass is static (no device orientation sensor).
- Astronomy calculations run on server only.
- Keep Mapbox as config/env readiness only; do not render map in MVP.
- Do not implement auth, DB, Redis, Docker, microservices, payments, CMS, i18n.

---

### Task 1: Bootstrap Nuxt app and baseline config

**Files:**
- Create: `package.json`, `nuxt.config.ts`, `tsconfig.json`, `.env.example`
- Create: `app/app.vue`, `app/assets/css/tailwind.css`
- Create: `tailwind.config.ts`, `postcss.config.cjs`
- Create: `.gitignore`, `README.md` (initial stub to be expanded in Task 10)

**Interfaces:**
- Consumes: none
- Produces: runnable Nuxt app with strict TS + Tailwind base

- [ ] **Step 1: Scaffold Nuxt project and install dependencies**

```bash
npx nuxi@latest init .
npm install
npm install -D tailwindcss postcss autoprefixer
npm install @vueuse/core pinia astronomy-engine mapbox-gl zod
```

- [ ] **Step 2: Configure Nuxt modules and runtime config**

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2026-07-30',
  devtools: { enabled: true },
  css: ['~/app/assets/css/tailwind.css'],
  modules: ['@pinia/nuxt'],
  typescript: {
    strict: true,
    typeCheck: true
  },
  runtimeConfig: {
    public: {
      mapboxToken: process.env.NUXT_PUBLIC_MAPBOX_TOKEN || ''
    }
  }
})
```

- [ ] **Step 3: Configure Tailwind**

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/components/**/*.{vue,js,ts}',
    './app/layouts/**/*.vue',
    './app/pages/**/*.vue',
    './app/composables/**/*.{js,ts}',
    './app/app.vue'
  ],
  theme: {
    extend: {}
  },
  plugins: []
} satisfies Config
```

- [ ] **Step 4: Run bootstrap checks**

Run: `npm run dev`  
Expected: Nuxt app starts without TS/Tailwind config errors.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "chore: initialize nuxt app with strict ts and tailwind"
```

### Task 2: Create core folder structure and shared types

**Files:**
- Create: `types/astronomy.ts`, `types/location.ts`, `types/api.ts`
- Create: `utils/validation.ts`, `utils/time.ts`
- Create: `lib/direction.ts`

**Interfaces:**
- Consumes: none
- Produces: base shared types + validation and direction utilities

- [ ] **Step 1: Add type contracts**

```ts
// types/astronomy.ts
export type MilkyWayVisibility = 'Excellent' | 'Good' | 'Poor' | 'Not Visible'
export type Direction =
  | 'North' | 'North-East' | 'East' | 'South-East'
  | 'South' | 'South-West' | 'West' | 'North-West'

export interface MoonInfo {
  altitude: number
  azimuth: number
  riseTime: string | null
  setTime: string | null
  illuminatedPercentage: number
  phase: string
}

export interface SunInfo {
  altitude: number
  azimuth: number
  sunrise: string | null
  sunset: string | null
}

export interface PlanetInfo {
  name: string
  altitude: number
  azimuth: number
  isVisible: boolean
}

export interface ConstellationInfo {
  name: string
}

export interface SkySnapshot {
  timestamp: string
  moon: MoonInfo
  sun: SunInfo
  planets: PlanetInfo[]
  constellation: ConstellationInfo
  milkyWayVisibility: MilkyWayVisibility
  directionToLook: Direction
}
```

- [ ] **Step 2: Add location and api types**

```ts
// types/location.ts
export interface Coordinates {
  lat: number
  lng: number
}
```

```ts
// types/api.ts
export interface ApiError {
  statusCode: number
  message: string
}

export interface ISSPass {
  timestamp: string
  latitude: number
  longitude: number
  altitudeKm: number
  velocityKph: number
}
```

- [ ] **Step 3: Add validation utility**

```ts
// utils/validation.ts
import { z } from 'zod'

export const skyQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  time: z.string().datetime().optional()
})
```

- [ ] **Step 4: Add direction helper**

```ts
// lib/direction.ts
import type { Direction } from '~/types/astronomy'

const labels: Direction[] = [
  'North', 'North-East', 'East', 'South-East',
  'South', 'South-West', 'West', 'North-West'
]

export function azimuthToDirection(azimuth: number): Direction {
  const normalized = ((azimuth % 360) + 360) % 360
  const index = Math.round(normalized / 45) % 8
  return labels[index]
}
```

- [ ] **Step 5: Verify typecheck**

Run: `npm run typecheck`  
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add types utils lib
git commit -m "feat: add shared astronomy types and query validation"
```

### Task 3: Build reusable layout and UI foundation

**Files:**
- Create: `app/layouts/default.vue`
- Create: `app/components/SectionTitle.vue`, `SkyCard.vue`, `LoadingLocation.vue`, `PermissionDenied.vue`, `CurrentLocation.vue`
- Modify: `app/app.vue`

**Interfaces:**
- Consumes: `Coordinates`
- Produces: reusable visual primitives and geolocation state components

- [ ] **Step 1: Add default layout**

```vue
<!-- app/layouts/default.vue -->
<template>
  <div class="min-h-screen bg-slate-950 text-slate-100">
    <main class="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <slot />
    </main>
  </div>
</template>
```

- [ ] **Step 2: Add core card/title components**

```vue
<!-- app/components/SkyCard.vue -->
<template>
  <section class="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl shadow-slate-950/30">
    <slot />
  </section>
</template>
```

```vue
<!-- app/components/SectionTitle.vue -->
<script setup lang="ts">
defineProps<{ title: string; subtitle?: string }>()
</script>
<template>
  <header class="mb-3">
    <h2 class="text-xl font-semibold tracking-tight">{{ title }}</h2>
    <p v-if="subtitle" class="mt-1 text-sm text-slate-400">{{ subtitle }}</p>
  </header>
</template>
```

- [ ] **Step 3: Add loading/permission/location components**

```vue
<!-- app/components/PermissionDenied.vue -->
<script setup lang="ts">
const emit = defineEmits<{ submit: [lat: number, lng: number] }>()
const lat = ref('')
const lng = ref('')
const error = ref('')
function submit() {
  const latNum = Number(lat.value)
  const lngNum = Number(lng.value)
  if (!Number.isFinite(latNum) || latNum < -90 || latNum > 90 || !Number.isFinite(lngNum) || lngNum < -180 || lngNum > 180) {
    error.value = 'Toa do khong hop le.'
    return
  }
  error.value = ''
  emit('submit', latNum, lngNum)
}
</script>
```

- [ ] **Step 4: Hook app root to layout**

```vue
<!-- app/app.vue -->
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
```

- [ ] **Step 5: Run visual smoke**

Run: `npm run dev`  
Expected: Home route renders with dark background and no compile errors.

- [ ] **Step 6: Commit**

```bash
git add app/layouts app/components app/app.vue
git commit -m "feat: add dark layout and reusable sky ui primitives"
```

### Task 4: Implement astronomy domain modules

**Files:**
- Create: `lib/moon.ts`, `lib/sun.ts`, `lib/planets.ts`, `lib/constellation.ts`, `lib/milkyway.ts`, `lib/astronomy.ts`
- Modify: `types/astronomy.ts` (if needed for exact returned fields)

**Interfaces:**
- Consumes: `Coordinates`, `Direction`, Astronomy Engine
- Produces: `getMoonInfo`, `getSunInfo`, `getPlanetInfos`, `getConstellationInfo`, `getMilkyWayVisibility`, `buildSkySnapshot`

- [ ] **Step 1: Write failing unit tests for direction + visibility rules**

```ts
// tests/lib/direction.test.ts
import { describe, expect, it } from 'vitest'
import { azimuthToDirection } from '~/lib/direction'
describe('azimuthToDirection', () => {
  it('maps 135 to South-East', () => {
    expect(azimuthToDirection(135)).toBe('South-East')
  })
})
```

- [ ] **Step 2: Set up test runner and run failing test**

Run: `npm install -D vitest @vitest/coverage-v8`  
Run: `npx vitest run tests/lib/direction.test.ts`  
Expected: PASS for current helper; use this as baseline before adding astronomy tests.

- [ ] **Step 3: Implement moon/sun/planets modules with pure functions**

```ts
// lib/moon.ts (shape only)
export function getMoonInfo(lat: number, lng: number, when: Date): MoonInfo {
  // use Astronomy Engine observer + equatorial/horizon calculations
  // return normalized numeric data and ISO times
}
```

- [ ] **Step 4: Implement snapshot orchestrator**

```ts
// lib/astronomy.ts
export function buildSkySnapshot(lat: number, lng: number, when: Date): SkySnapshot {
  const moon = getMoonInfo(lat, lng, when)
  const sun = getSunInfo(lat, lng, when)
  const planets = getPlanetInfos(lat, lng, when)
  const constellation = getConstellationInfo(lat, lng, when)
  const milkyWayVisibility = getMilkyWayVisibility({ moon, sun, when })
  const directionToLook = azimuthToDirection(moon.azimuth)
  return {
    timestamp: when.toISOString(),
    moon,
    sun,
    planets,
    constellation,
    milkyWayVisibility,
    directionToLook
  }
}
```

- [ ] **Step 5: Run tests and typecheck**

Run: `npx vitest run`  
Run: `npm run typecheck`  
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add lib types tests package.json
git commit -m "feat: add modular astronomy calculation domain layer"
```

### Task 5: Implement typed Nitro APIs

**Files:**
- Create: `server/api/sky.get.ts`, `server/api/moon.get.ts`, `server/api/planets.get.ts`, `server/api/iss.get.ts`
- Modify: `utils/validation.ts`, `types/api.ts` (if necessary)

**Interfaces:**
- Consumes: `skyQuerySchema`, `buildSkySnapshot`, `getMoonInfo`, `getPlanetInfos`
- Produces: stable typed JSON API contracts and consistent HTTP error handling

- [ ] **Step 1: Add query parsing helper in API handlers**

```ts
const parsed = skyQuerySchema.safeParse(getQuery(event))
if (!parsed.success) {
  throw createError({ statusCode: 400, statusMessage: 'Invalid coordinates or time parameter.' })
}
```

- [ ] **Step 2: Implement `/api/sky`**

```ts
export default defineEventHandler((event) => {
  const { lat, lng, time } = parseSkyQuery(event)
  const when = time ? new Date(time) : new Date()
  return buildSkySnapshot(lat, lng, when)
})
```

- [ ] **Step 3: Implement moon/planets/iss routes**

```ts
// server/api/iss.get.ts
export default defineEventHandler((): ISSPass => ({
  timestamp: new Date().toISOString(),
  latitude: 10.7769,
  longitude: 106.7009,
  altitudeKm: 408.2,
  velocityKph: 27600
}))
```

- [ ] **Step 4: Add API integration tests (happy path + invalid coords)**

Run: `npx vitest run tests/server`  
Expected: PASS with both success and 400 cases.

- [ ] **Step 5: Commit**

```bash
git add server utils tests
git commit -m "feat: add typed nitro sky, moon, planets and iss api routes"
```

### Task 6: Implement data composables

**Files:**
- Create: `app/composables/useGeolocationInput.ts`, `app/composables/useSkyData.ts`, `app/composables/useCompassData.ts`

**Interfaces:**
- Consumes: browser geolocation API, `/api/sky`, `SkySnapshot`
- Produces: reusable stateful composables for home and compass pages

- [ ] **Step 1: Implement geolocation composable**

```ts
export function useGeolocationInput() {
  const coordinates = ref<Coordinates | null>(null)
  const permissionDenied = ref(false)
  const loading = ref(false)
  async function requestLocation() { /* navigator.geolocation wrapper */ }
  function setManualCoordinates(lat: number, lng: number) { coordinates.value = { lat, lng } }
  return { coordinates, permissionDenied, loading, requestLocation, setManualCoordinates }
}
```

- [ ] **Step 2: Implement sky data fetch composable**

```ts
export function useSkyData() {
  const snapshot = ref<SkySnapshot | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  async function fetchSky(coords: Coordinates) { /* $fetch('/api/sky', { query }) */ }
  return { snapshot, loading, error, fetchSky }
}
```

- [ ] **Step 3: Implement compass data derivation composable**

```ts
export function useCompassData(snapshot: Ref<SkySnapshot | null>) {
  const moonAzimuth = computed(() => snapshot.value?.moon.azimuth ?? 0)
  const visiblePlanets = computed(() => snapshot.value?.planets.filter((p) => p.isVisible) ?? [])
  return { moonAzimuth, visiblePlanets }
}
```

- [ ] **Step 4: Test composables**

Run: `npx vitest run tests/composables`  
Expected: PASS for manual fallback and fetch failure handling.

- [ ] **Step 5: Commit**

```bash
git add app/composables tests
git commit -m "feat: add composables for geolocation, sky fetching and compass data"
```

### Task 7: Build Home page

**Files:**
- Create: `app/components/MoonCard.vue`, `SunCard.vue`, `PlanetCard.vue`
- Modify: `app/pages/index.vue`, `app/components/PermissionDenied.vue`, `CurrentLocation.vue`

**Interfaces:**
- Consumes: `useGeolocationInput`, `useSkyData`, domain types
- Produces: full MVP home screen with loading/error/manual fallback

- [ ] **Step 1: Add metric card components**

```vue
<!-- app/components/MoonCard.vue -->
<script setup lang="ts">
import type { MoonInfo } from '~/types/astronomy'
defineProps<{ moon: MoonInfo }>()
</script>
```

- [ ] **Step 2: Compose home page flow**

```vue
<!-- app/pages/index.vue -->
<script setup lang="ts">
const geo = useGeolocationInput()
const sky = useSkyData()
onMounted(async () => {
  await geo.requestLocation()
  if (geo.coordinates.value) await sky.fetchSky(geo.coordinates.value)
})
</script>
```

- [ ] **Step 3: Handle denied/manual path**

```vue
<PermissionDenied
  v-if="geo.permissionDenied.value"
  @submit="async (lat, lng) => { geo.setManualCoordinates(lat, lng); await sky.fetchSky({ lat, lng }) }"
/>
```

- [ ] **Step 4: Validate responsive UI**

Run: `npm run dev` then check mobile width and desktop width manually.  
Expected: Cards stack cleanly on mobile and keep spacing on desktop.

- [ ] **Step 5: Commit**

```bash
git add app/pages app/components
git commit -m "feat: implement home page sky snapshot experience"
```

### Task 8: Build Compass page

**Files:**
- Create: `app/components/Compass.vue`
- Modify: `app/pages/compass.vue`

**Interfaces:**
- Consumes: `useCompassData`, `SkySnapshot`
- Produces: static compass with Moon and planet direction markers

- [ ] **Step 1: Implement compass rendering component**

```vue
<!-- app/components/Compass.vue -->
<script setup lang="ts">
defineProps<{ moonAzimuth: number; planetAzimuth: number | null }>()
const rotate = (azimuth: number) => `transform: rotate(${azimuth}deg);`
</script>
```

- [ ] **Step 2: Connect compass page data**

```vue
<!-- app/pages/compass.vue -->
<script setup lang="ts">
const route = useRoute()
const lat = Number(route.query.lat)
const lng = Number(route.query.lng)
// fetch sky and bind moon/planet azimuth into Compass
</script>
```

- [ ] **Step 3: Add graceful empty states**

Run: `npm run dev` and open `/compass` without query.  
Expected: message asks user to return home and set location.

- [ ] **Step 4: Commit**

```bash
git add app/pages/compass.vue app/components/Compass.vue
git commit -m "feat: add static compass page for moon and planets"
```

### Task 9: Final docs and cleanup

**Files:**
- Modify: `README.md`
- Create: `docs/api.md` (optional but recommended for typed response examples)
- Modify: any files needed after lint/typecheck fixes

**Interfaces:**
- Consumes: completed app
- Produces: production-ready MVP docs and clean checks

- [ ] **Step 1: Run full verification**

Run:

```bash
npm run lint
npm run typecheck
npx vitest run
npm run build
```

Expected: all pass.

- [ ] **Step 2: Expand README with setup and architecture**

```md
# What's Above Me?
## Features
## Tech Stack
## Local Development
## API Routes
## Future Extensions
```

- [ ] **Step 3: Capture env requirements**

```env
# .env.example
NUXT_PUBLIC_MAPBOX_TOKEN=
```

- [ ] **Step 4: Final commit**

```bash
git add .
git commit -m "docs: finalize mvp documentation and verification notes"
```

## Self-Review Checklist

- Spec coverage: all confirmed decisions A/A/A/B are reflected in tasks.
- Placeholder scan: no TODO/TBD placeholders.
- Type consistency: `SkySnapshot`, `MoonInfo`, `SunInfo`, `PlanetInfo`, `ISSPass`, and `Coordinates` are reused consistently.
- Scope check: plan remains MVP-only and excludes out-of-scope systems.
