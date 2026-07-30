import type { H3Event } from 'h3'
import { createError, getQuery } from 'h3'
import { skyQuerySchema, type SkyQuery } from '../../utils/validation'

const INVALID_QUERY_MESSAGE = 'Invalid coordinates or time parameter.'

export function parseSkyQuery(event: H3Event): SkyQuery {
  const parsed = skyQuerySchema.safeParse(getQuery(event))

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: INVALID_QUERY_MESSAGE,
      data: {
        statusCode: 400,
        message: INVALID_QUERY_MESSAGE
      }
    })
  }

  return parsed.data
}
