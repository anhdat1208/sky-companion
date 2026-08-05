export type UniverseLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

export type CelestialBodyId =
  | 'sun'
  | 'mercury'
  | 'venus'
  | 'earth'
  | 'moon'
  | 'mars'
  | 'jupiter'
  | 'saturn'
  | 'uranus'
  | 'neptune'
  | 'alpha-centauri'
  | 'sirius'
  | 'betelgeuse'
  | 'rigel'
  | 'polaris'
  | 'milky-way'
  | 'galactic-center'
  | 'orion-arm'
  | 'local-group'
  | 'virgo-supercluster'
  | 'observable-universe'

/** Future-ready — unused in MVP rendering */
export type SpacecraftId =
  | 'iss'
  | 'jwst'
  | 'voyager-1'
  | 'voyager-2'
  | 'new-horizons'

export type UniverseObjectKind =
  | 'star'
  | 'planet'
  | 'moon'
  | 'spacecraft'
  | 'small-body'
  | 'exoplanet'
  | 'galaxy'
  | 'structure'
  | 'marker'

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
  /** Scene-space position after hybrid scale (renderer units). */
  position: Vec3
  /** Physical heliocentric or Earth-relative position in km for UI. */
  positionKm: Vec3
  radiusKm: number
  rotationRad: number
}

export type SeasonKey = 'spring' | 'summer' | 'autumn' | 'winter'

export interface EarthExtras {
  sunDirection: Vec3
  seasonKey: SeasonKey
  userLat: number
  userLng: number
}

export interface MoonExtras {
  phaseFraction: number
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
  i18nPrefix: string
  radiusKm: number
  massKg: number
  gravityMs2: number
  distanceFromSunAu: number | null
  orbitalPeriodDays: number | null
  rotationPeriodHours: number | null
  contentRef: string
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

export interface UniverseObjectRegistration {
  id: string
  kind: UniverseObjectKind
  levelMin: UniverseLevel
  levelMax: UniverseLevel
}

export interface UniverseObserver {
  lat: number
  lng: number
}
