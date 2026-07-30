import { defineEventHandler } from 'h3'
import type { SkySnapshot } from '../../types/astronomy'
import { buildSkySnapshot } from '../../lib/astronomy'
import { resolveObservationTime } from '../../utils/time'
import { handleSkyApiError } from '../utils/handleSkyApiError'
import { parseSkyQuery } from '../utils/parseSkyQuery'

export default defineEventHandler((event): SkySnapshot => {
  try {
    const { lat, lng, time } = parseSkyQuery(event)
    const when = resolveObservationTime(time)
    return buildSkySnapshot(lat, lng, when)
  } catch (error) {
    handleSkyApiError(error, 'Failed to compute sky snapshot.')
  }
})
