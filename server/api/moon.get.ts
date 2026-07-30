import { defineEventHandler } from 'h3'
import type { MoonInfo } from '../../types/astronomy'
import { getMoonInfo } from '../../lib/moon'
import { resolveObservationTime } from '../../utils/time'
import { handleSkyApiError } from '../utils/handleSkyApiError'
import { parseSkyQuery } from '../utils/parseSkyQuery'

export default defineEventHandler((event): MoonInfo => {
  try {
    const { lat, lng, time } = parseSkyQuery(event)
    const when = resolveObservationTime(time)
    return getMoonInfo(lat, lng, when)
  } catch (error) {
    handleSkyApiError(error, 'Failed to compute moon information.')
  }
})
