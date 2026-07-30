import { createError, isError } from 'h3'

export function handleSkyApiError(error: unknown, fallbackMessage: string): never {
  if (isError(error)) {
    throw error
  }

  throw createError({
    statusCode: 500,
    statusMessage: 'Internal Server Error',
    message: fallbackMessage,
    data: {
      statusCode: 500,
      message: fallbackMessage
    }
  })
}
