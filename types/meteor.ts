export type MeteorShowerId =
  | 'quadrantids'
  | 'lyrids'
  | 'eta-aquariids'
  | 'perseids'
  | 'orionids'
  | 'leonids'
  | 'geminids'
  | 'ursids'

export type MeteorDifficulty = 'easy' | 'moderate' | 'challenging'

export interface MeteorShowerDefinition {
  id: MeteorShowerId
  name: string
  iauCode: string
  description: string
  originConstellation: string
  peakSolarLongitudeDeg: number
  activeSolarLongitudeDeg: { start: number; end: number }
  zhr: number
  radiantRaHours: number
  radiantDecDeg: number
  speedKmS: number
  parentComet: string | null
  peakDurationHours: number
  difficulty: MeteorDifficulty
  sourceNote: string
}

export interface MeteorShowerEvent {
  id: MeteorShowerId
  year: number
  name: string
  peakAt: string
  activeStart: string
  activeEnd: string
  zhr: number
  difficulty: MeteorDifficulty
}

export type MoonInterference =
  | 'none'
  | 'low'
  | 'moderate'
  | 'high'
  | 'severe'

export type VisibilityScoreLabel =
  | 'Poor'
  | 'Fair'
  | 'Good'
  | 'Excellent'

export interface MeteorVisibilityScore {
  stars: 1 | 2 | 3 | 4 | 5
  label: VisibilityScoreLabel
  reasons: string[]
  cloudCoverPct: number | null
}

export interface MeteorUpcomingCard {
  id: MeteorShowerId
  name: string
  activePeriodLabel: string
  peakDateLabel: string
  peakTimeLabel: string
  peakAt: string
  expectedMeteorsPerHour: number
  moonIlluminationPct: number
  moonInterference: MoonInterference
  visibilityScore: MeteorVisibilityScore | null
  bestObservationTimeLabel: string
  bestDirection: string | null
  difficulty: MeteorDifficulty
}

export interface MeteorVisibilityMapHook {
  status: 'unavailable'
  message: string
}

export interface MeteorEventDetail {
  id: MeteorShowerId
  name: string
  description: string
  originConstellation: string
  radiantRaHours: number
  radiantDecDeg: number
  expectedSpeedKmS: number
  parentComet: string | null
  peakDurationHours: number
  peakAt: string
  activeStart: string
  activeEnd: string
  zhr: number
  visibilityMap: MeteorVisibilityMapHook
}

export type MeteorEquipmentKind = 'naked-eye' | 'binoculars' | 'telescope'

export interface MeteorEquipmentAdvice {
  kind: MeteorEquipmentKind
  recommended: boolean
  note: string
}

export interface MeteorObservationGuide {
  recommendedTime: string
  darkSkyRequirement: string
  moonlightImpact: string
  cloudReminder: string
  equipment: MeteorEquipmentAdvice[]
}

export type MeteorNotificationKind =
  | 't-minus-24h'
  | 't-minus-2h'
  | 'peak-started'

export interface MeteorNotificationHook {
  eventId: string
  showerId: MeteorShowerId
  kind: MeteorNotificationKind
  fireAt: string
  title: string
  body: string
}

export interface MeteorOfflineCacheHook {
  catalogVersion: string
  cachedAt: string | null
}

export interface MeteorWeatherHook {
  cloudCoverPct: number | null
  source: 'none' | 'forecast'
}

export interface CloudCoverHook {
  pct: number | null
  observedAt: string | null
}

export interface MeteorObservationReportHook {
  showerId: MeteorShowerId
  observedAt: string
  estimatedCount: number | null
  notes: string
}

export interface MeteorCommunityPhotoHook {
  showerId: MeteorShowerId
  imageUrl: string
  caption: string
  takenAt: string
}

export interface MeteorPushNotificationHook {
  permission: 'unsupported' | 'default' | 'granted' | 'denied'
  hooks: MeteorNotificationHook[]
}
