import type { Direction, MilkyWayVisibility } from './astronomy'

export type PhotographyScoreLabel =
  | 'Poor'
  | 'Fair'
  | 'Good'
  | 'Excellent'

export interface PhotographyScore {
  stars: 1 | 2 | 3 | 4 | 5
  label: PhotographyScoreLabel
  reasons: string[]
  cloudCoverPct: number | null
}

export interface NightWindow {
  sunset: string
  sunrise: string
}

export interface TimeRange {
  start: string
  end: string
}

export interface GoldenHourInfo {
  morning: TimeRange | null
  evening: TimeRange | null
  durationMinutes: number | null
}

export interface BlueHourInfo {
  morning: TimeRange | null
  evening: TimeRange | null
}

export interface TwilightInfo {
  civil: { morning: TimeRange | null; evening: TimeRange | null }
  nautical: { morning: TimeRange | null; evening: TimeRange | null }
  astronomical: { morning: TimeRange | null; evening: TimeRange | null }
}

export type CameraSubject =
  | 'milky-way'
  | 'moon'
  | 'planet'
  | 'golden-hour'
  | 'blue-hour'

export interface CameraSettings {
  iso: { min: number; max: number }
  aperture: string
  exposureTime: string
  focalLengthMm: { min: number; max: number }
  tripodRequired: boolean
  remoteShutter: boolean
}

export interface ConditionModifiers {
  moonIlluminationPct?: number
  subjectAltitudeDeg?: number
  sunAltitudeDeg?: number
}

export interface MilkyWayPhotoInfo {
  visibility: MilkyWayVisibility
  direction: Direction | null
  altitudeDeg: number | null
  bestTime: string | null
  coreVisible: boolean | null
  recommendedLensLabel: string
  settings: CameraSettings
}

export interface MoonPhotoInfo {
  moonrise: string | null
  moonset: string | null
  phase: string
  illuminationPct: number
  bestPhotographyTime: string | null
  recommendedLensLabel: string
  settings: CameraSettings
}

export interface PlanetPhotoInfo {
  name: string
  altitudeDeg: number
  azimuthDeg: number
  isVisible: boolean
  brightness: 'faint' | 'moderate' | 'bright' | 'very-bright'
  recommendedMagnification: string
  magnitude: number | null
}

export type TimelineMarkerKind =
  | 'golden-hour'
  | 'blue-hour'
  | 'dark-sky'
  | 'moonrise'
  | 'moonset'
  | 'milky-way-peak'
  | 'planet-visibility'

export interface TimelineMarker {
  kind: TimelineMarkerKind
  label: string
  at: string
  end: string | null
}

export interface PhotoTimeline {
  window: NightWindow
  markers: TimelineMarker[]
}

export interface AstroPhotographySnapshot {
  timestamp: string
  nightWindow: NightWindow | null
  score: PhotographyScore | null
  milkyWay: MilkyWayPhotoInfo | null
  goldenHour: GoldenHourInfo | null
  blueHour: BlueHourInfo | null
  twilight: TwilightInfo | null
  moon: MoonPhotoInfo | null
  planets: PlanetPhotoInfo[] | null
  timeline: PhotoTimeline | null
  suggestedSettings: CameraSettings | null
}

export interface WeatherPhotoHook {
  cloudCoverPct: number | null
  windMps: number | null
  humidityPct: number | null
  seeing: string | null
  transparency: string | null
}

export interface LightPollutionHook {
  bortleClass: number | null
  source: string | null
}

export interface SavedLocation {
  id: string
  name: string
  lat: number
  lng: number
}

export interface FavoriteSpot extends SavedLocation {
  notes: string | null
}

export interface PhotoJournalEntry {
  id: string
  takenAt: string
  subject: CameraSubject
  lat: number | null
  lng: number | null
  notes: string | null
}

export interface DateCursorHook {
  viewedNightStart: string | null
}
