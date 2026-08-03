import { defineEventHandler } from 'h3'
import type { IssSnapshot } from '../../types/iss'
import { buildIssSnapshot } from '../../lib/iss/snapshot'
import { handleSkyApiError } from '../utils/handleSkyApiError'
import { parseIssQuery } from '../utils/parseIssQuery'

export default defineEventHandler(async (event): Promise<IssSnapshot> => {
  try {
    const query = parseIssQuery(event)
    return await buildIssSnapshot({
      lat: query.lat,
      lng: query.lng
    })
  } catch (error) {
    handleSkyApiError(error, 'Failed to compute ISS snapshot.')
  }
})
