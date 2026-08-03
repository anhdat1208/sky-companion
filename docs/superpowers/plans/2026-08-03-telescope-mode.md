# Telescope Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `/telescope` with ranked tonight targets, target detail, hybrid sensor/manual guidance, mock telescope profiles, and star-hop architecture stubs.

**Architecture:** Pure domain logic in `lib/telescope/*`, contracts in `types/telescope.ts`, orchestration in `useTelescope` + `useDevicePointing`, UI in `components/telescope/*` and `pages/telescope.vue`. Calculations use `astronomy-engine` client-side; no new Nitro API. Follows `docs/superpowers/specs/2026-08-03-telescope-mode-design.md`.

**Tech Stack:** Nuxt 4, Vue 3 Composition API, TypeScript strict, TailwindCSS, Vitest, astronomy-engine, existing geolocation composables/components.

## Global Constraints

- Vietnamese UI labels; English celestial object names.
- No AR, Bluetooth, GoTo, DB, or full star-hop algorithm.
- Hybrid pointing: DeviceOrientation preferred; manual az/alt fallback required.
- Profiles are local mock data; FOV drives lock threshold: `clamp(trueFovDeg * 0.25, 0.5, 2.0)`.
- Δaz negative = rotate left; Δaz positive = rotate right; Δalt positive = raise; Δalt negative = lower.
- Business logic must stay UI-free and unit-tested.
- Match existing slate/sky visual language (`SkyCard`, `SectionTitle`, etc.).
- Composition API only; no Options API.
- Keep modules small and focused.

## File Map

| File | Responsibility |
|------|----------------|
| `types/telescope.ts` | All telescope domain types + future hooks |
| `lib/telescope/catalog.ts` | Seed `TargetObject[]` |
| `lib/telescope/position.ts` | Alt/az + rise/set for a target |
| `lib/telescope/profiles.ts` | Mock profiles + mag/FOV helpers |
| `lib/telescope/guidance.ts` | Deltas, lock, Vietnamese messages |
| `lib/telescope/ranking.ts` | Tonight ranking + scores |
| `lib/telescope/starHop.ts` | Stub `buildStarHopPlan` |
| `app/composables/useDevicePointing.ts` | Hybrid sensor/manual pointing |
| `app/composables/useTelescope.ts` | Page orchestration |
| `app/components/telescope/*.vue` | Section UI |
| `app/pages/telescope.vue` | Page composition |
| `app/pages/index.vue` | Entry link |
| `tests/lib/telescope/*.test.ts` | Domain tests |
| `tests/composables/useDevicePointing.test.ts` | Pointing tests |

---

### Task 1: Domain types

**Files:**
- Create: `types/telescope.ts`
- Test: none (types only; verified by later compile/tests)

**Interfaces:**
- Consumes: `Direction` from `types/astronomy.ts`
- Produces: exported types listed below (exact names used by later tasks)

- [ ] **Step 1: Create `types/telescope.ts`**

```ts
import type { Direction } from './astronomy'

export type ObjectType =
  | 'moon'
  | 'planet'
  | 'galaxy'
  | 'nebula'
  | 'starCluster'
  | 'star'
  | 'other'

export type RecommendedInstrument = 'eye' | 'binocular' | 'telescope'
export type Difficulty = 'easy' | 'moderate' | 'hard'
export type DynamicBody =
  | 'moon'
  | 'mercury'
  | 'venus'
  | 'mars'
  | 'jupiter'
  | 'saturn'

export type GuidanceMode = 'manual' | 'sensor' | 'goto' | 'ar'
export type GuidanceStatus =
  | 'need-target'
  | 'below-horizon'
  | 'aligning'
  | 'locked'

export interface TargetObject {
  id: string
  name: string
  objectType: ObjectType
  raHours: number | null
  decDeg: number | null
  constellation: string
  apparentMagnitude: number | null
  distanceLy: number | null
  difficulty: Difficulty
  recommendedInstrument: RecommendedInstrument
  dynamicBody?: DynamicBody
}

export interface RankedTarget {
  target: TargetObject
  altitude: number
  azimuth: number
  direction: Direction
  visibilityScore: 1 | 2 | 3 | 4 | 5
  bestObservationTime: string
  difficulty: Difficulty
  recommendedInstrument: RecommendedInstrument
}

export interface TargetDetail extends RankedTarget {
  riseTime: string | null
  setTime: string | null
}

export interface DevicePointing {
  azimuth: number
  altitude: number
  source: 'sensor' | 'manual'
  accuracyDeg?: number | null
}

export interface GuidanceInstruction {
  status: GuidanceStatus
  deltaAzimuthDeg: number
  deltaAltitudeDeg: number
  messages: string[]
  locked: boolean
}

export interface ReferenceStar {
  id: string
  name: string
  raHours: number
  decDeg: number
  magnitude: number
}

export interface HopStep {
  id: string
  order: number
  from: ReferenceStar | TargetObject
  to: ReferenceStar | TargetObject
  angularDistanceDeg: number
  instruction: string
}

export interface Telescope {
  id: string
  name: string
  apertureMm: number
  focalLengthMm: number
  type: 'binocular' | 'refractor' | 'reflector' | 'compound' | 'other'
}

export interface Eyepiece {
  id: string
  name: string
  focalLengthMm: number
  apparentFovDeg: number
}

export interface Magnification {
  value: number
}

export interface FieldOfView {
  trueFovDeg: number
}

export interface TelescopeProfile {
  id: string
  label: string
  telescope: Telescope
  eyepiece: Eyepiece | null
  magnification: Magnification
  fieldOfView: FieldOfView
}

export interface CatalogProvider {
  listTargets(): TargetObject[] | Promise<TargetObject[]>
}

export interface TelescopeMountAdapter {
  mode: Extract<GuidanceMode, 'goto' | 'sensor'>
  connect?(): Promise<void>
  slewTo?(altAz: { altitude: number, azimuth: number }): Promise<void>
  disconnect?(): Promise<void>
}
```

- [ ] **Step 2: Commit**

