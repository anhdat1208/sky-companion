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
