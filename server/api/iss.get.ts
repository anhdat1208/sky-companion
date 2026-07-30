import { defineEventHandler } from 'h3'
import type { ISSPass } from '../../types/api'

export default defineEventHandler((): ISSPass => ({
  timestamp: new Date().toISOString(),
  latitude: 10.7769,
  longitude: 106.7009,
  altitudeKm: 408.2,
  velocityKph: 27600
}))