```bash
git add types/telescope.ts
git commit -m "feat(telescope): add domain types"
```

---

### Task 2: Seed catalog

**Files:**
- Create: `lib/telescope/catalog.ts`
- Test: `tests/lib/telescope/catalog.test.ts`

**Interfaces:**
- Consumes: `TargetObject` from `types/telescope.ts`
- Produces: `TELESCOPE_CATALOG: readonly TargetObject[]`, `getCatalogTargets(): TargetObject[]`

- [ ] **Step 1: Write the failing test**

```ts
// tests/lib/telescope/catalog.test.ts
import { describe, expect, it } from 'vitest'
import { getCatalogTargets } from '../../../lib/telescope/catalog'

describe('getCatalogTargets', () => {
  it('includes moon, five planets, and three deep-sky objects', () => {
    const targets = getCatalogTargets()
    const names = targets.map(t => t.name)

    expect(names).toEqual(expect.arrayContaining([
      'Moon',
      'Mercury',
      'Venus',
      'Mars',
      'Jupiter',
      'Saturn',
      'Andromeda Galaxy',
      'Orion Nebula',
      'Pleiades'
    ]))
    expect(targets).toHaveLength(9)
  })

  it('marks solar-system bodies as dynamic and deep-sky with RA/Dec', () => {
    const targets = getCatalogTargets()
    const moon = targets.find(t => t.id === 'moon')
    const andromeda = targets.find(t => t.id === 'm31')

    expect(moon?.dynamicBody).toBe('moon')
    expect(moon?.raHours).toBeNull()
    expect(andromeda?.raHours).not.toBeNull()
    expect(andromeda?.decDeg).not.toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/lib/telescope/catalog.test.ts`  
Expected: FAIL (module not found)

- [ ] **Step 3: Implement catalog**

```ts
// lib/telescope/catalog.ts
import type { TargetObject } from '../../types/telescope'

export const TELESCOPE_CATALOG: readonly TargetObject[] = [
  {
    id: 'moon',
    name: 'Moon',
    objectType: 'moon',
    raHours: null,
    decDeg: null,
    constellation: '—',
    apparentMagnitude: -12.6,
    distanceLy: null,
    difficulty: 'easy',
    recommendedInstrument: 'eye',
    dynamicBody: 'moon'
  },
  {
    id: 'mercury',
    name: 'Mercury',
    objectType: 'planet',
    raHours: null,
    decDeg: null,
    constellation: '—',
    apparentMagnitude: 0.0,
    distanceLy: null,
    difficulty: 'moderate',
    recommendedInstrument: 'binocular',
    dynamicBody: 'mercury'
  },
  {
    id: 'venus',
    name: 'Venus',
    objectType: 'planet',
    raHours: null,
    decDeg: null,
    constellation: '—',
    apparentMagnitude: -4.0,
    distanceLy: null,
    difficulty: 'easy',
    recommendedInstrument: 'eye',
    dynamicBody: 'venus'
  },
  {
    id: 'mars',
    name: 'Mars',
    objectType: 'planet',
    raHours: null,
    decDeg: null,
    constellation: '—',
    apparentMagnitude: 0.8,
    distanceLy: null,
    difficulty: 'easy',
    recommendedInstrument: 'eye',
    dynamicBody: 'mars'
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    objectType: 'planet',
    raHours: null,
    decDeg: null,
    constellation: '—',
    apparentMagnitude: -2.2,
    distanceLy: null,
    difficulty: 'easy',
    recommendedInstrument: 'eye',
    dynamicBody: 'jupiter'
  },
  {
    id: 'saturn',
    name: 'Saturn',
    objectType: 'planet',
    raHours: null,
    decDeg: null,
    constellation: '—',
    apparentMagnitude: 0.5,
    distanceLy: null,
    difficulty: 'easy',
    recommendedInstrument: 'binocular',
    dynamicBody: 'saturn'
  },
  {
    id: 'm31',
    name: 'Andromeda Galaxy',
    objectType: 'galaxy',
    raHours: 0.712,
    decDeg: 41.269,
    constellation: 'Andromeda',
    apparentMagnitude: 3.4,
    distanceLy: 2_500_000,
    difficulty: 'moderate',
    recommendedInstrument: 'binocular'
  },
  {
    id: 'm42',
    name: 'Orion Nebula',
    objectType: 'nebula',
    raHours: 5.588,
    decDeg: -5.391,
    constellation: 'Orion',
    apparentMagnitude: 4.0,
    distanceLy: 1344,
    difficulty: 'easy',
    recommendedInstrument: 'binocular'
  },
  {
    id: 'm45',
    name: 'Pleiades',
    objectType: 'starCluster',
    raHours: 3.791,
    decDeg: 24.105,
    constellation: 'Taurus',
    apparentMagnitude: 1.6,
    distanceLy: 444,
    difficulty: 'easy',
    recommendedInstrument: 'eye'
  }
]

export function getCatalogTargets(): TargetObject[] {
  return TELESCOPE_CATALOG.map(target => ({ ...target }))
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/lib/telescope/catalog.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/telescope/catalog.ts tests/lib/telescope/catalog.test.ts
git commit -m "feat(telescope): add seed catalog"
```

---

### Task 3: Position helpers

**Files:**
- Create: `lib/telescope/position.ts`
- Test: `tests/lib/telescope/position.test.ts`

**Interfaces:**
- Consumes: `TargetObject`; `astronomy-engine`; `azimuthToDirection` from `lib/direction.ts`
- Produces:
  - `getTargetHorizontal(target, lat, lng, when): { altitude: number, azimuth: number }`
  - `getTargetRiseSet(target, lat, lng, when): { riseTime: string | null, setTime: string | null }`
  - `buildTargetDetail(ranked: RankedTarget, lat, lng, when): TargetDetail`

- [ ] **Step 1: Write the failing test**

