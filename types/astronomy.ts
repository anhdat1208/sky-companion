export type MilkyWayVisibility =
  | 'Excellent'
  | 'Good'
  | 'Poor'
  | 'Not Visible'

export type Direction =
  | 'North'
  | 'North-East'
  | 'East'
  | 'South-East'
  | 'South'
  | 'South-West'
  | 'West'
  | 'North-West'

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
