import { defineEventHandler, readBody } from 'h3'
import { z } from 'zod'
import type { SkyAIExplainRequest } from '../../../types/ai'
import { createSkyAIProvider } from '../../utils/ai/provider'

const requestSchema = z.object({
  objectType: z.enum([
    'moon',
    'sun',
    'planet',
    'constellation',
    'meteor-shower',
    'iss',
    'deep-sky-object',
    'moon-calendar',
    'astrophotography'
  ]),
  name: z.string().min(1).max(80),
  language: z.enum(['en', 'vi']).default('en'),
  altitude: z.number().min(-90).max(90).optional(),
  azimuth: z.number().min(0).max(360).optional(),
  visible: z.boolean().optional(),
  distanceKm: z.number().positive().optional(),
  question: z.string().min(3).max(200).optional(),
  context: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).optional()
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const request = requestSchema.parse(body) as SkyAIExplainRequest

  const config = useRuntimeConfig(event)
  const provider = createSkyAIProvider({
    provider: config.skyAIProvider ?? 'gemini',
    openaiApiKey: config.openaiApiKey ?? '',
    openaiModel: config.openaiModel ?? 'gpt-4.1-mini',
    geminiApiKey: config.geminiApiKey ?? '',
    geminiModel: config.geminiModel ?? 'gemini-1.5-flash'
  })

  return provider.explain(request)
})
