export interface IssPosition {
  timestamp: string
  latitude: number
  longitude: number
  altitudeKm: number
  velocityKph: number
}

export interface IssGroundTrackPoint {
  latitude: number
  longitude: number
  timestamp: string
}

export interface IssPassPrediction {
  riseTime: string
  maxTime: string
  setTime: string
  durationSeconds: number
  maxElevationDeg: number
  direction: string
  magnitude: number | null
}

export type BrightnessLabel = 'Bright' | 'Moderate' | 'Dim' | 'Not Visible'

export interface IssBrightness {
  magnitude: number | null
  label: BrightnessLabel
}

export interface IssSnapshot {
  position: IssPosition
  groundTrack: IssGroundTrackPoint[]
  nextPass: IssPassPrediction | null
  brightness: IssBrightness | null
  tleEpoch: string
  source: 'live-tle' | 'cached-tle' | 'fallback-tle'
}

/** @deprecated Use IssPosition / IssSnapshot from types/iss.ts */
export type ISSPass = IssPosition