```ts
// tests/lib/telescope/position.test.ts
import { describe, expect, it } from 'vitest'
import { getCatalogTargets } from '../../../lib/telescope/catalog'
import { getTargetHorizontal, getTargetRiseSet } from '../../../lib/telescope/position'

describe('getTargetHorizontal', () => {
  it('returns finite alt/az for the Moon from Hanoi at a fixed time', () => {
    const moon = getCatalogTargets().find(t => t.id === 'moon')!
    const when = new Date('2026-08-03T14:00:00Z')
    const pos = getTargetHorizontal(moon, 21.0285, 105.8542, when)

    expect(Number.isFinite(pos.altitude)).toBe(true)
    expect(Number.isFinite(pos.azimuth)).toBe(true)
    expect(pos.azimuth).toBeGreaterThanOrEqual(0)
    expect(pos.azimuth).toBeLessThan(360)
  })

  it('returns finite alt/az for Andromeda from catalog RA/Dec', () => {
    const m31 = getCatalogTargets().find(t => t.id === 'm31')!
    const when = new Date('2026-08-03T14:00:00Z')
    const pos = getTargetHorizontal(m31, 21.0285, 105.8542, when)

    expect(Number.isFinite(pos.altitude)).toBe(true)
    expect(Number.isFinite(pos.azimuth)).toBe(true)
  })
})

describe('getTargetRiseSet', () => {
  it('returns ISO strings or null for Moon', () => {
    const moon = getCatalogTargets().find(t => t.id === 'moon')!
    const result = getTargetRiseSet(moon, 21.0285, 105.8542, new Date('2026-08-03T00:00:00Z'))

    if (result.riseTime !== null) {
      expect(Number.isNaN(Date.parse(result.riseTime))).toBe(false)
    }
    if (result.setTime !== null) {
      expect(Number.isNaN(Date.parse(result.setTime))).toBe(false)
    }
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/lib/telescope/position.test.ts`  
Expected: FAIL (module not found)

- [ ] **Step 3: Implement position module**

```ts
// lib/telescope/position.ts
import {
  Body,
  Equator,
  Horizon,
  Observer,
  SearchRiseSet
} from 'astronomy-engine'
import { azimuthToDirection } from '../direction'
import type { RankedTarget, TargetDetail, TargetObject } from '../../types/telescope'
import type { DynamicBody } from '../../types/telescope'

const BODY_MAP: Record<DynamicBody, Body> = {
  moon: Body.Moon,
  mercury: Body.Mercury,
  venus: Body.Venus,
  mars: Body.Mars,
  jupiter: Body.Jupiter,
  saturn: Body.Saturn
}

function round(value: number, decimals = 1): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

function resolveEquatorial(
  target: TargetObject,
  observer: Observer,
  when: Date
): { ra: number, dec: number } {
  if (target.dynamicBody) {
    const equatorial = Equator(BODY_MAP[target.dynamicBody], when, observer, true, true)
    return { ra: equatorial.ra, dec: equatorial.dec }
  }

  if (target.raHours === null || target.decDeg === null) {
    throw new Error(`Target ${target.id} is missing equatorial coordinates.`)
  }

  return { ra: target.raHours, dec: target.decDeg }
}

export function getTargetHorizontal(
  target: TargetObject,
  lat: number,
  lng: number,
  when: Date
): { altitude: number, azimuth: number } {
  const observer = new Observer(lat, lng, 0)
  const { ra, dec } = resolveEquatorial(target, observer, when)
  const horizontal = Horizon(when, observer, ra, dec, 'normal')

  return {
    altitude: round(horizontal.altitude),
    azimuth: round(horizontal.azimuth)
  }
}

function findAltitudeCrossing(
  target: TargetObject,
  lat: number,
  lng: number,
  start: Date,
  direction: 1 | -1,
  hoursLimit = 24
): Date | null {
  const stepMs = 10 * 60 * 1000
  const limitMs = hoursLimit * 60 * 60 * 1000
  let previous = getTargetHorizontal(target, lat, lng, start).altitude
  let t = start.getTime()

  for (let elapsed = stepMs; elapsed <= limitMs; elapsed += stepMs) {
    const at = new Date(t + elapsed)
    const altitude = getTargetHorizontal(target, lat, lng, at).altitude
    const crossed = direction === 1
      ? previous < 0 && altitude >= 0
      : previous >= 0 && altitude < 0

    if (crossed) {
      return at
    }

    previous = altitude
  }

  return null
}

export function getTargetRiseSet(
  target: TargetObject,
  lat: number,
  lng: number,
  when: Date
): { riseTime: string | null, setTime: string | null } {
  if (target.dynamicBody) {
    const observer = new Observer(lat, lng, 0)
    const body = BODY_MAP[target.dynamicBody]
    const rise = SearchRiseSet(body, observer, 1, when, 2)
    const set = SearchRiseSet(body, observer, -1, when, 2)

    return {
      riseTime: rise?.date.toISOString() ?? null,
      setTime: set?.date.toISOString() ?? null
    }
  }

  const rise = findAltitudeCrossing(target, lat, lng, when, 1)
  const set = findAltitudeCrossing(target, lat, lng, when, -1)

  return {
    riseTime: rise?.toISOString() ?? null,
    setTime: set?.toISOString() ?? null
  }
}

export function buildTargetDetail(
  ranked: RankedTarget,
  lat: number,
  lng: number,
  when: Date
): TargetDetail {
  const riseSet = getTargetRiseSet(ranked.target, lat, lng, when)

  return {
    ...ranked,
    direction: azimuthToDirection(ranked.azimuth),
    riseTime: riseSet.riseTime,
    setTime: riseSet.setTime
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/lib/telescope/position.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/telescope/position.ts tests/lib/telescope/position.test.ts
git commit -m "feat(telescope): add target position helpers"
```

---

### Task 4: Telescope profiles

**Files:**
- Create: `lib/telescope/profiles.ts`
- Test: `tests/lib/telescope/profiles.test.ts`

**Interfaces:**
- Consumes: profile types from `types/telescope.ts`
- Produces:
  - `computeMagnification(telescope, eyepiece): Magnification`
  - `computeTrueFov(eyepiece, magnification): FieldOfView`
  - `getMockProfiles(): TelescopeProfile[]`
  - `lockThresholdDeg(trueFovDeg: number): number`

