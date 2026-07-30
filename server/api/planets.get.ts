import { defineEventHandler } from 'h3'
import type { PlanetInfo } from '../../types/astronomy'
import { getPlanetInfos } from '../../lib/planets'
import { resolveObservationTime } from '../../utils/time'
import { handleSkyApiError } from '../utils/handleSkyApiError'
import { parseSkyQuery } from '../utils/parseSkyQuery'

export default defineEventHandler((event): PlanetInfo[] => {
  try {
    const { lat, lng, time } = parseSkyQuery(event)
    const when = resolveObservationTime(time)
    return getPlanetInfos(lat, lng, when)
  } catch (error) {
    handleSkyApiError(error, 'Failed to compute planet information.')
  }
})
