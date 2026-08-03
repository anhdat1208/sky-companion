import type { H3Event } from 'h3'
import { createError, getQuery } from 'h3'
import { issQuerySchema, type IssQuery } from '../../utils/validation'

const INVALID_QUERY_MESSAGE = 'Invalid coordinates.'

export function parseIssQuery(event: H3Event): IssQuery {
  const parsed = issQuerySchema.safeParse(getQuery(event))

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