- [ ] **Step 1: Write the failing test**

```ts
// tests/lib/telescope/profiles.test.ts
import { describe, expect, it } from 'vitest'
import {
  computeMagnification,
  computeTrueFov,
  getMockProfiles,
  lockThresholdDeg
} from '../../../lib/telescope/profiles'

describe('optics helpers', () => {
  it('computes magnification from focal lengths', () => {
    expect(computeMagnification(
      { id: 't', name: 'T', apertureMm: 130, focalLengthMm: 650, type: 'reflector' },
      { id: 'e', name: 'E', focalLengthMm: 25, apparentFovDeg: 50 }
    )).toEqual({ value: 26 })
  })

  it('computes true FOV from apparent FOV / magnification', () => {
    expect(computeTrueFov(
      { id: 'e', name: 'E', focalLengthMm: 25, apparentFovDeg: 50 },
      { value: 26 }
    ).trueFovDeg).toBeCloseTo(50 / 26, 5)
  })

  it('clamps lock threshold between 0.5 and 2.0', () => {
    expect(lockThresholdDeg(1)).toBe(0.5)
    expect(lockThresholdDeg(4)).toBe(1)
    expect(lockThresholdDeg(20)).toBe(2)
  })

  it('returns three mock profiles including binoculars', () => {
    const profiles = getMockProfiles()
    expect(profiles.length).toBeGreaterThanOrEqual(3)
    expect(profiles.some(p => p.telescope.type === 'binocular')).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/lib/telescope/profiles.test.ts`  
Expected: FAIL

- [ ] **Step 3: Implement profiles**

```ts
// lib/telescope/profiles.ts
import type {
  Eyepiece,
  FieldOfView,
  Magnification,
  Telescope,
  TelescopeProfile
} from '../../types/telescope'

export function computeMagnification(
  telescope: Telescope,
  eyepiece: Eyepiece
): Magnification {
  return {
    value: Math.round(telescope.focalLengthMm / eyepiece.focalLengthMm)
  }
}

export function computeTrueFov(
  eyepiece: Eyepiece,
  magnification: Magnification
): FieldOfView {
  return {
    trueFovDeg: eyepiece.apparentFovDeg / magnification.value
  }
}

export function lockThresholdDeg(trueFovDeg: number): number {
  const raw = trueFovDeg * 0.25
  return Math.min(2, Math.max(0.5, raw))
}

export function getMockProfiles(): TelescopeProfile[] {
  const reflector: Telescope = {
    id: 'newton-130-650',
    name: 'Newtonian 130/650',
    apertureMm: 130,
    focalLengthMm: 650,
    type: 'reflector'
  }

  const ep25: Eyepiece = {
    id: 'ep-25',
    name: '25mm Plössl',
    focalLengthMm: 25,
    apparentFovDeg: 50
  }

  const ep10: Eyepiece = {
    id: 'ep-10',
    name: '10mm Plössl',
    focalLengthMm: 10,
    apparentFovDeg: 50
  }

  const mag25 = computeMagnification(reflector, ep25)
  const mag10 = computeMagnification(reflector, ep10)

  const binoculars: Telescope = {
    id: 'bino-10x50',
    name: 'Binoculars 10×50',
    apertureMm: 50,
    focalLengthMm: 500,
    type: 'binocular'
  }

  return [
    {
      id: 'bino-10x50',
      label: 'Ống nhòm 10×50',
      telescope: binoculars,
      eyepiece: null,
      magnification: { value: 10 },
      fieldOfView: { trueFovDeg: 6.5 }
    },
    {
      id: 'newton-25',
      label: 'Newtonian 130/650 + 25mm',
      telescope: reflector,
      eyepiece: ep25,
      magnification: mag25,
      fieldOfView: computeTrueFov(ep25, mag25)
    },
    {
      id: 'newton-10',
      label: 'Newtonian 130/650 + 10mm',
      telescope: reflector,
      eyepiece: ep10,
      magnification: mag10,
      fieldOfView: computeTrueFov(ep10, mag10)
    }
  ]
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/lib/telescope/profiles.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/telescope/profiles.ts tests/lib/telescope/profiles.test.ts
git commit -m "feat(telescope): add mock profiles and optics helpers"
```

---

### Task 5: Guidance instructions

**Files:**
- Create: `lib/telescope/guidance.ts`
- Test: `tests/lib/telescope/guidance.test.ts`

**Interfaces:**
- Consumes: `DevicePointing`, `FieldOfView`; `lockThresholdDeg` from profiles
- Produces: `buildGuidanceInstruction(params): GuidanceInstruction`

Params shape:

```ts
{
  targetAltitude: number | null
  targetAzimuth: number | null
  pointing: DevicePointing | null
  fieldOfView: FieldOfView
}
```

- [ ] **Step 1: Write the failing test**

```ts
// tests/lib/telescope/guidance.test.ts
import { describe, expect, it } from 'vitest'
import { buildGuidanceInstruction } from '../../../lib/telescope/guidance'

const pointing = { azimuth: 100, altitude: 20, source: 'manual' as const }
const fov = { trueFovDeg: 4 } // lockThreshold = 1

describe('buildGuidanceInstruction', () => {
  it('returns need-target when target missing', () => {
    const result = buildGuidanceInstruction({
      targetAltitude: null,
      targetAzimuth: null,
      pointing,
      fieldOfView: fov
    })
    expect(result.status).toBe('need-target')
    expect(result.locked).toBe(false)
  })

  it('returns below-horizon when target altitude is negative', () => {
    const result = buildGuidanceInstruction({
      targetAltitude: -5,
      targetAzimuth: 120,
      pointing,
      fieldOfView: fov
    })
    expect(result.status).toBe('below-horizon')
  })

  it('asks to rotate left when target is counterclockwise', () => {
    const result = buildGuidanceInstruction({
      targetAltitude: 20,
      targetAzimuth: 90,
      pointing,
      fieldOfView: fov
    })
    expect(result.deltaAzimuthDeg).toBe(-10)
    expect(result.messages.some(m => m.includes('Xoay trái'))).toBe(true)
  })

  it('asks to raise telescope when target is higher', () => {
    const result = buildGuidanceInstruction({
      targetAltitude: 35,
      targetAzimuth: 100,
      pointing,
      fieldOfView: fov
    })
    expect(result.deltaAltitudeDeg).toBe(15)
    expect(result.messages.some(m => m.includes('Nâng'))).toBe(true)
  })

  it('locks when within FOV-derived threshold', () => {
    const result = buildGuidanceInstruction({
      targetAltitude: 20.4,
      targetAzimuth: 100.5,
      pointing,
      fieldOfView: fov
    })
    expect(result.status).toBe('locked')
    expect(result.locked).toBe(true)
    expect(result.messages).toContain('Target Locked')
    expect(result.messages.some(m => m.includes('Đã khóa mục tiêu'))).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/lib/telescope/guidance.test.ts`  
