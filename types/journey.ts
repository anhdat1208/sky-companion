import type { CelestialBodyId, UniverseLevel, Vec3 } from './universe'

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
  id?: CelestialBodyId
}

export interface CameraKeyframe {
  position?: Vec3
  target?: Vec3
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
  toLevel?: UniverseLevel
  fadeMs?: number
}

export interface JourneyStep {
  id: string
  level: UniverseLevel
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
