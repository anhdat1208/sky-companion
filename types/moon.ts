export type MoonPhaseName =
  | 'New Moon'
  | 'Waxing Crescent'
  | 'First Quarter'
  | 'Waxing Gibbous'
  | 'Full Moon'
  | 'Waning Gibbous'
  | 'Last Quarter'
  | 'Waning Crescent'

export type MoonPhaseIconKey =
  | 'new'
  | 'waxing-crescent'
  | 'first-quarter'
  | 'waxing-gibbous'
  | 'full'
  | 'waning-gibbous'
  | 'last-quarter'
  | 'waning-crescent'

export interface MoonTodaySnapshot {
  timestamp: string
  phase: MoonPhaseName
  iconKey: MoonPhaseIconKey
  phaseAngleDeg: number
  illuminatedPercentage: number
  ageDays: number
  riseTime: string | null
  setTime: string | null
  altitude: number
  azimuth: number
  distanceKm: number
  angularDiameterDeg: number
}

export interface MoonCalendarDay {
  dateISO: string
  phase: MoonPhaseName
  iconKey: MoonPhaseIconKey
  illuminatedPercentage: number
  riseTime: string | null
  setTime: string | null
  isToday: boolean
  inCurrentMonth: boolean
}

export interface ObservationScore {
  stars: 1 | 2 | 3 | 4 | 5
  label: ObservationScoreLabel
  reasons: string[]
}

export type ObservationScoreLabel =
  | 'Poor'
  | 'Fair'
  | 'Good'
  | 'Excellent'

export interface PhotographyGuide {
  bestForLandscape: boolean
  bestForCraters: boolean
  bestForMoonrise: boolean
  recommendedFocalLengthMm: { min: number; max: number }
  notes: string[]
}

export interface MoonDayDetail extends MoonCalendarDay {
  phaseAngleDeg: number
  ageDays: number
  altitude: number
  azimuth: number
  distanceKm: number
  angularDiameterDeg: number
  observationScore: ObservationScore
  photography: PhotographyGuide
}

export type MoonQuarterType =
  | 'new'
  | 'first-quarter'
  | 'full'
  | 'last-quarter'

export interface MoonQuarterEvent {
  type: MoonQuarterType
  at: string
  daysRemaining: number
}

export type EclipseType = 'penumbral' | 'partial' | 'total'

export type Visibility =
  | 'not-visible'
  | 'partially-visible'
  | 'fully-visible'
  | 'unknown'

export interface Magnitude {
  umbral: number | null
  penumbral: number | null
}

export interface LunarEclipse {
  type: EclipseType
  peakTime: string
  magnitude: Magnitude
  visibility: Visibility
  observerLat: number | null
  observerLng: number | null
}

export type MoonSpecialEventKind =
  | 'supermoon'
  | 'blue-moon'
  | 'blood-moon'

export interface MoonSpecialEvent {
  kind: MoonSpecialEventKind
  at: string
  label: string
}

export interface MoonNotificationHook {
  eventId: string
  fireAt: string
  title: string
  body: string
}

export interface MoonCalendarExportHook {
  format: 'ical' | 'json'
  payload: string
}

export interface MoonWidgetSummary {
  phase: MoonPhaseName
  illuminatedPercentage: number
  nextQuarter: MoonQuarterEvent | null
}