Expected: FAIL

- [ ] **Step 3: Implement guidance**

```ts
// lib/telescope/guidance.ts
import type {
  DevicePointing,
  FieldOfView,
  GuidanceInstruction
} from '../../types/telescope'
import { lockThresholdDeg } from './profiles'

function normalizeDeltaAzimuth(delta: number): number {
  let value = ((delta + 180) % 360 + 360) % 360 - 180
  if (value === -180) {
    value = 180
  }
  return Math.round(value * 10) / 10
}

function round1(value: number): number {
  return Math.round(value * 10) / 10
}

export function buildGuidanceInstruction(input: {
  targetAltitude: number | null
  targetAzimuth: number | null
  pointing: DevicePointing | null
  fieldOfView: FieldOfView
}): GuidanceInstruction {
  if (
    input.targetAltitude === null
    || input.targetAzimuth === null
    || input.pointing === null
  ) {
    return {
      status: 'need-target',
      deltaAzimuthDeg: 0,
      deltaAltitudeDeg: 0,
      messages: ['Chọn một mục tiêu để bắt đầu căn chỉnh.'],
      locked: false
    }
  }

  if (input.targetAltitude < 0) {
    return {
      status: 'below-horizon',
      deltaAzimuthDeg: 0,
      deltaAltitudeDeg: 0,
      messages: ['Mục tiêu đang dưới chân trời — chưa quan sát được.'],
      locked: false
    }
  }

  const deltaAzimuthDeg = normalizeDeltaAzimuth(
    input.targetAzimuth - input.pointing.azimuth
  )
  const deltaAltitudeDeg = round1(input.targetAltitude - input.pointing.altitude)
  const threshold = lockThresholdDeg(input.fieldOfView.trueFovDeg)
  const locked =
    Math.abs(deltaAzimuthDeg) <= threshold
    && Math.abs(deltaAltitudeDeg) <= threshold

  if (locked) {
    return {
      status: 'locked',
      deltaAzimuthDeg,
      deltaAltitudeDeg,
      messages: ['Target Locked', 'Đã khóa mục tiêu'],
      locked: true
    }
  }

  const messages: string[] = []
  if (Math.abs(deltaAzimuthDeg) > threshold) {
    const degrees = Math.abs(deltaAzimuthDeg).toFixed(0)
    messages.push(
      deltaAzimuthDeg < 0
        ? `Xoay trái ${degrees}°`
        : `Xoay phải ${degrees}°`
    )
  }
  if (Math.abs(deltaAltitudeDeg) > threshold) {
    const degrees = Math.abs(deltaAltitudeDeg).toFixed(0)
    messages.push(
      deltaAltitudeDeg > 0
        ? `Nâng ống kính ${degrees}°`
        : `Hạ ống kính ${degrees}°`
    )
  }

  return {
    status: 'aligning',
    deltaAzimuthDeg,
    deltaAltitudeDeg,
    messages,
    locked: false
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/lib/telescope/guidance.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/telescope/guidance.ts tests/lib/telescope/guidance.test.ts
git commit -m "feat(telescope): add guidance instructions"
```

---

### Task 6: Tonight ranking

**Files:**
- Create: `lib/telescope/ranking.ts`
- Test: `tests/lib/telescope/ranking.test.ts`

**Interfaces:**
- Consumes: catalog, position, profiles types; sun/moon via astronomy-engine
- Produces: `rankTonightTargets(lat, lng, when, profile?): RankedTarget[]`

Scoring rules (from spec):
1. Include all seed targets; below horizon → score capped at 1.
2. Prefer dark sky (sun altitude).
3. Higher altitude → higher score.
4. Brighter magnitude → higher score.
5. Deep-sky: penalize bright moon nearby.
6. Score clamped 1–5.
7. `bestObservationTime` = best sample from `now` until next sunrise (30 min steps).
8. Sort by score desc, altitude desc, magnitude asc (brighter first).

- [ ] **Step 1: Write the failing test**

```ts
// tests/lib/telescope/ranking.test.ts
import { describe, expect, it } from 'vitest'
import { rankTonightTargets } from '../../../lib/telescope/ranking'

describe('rankTonightTargets', () => {
  it('returns nine ranked targets with scores 1–5', () => {
    const ranked = rankTonightTargets(21.0285, 105.8542, new Date('2026-08-03T14:00:00Z'))
    expect(ranked).toHaveLength(9)
    for (const item of ranked) {
      expect(item.visibilityScore).toBeGreaterThanOrEqual(1)
      expect(item.visibilityScore).toBeLessThanOrEqual(5)
      expect(Number.isNaN(Date.parse(item.bestObservationTime))).toBe(false)
    }
  })

  it('sorts higher scores before lower scores', () => {
    const ranked = rankTonightTargets(21.0285, 105.8542, new Date('2026-08-03T14:00:00Z'))
    for (let i = 1; i < ranked.length; i += 1) {
      const prev = ranked[i - 1]!
      const curr = ranked[i]!
      expect(prev.visibilityScore).toBeGreaterThanOrEqual(curr.visibilityScore)
    }
  })

  it('caps below-horizon targets at score 1', () => {
    const ranked = rankTonightTargets(21.0285, 105.8542, new Date('2026-08-03T14:00:00Z'))
    for (const item of ranked) {
      if (item.altitude < 0) {
        expect(item.visibilityScore).toBe(1)
      }
    }
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/lib/telescope/ranking.test.ts`  
Expected: FAIL

