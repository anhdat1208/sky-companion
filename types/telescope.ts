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