- [ ] **Step 3: Implement ranking**

```ts
// lib/telescope/ranking.ts
import { Body, Equator, Horizon, Observer } from 'astronomy-engine'
import { azimuthToDirection } from '../direction'
import type {
  RankedTarget,
  RecommendedInstrument,
  TargetObject,
  TelescopeProfile
} from '../../types/telescope'
import { getCatalogTargets } from './catalog'
import { getTargetHorizontal } from './position'

function round1(value: number): number {
  return Math.round(value * 10) / 10
}

function sunAltitude(lat: number, lng: number, when: Date): number {
  const observer = new Observer(lat, lng, 0)
  const equatorial = Equator(Body.Sun, when, observer, true, true)
  return Horizon(when, observer, equatorial.ra, equatorial.dec, 'normal').altitude
}

function angularSeparationDeg(
  a: { altitude: number, azimuth: number },
  b: { altitude: number, azimuth: number }
): number {
  const dAz = Math.min(
    Math.abs(a.azimuth - b.azimuth),
    360 - Math.abs(a.azimuth - b.azimuth)
  )
  const dAlt = Math.abs(a.altitude - b.altitude)
  return Math.hypot(dAz, dAlt)
}

function clampScore(value: number): RankedTarget['visibilityScore'] {
  const clamped = Math.min(5, Math.max(1, Math.round(value)))
  return clamped as RankedTarget['visibilityScore']
}

function scoreAt(
  target: TargetObject,
  lat: number,
  lng: number,
  when: Date
): { score: number, altitude: number, azimuth: number } {
  const pos = getTargetHorizontal(target, lat, lng, when)
  const sunAlt = sunAltitude(lat, lng, when)
  let score = 1

  if (sunAlt < -6) score += 1
  if (sunAlt < -12) score += 1
  if (sunAlt < -18) score += 1
  if (pos.altitude > 30) score += 1
  if (target.apparentMagnitude !== null && target.apparentMagnitude <= 2) score += 1

  const isDeepSky = target.objectType === 'galaxy'
    || target.objectType === 'nebula'
    || target.objectType === 'starCluster'

  if (isDeepSky) {
    const moon = getCatalogTargets().find(t => t.id === 'moon')!
    const moonPos = getTargetHorizontal(moon, lat, lng, when)
    if (moonPos.altitude > 20 && angularSeparationDeg(pos, moonPos) < 40) {
      score -= 1
    }
  }

  if (pos.altitude < 0) {
    score = 1
  }

  return { score, altitude: pos.altitude, azimuth: pos.azimuth }
}

function sampleTimes(lat: number, lng: number, start: Date): Date[] {
  const times: Date[] = []
  const stepMs = 30 * 60 * 1000
  const limitMs = 24 * 60 * 60 * 1000

  for (let elapsed = 0; elapsed <= limitMs; elapsed += stepMs) {
    const at = new Date(start.getTime() + elapsed)
    times.push(at)
    if (elapsed > 0) {
      const prev = new Date(start.getTime() + elapsed - stepMs)
      const prevSun = sunAltitude(lat, lng, prev)
      const sun = sunAltitude(lat, lng, at)
      if (prevSun < 0 && sun >= 0) {
        break
      }
    }
  }

  return times
}

function adjustInstrument(
  target: TargetObject,
  profile?: TelescopeProfile
): RecommendedInstrument {
  if (!profile) {
    return target.recommendedInstrument
  }

  if (
    profile.magnification.value >= 50
    && target.apparentMagnitude !== null
    && target.apparentMagnitude > 6
  ) {
    return 'telescope'
  }

  if (
    profile.fieldOfView.trueFovDeg < 1
    && target.recommendedInstrument === 'binocular'
  ) {
    return 'telescope'
  }

  return target.recommendedInstrument
}

export function rankTonightTargets(
  lat: number,
  lng: number,
  when: Date,
  profile?: TelescopeProfile
): RankedTarget[] {
  const times = sampleTimes(lat, lng, when)

  return getCatalogTargets().map((target) => {
    const now = scoreAt(target, lat, lng, when)
    let best = { ...now, at: when }

    for (const sample of times) {
      const candidate = scoreAt(target, lat, lng, sample)
      if (candidate.score > best.score || (
        candidate.score === best.score && candidate.altitude > best.altitude
      )) {
        best = { ...candidate, at: sample }
      }
    }

    const visibilityScore = now.altitude < 0
      ? 1 as const
      : clampScore(now.score)

    return {
      target,
      altitude: round1(now.altitude),
      azimuth: round1(now.azimuth),
      direction: azimuthToDirection(now.azimuth),
      visibilityScore,
      bestObservationTime: best.at.toISOString(),
      difficulty: target.difficulty,
      recommendedInstrument: adjustInstrument(target, profile)
    }
  }).sort((a, b) => {
    if (b.visibilityScore !== a.visibilityScore) {
      return b.visibilityScore - a.visibilityScore
    }
    if (b.altitude !== a.altitude) {
      return b.altitude - a.altitude
    }
    const magA = a.target.apparentMagnitude ?? 99
    const magB = b.target.apparentMagnitude ?? 99
    return magA - magB
  })
}
```

Remove the unused note about VisibilityScore — scores use `RankedTarget['visibilityScore']` only.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/lib/telescope/ranking.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/telescope/ranking.ts tests/lib/telescope/ranking.test.ts
git commit -m "feat(telescope): rank tonight best targets"
```

---

### Task 7: Star-hop stub

**Files:**
- Create: `lib/telescope/starHop.ts`
- Test: `tests/lib/telescope/starHop.test.ts`

**Interfaces:**
- Consumes: `TargetObject`, `ReferenceStar`, `HopStep`
- Produces: `buildStarHopPlan(target: TargetObject, refs?: ReferenceStar[]): HopStep[]`

- [ ] **Step 1: Write the failing test**

```ts
// tests/lib/telescope/starHop.test.ts
import { describe, expect, it } from 'vitest'
import { getCatalogTargets } from '../../../lib/telescope/catalog'
import { buildStarHopPlan } from '../../../lib/telescope/starHop'

describe('buildStarHopPlan', () => {
  it('returns an empty plan stub for any target', () => {
    const target = getCatalogTargets()[0]!
    expect(buildStarHopPlan(target)).toEqual([])
    expect(buildStarHopPlan(target, [])).toEqual([])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/lib/telescope/starHop.test.ts`  
Expected: FAIL

- [ ] **Step 3: Implement stub**

```ts
// lib/telescope/starHop.ts
import type { HopStep, ReferenceStar, TargetObject } from '../../types/telescope'

/**
 * Future star-hop pathfinder.
 * Contract: return ordered HopStep[] from bright reference stars to the target.
 * Current MVP returns [] intentionally.
 */
export function buildStarHopPlan(
  _target: TargetObject,
  _refs: ReferenceStar[] = []
): HopStep[] {
  return []
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/lib/telescope/starHop.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/telescope/starHop.ts tests/lib/telescope/starHop.test.ts
git commit -m "feat(telescope): add star-hop plan stub"
```

---

### Task 8: `useDevicePointing` composable

**Files:**
- Create: `app/composables/useDevicePointing.ts`
- Test: `tests/composables/useDevicePointing.test.ts`

**Interfaces:**
- Consumes: browser `DeviceOrientationEvent` (mocked in tests)
- Produces: `{ pointing, mode, sensorAvailable, sensorError, setManualPointing, enableSensor, disableSensor }`
  - `pointing: Ref<DevicePointing>`
  - default manual `{ azimuth: 0, altitude: 30, source: 'manual' }`
  - `enableSensor()` attempts permission / listener; on failure sets `sensorError` and keeps manual
  - absolute compass: prefer `webkitCompassHeading` when present; else derive from `alpha` (document chosen formula in code)
  - altitude from `beta` clamped to [-90, 90]

- [ ] **Step 1: Write the failing test**

```ts
// tests/composables/useDevicePointing.test.ts
import { describe, expect, it, vi, afterEach } from 'vitest'
import { useDevicePointing } from '../../app/composables/useDevicePointing'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useDevicePointing', () => {
  it('starts in manual mode with default pointing', () => {
    const api = useDevicePointing()
    expect(api.pointing.value.source).toBe('manual')
    expect(api.pointing.value.altitude).toBe(30)
    expect(api.pointing.value.azimuth).toBe(0)
  })

  it('updates manual pointing', () => {
    const api = useDevicePointing()
    api.setManualPointing({ azimuth: 120, altitude: 45 })
    expect(api.pointing.value).toMatchObject({
      azimuth: 120,
      altitude: 45,
      source: 'manual'
    })
  })

  it('falls back to manual when DeviceOrientation is unavailable', async () => {
    vi.stubGlobal('window', { DeviceOrientationEvent: undefined })
    const api = useDevicePointing()
    await api.enableSensor()
    expect(api.pointing.value.source).toBe('manual')
    expect(api.sensorError.value).not.toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/composables/useDevicePointing.test.ts`  
Expected: FAIL

- [ ] **Step 3: Implement composable**

Implement `useDevicePointing` with:
- refs for pointing, sensorError, sensorAvailable
- `setManualPointing({ azimuth, altitude })` forces `source: 'manual'` and disables live listener
- `enableSensor` / `disableSensor` with cleanup on unmount if used from setup
- Never throw; always degrade to manual

Keep under ~120 lines.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/composables/useDevicePointing.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/composables/useDevicePointing.ts tests/composables/useDevicePointing.test.ts
git commit -m "feat(telescope): add hybrid device pointing composable"
```

---

### Task 9: `useTelescope` composable

**Files:**
- Create: `app/composables/useTelescope.ts`
- Test: `tests/composables/useTelescope.test.ts`

**Interfaces:**
- Consumes: catalog/ranking/guidance/profiles/starHop/position + `useDevicePointing` + coordinates `Ref<Coordinates | null>`
- Produces:
  - `profiles`, `selectedProfileId`, `selectedProfile`, `selectProfile(id)`
  - `rankedTargets`, `selectedTargetId`, `selectedDetail`, `selectTarget(id)`
  - `guidance`, `pointing` (from device pointing), `setManualPointing`, `enableSensor`
  - `starHopSteps`
  - `refresh(when?: Date)` recomputes ranking/detail
  - Auto-select first ranked target and first profile when coords become available

- [ ] **Step 1: Write the failing test**

```ts
// tests/composables/useTelescope.test.ts
import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import type { Coordinates } from '../../types/location'
import { useTelescope } from '../../app/composables/useTelescope'

describe('useTelescope', () => {
  it('ranks targets and builds guidance for a selected target', () => {
    const coordinates = ref<Coordinates | null>({ lat: 21.0285, lng: 105.8542 })
    const api = useTelescope(coordinates, new Date('2026-08-03T14:00:00Z'))

    expect(api.rankedTargets.value.length).toBe(9)
    expect(api.selectedProfile.value).not.toBeNull()
    api.selectTarget(api.rankedTargets.value[0]!.target.id)
    expect(api.selectedDetail.value).not.toBeNull()
    expect(['aligning', 'locked', 'below-horizon']).toContain(api.guidance.value.status)
    expect(api.starHopSteps.value).toEqual([])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/composables/useTelescope.test.ts`  
Expected: FAIL

- [ ] **Step 3: Implement `useTelescope`**

Wire pure libs; no DOM. Accept optional fixed `when` for tests; default `() => new Date()`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/composables/useTelescope.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/composables/useTelescope.ts tests/composables/useTelescope.test.ts
git commit -m "feat(telescope): add useTelescope orchestrator"
```

---

### Task 10: Telescope UI components

**Files:**
- Create: `app/components/telescope/TonightTargetsList.vue`
- Create: `app/components/telescope/TargetDetailCard.vue`
- Create: `app/components/telescope/TelescopeGuidancePanel.vue`
- Create: `app/components/telescope/TelescopeProfilePicker.vue`
- Create: `app/components/telescope/StarHopPlaceholder.vue`

**Interfaces:**
- Consumes: props from ranked/detail/guidance/profile types
- Produces: emit `select` / `update:profileId` / `update:pointing` as needed

- [ ] **Step 1: Implement `TelescopeProfilePicker.vue`**

Props: `profiles: TelescopeProfile[]`, `modelValue: string`  
Emit: `update:modelValue`  
Show label, magnification, true FOV. Vietnamese chrome.

- [ ] **Step 2: Implement `TonightTargetsList.vue`**

Props: `targets: RankedTarget[]`, `selectedId: string | null`  
Emit: `select` with target id  
Each row: name, type, alt/az, direction, score 1–5, best time, difficulty, instrument.

- [ ] **Step 3: Implement `TargetDetailCard.vue`**

Props: `detail: TargetDetail | null`  
Show altitude, azimuth, rise/set, constellation, magnitude, distance (or “—”).

- [ ] **Step 4: Implement `TelescopeGuidancePanel.vue`**

Props: `guidance: GuidanceInstruction`, `pointing: DevicePointing`, `sensorError: string | null`  
Emit: `enable-sensor`, `update:pointing`  
Show messages prominently; when `pointing.source === 'manual'` or sensor error, show az/alt number inputs or range sliders (0–360 az, −20–90 alt).

- [ ] **Step 5: Implement `StarHopPlaceholder.vue`**

Static Vietnamese “Sắp có” copy mentioning `HopStep` / `ReferenceStar` / `TargetObject` architecture; no algorithm UI.

- [ ] **Step 6: Commit**

```bash
git add app/components/telescope
git commit -m "feat(telescope): add telescope UI components"
```

---

### Task 11: Page `/telescope` + home entry link

**Files:**
- Create: `app/pages/telescope.vue`
- Modify: `app/pages/index.vue` (add Telescope Mode link beside Compass when coords exist)
- Optional Modify: `app/pages/compass.vue` (add link with lat/lng)

**Interfaces:**
- Consumes: `useGeolocationInput`, `useTelescope`, existing `LoadingLocation` / `PermissionDenied` / `CurrentLocation` / `SkyCard` / `SectionTitle`
- Produces: working `/telescope` route

- [ ] **Step 1: Implement `app/pages/telescope.vue`**

Page flow:
1. `useHead({ title: 'Telescope Mode · What\'s Above Me?' })`
2. Resolve coords from route query `lat`/`lng` if valid; else `useGeolocationInput` bootstrap like home.
3. Wire `useTelescope(coordinates)`.
4. Render sections in spec order (header → location → profile → targets → detail → guidance → star hop).
5. On guidance panel, call `enableSensor` from a button “Dùng cảm biến thiết bị”.

Reuse Vietnamese patterns from `index.vue` for loading/permission/manual fallback.

- [ ] **Step 2: Add home link**

In `app/pages/index.vue`, next to Compass link, add:

```ts
const telescopeLink = computed(() => {
  if (!coordinates.value) return null
  return {
    path: '/telescope',
    query: {
      lat: String(coordinates.value.lat),
      lng: String(coordinates.value.lng)
    }
  }
})
```

```vue
<NuxtLink
  v-if="telescopeLink"
  :to="telescopeLink"
  class="inline-flex rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-sm font-medium text-sky-300 transition hover:border-sky-500/50 hover:bg-slate-900 hover:text-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
>
  Telescope Mode
</NuxtLink>
```

- [ ] **Step 3: Manual smoke check**

Run: `npm run dev`  
Open `/telescope?lat=21.0285&lng=105.8542`  
Expected: ranked list renders; selecting a target updates detail + guidance; manual sliders can reach Target Locked; profile change alters lock feel for tight FOV.

- [ ] **Step 4: Run full verification**

Run: `npx vitest run`  
Expected: all tests PASS  

Run: `npm run typecheck`  
Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add app/pages/telescope.vue app/pages/index.vue app/pages/compass.vue
git commit -m "feat(telescope): add telescope page and navigation entry"
```

---

### Task 12: Final polish gate

**Files:**
- Modify only if verification finds gaps (imports, Nuxt auto-import paths, rounding)

- [ ] **Step 1: Re-run suite**

```bash
npx vitest run
npm run typecheck
```

Expected: PASS / clean

- [ ] **Step 2: Spec coverage checklist**

Confirm present:
- [ ] Tonight's Best Targets fields
- [ ] Target Detail fields
- [ ] Guidance left/right/raise/lower + Target Locked
- [ ] Star-hop types + stub
- [ ] Profile types + mock + FOV lock effect
- [ ] Hybrid sensor/manual
- [ ] Future hooks in `types/telescope.ts`
- [ ] No AR

- [ ] **Step 3: Commit any fixes**

```bash
git add -A
git commit -m "fix(telescope): polish typecheck and edge cases"
```

(Skip empty commit if nothing to fix.)

---

## Self-Review (plan vs spec)

| Spec requirement | Task |
|------------------|------|
| `/pages/telescope.vue` | 11 |
| Tonight's Best Targets ranking | 6 + 10 + 11 |
| Target Detail | 3 + 10 |
| Telescope Guidance hybrid | 5 + 8 + 10 |
| Star Hopping interfaces + stub | 1 + 7 + 10 |
| Telescope Profiles mock + lock effect | 4 + 5 + 10 |
| `lib/telescope/`, `types/telescope.ts`, composables, components | 1–11 |
| Future GoTo/Bluetooth/catalog/AR hooks | 1 |
| Vietnamese UI / English names | 10–11 |
| Unit tests | 2–9 |
| Home entry link | 11 |

No TBD placeholders remain. Type names are consistent across tasks (`TargetObject`, `RankedTarget`, `TargetDetail`, `buildGuidanceInstruction`, `lockThresholdDeg`, `useDevicePointing`, `useTelescope`).
