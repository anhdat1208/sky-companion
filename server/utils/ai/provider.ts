import { z } from 'zod'
import type { SkyAIExplainRequest, SkyAIExplainResponse, SkyAIProvider } from '../../../types/ai'

const aiStructuredSchema = z.object({
  title: z.string().min(1),
  sections: z.array(z.object({
    title: z.string().min(1),
    markdown: z.string().min(1)
  })).min(3),
  suggestedQuestions: z.array(z.string().min(3)).min(3).max(6)
})

const systemPrompt = [
  'You are Sky AI, an astronomy educator.',
  'Use provided astronomical data only; never invent measurements.',
  'Return strict JSON only with keys: title, sections, suggestedQuestions.',
  'sections must be an array of { title, markdown } with at least 3 items.',
  'suggestedQuestions must be an array of 3-6 short questions.',
  'Not a chat assistant.',
  'If data is missing, say it clearly and avoid guessing.'
].join(' ')

function buildUserPrompt(request: SkyAIExplainRequest): string {
  return JSON.stringify({
    objectType: request.objectType,
    name: request.name,
    altitude: request.altitude,
    azimuth: request.azimuth,
    visible: request.visible,
    distanceKm: request.distanceKm,
    question: request.question ?? null,
    language: request.language,
    context: request.context ?? {}
  })
}

function parseJsonFromText(text: string): unknown {
  const trimmed = text.trim()
  try {
    return JSON.parse(trimmed)
  } catch {
    // Continue with best-effort extraction.
  }

  const withoutFence = trimmed
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
  try {
    return JSON.parse(withoutFence)
  } catch {
    // Continue with object slice extraction.
  }

  const firstBrace = withoutFence.indexOf('{')
  const lastBrace = withoutFence.lastIndexOf('}')
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return JSON.parse(withoutFence.slice(firstBrace, lastBrace + 1))
  }

  throw createError({ statusCode: 502, statusMessage: 'Sky AI provider returned non-JSON content.' })
}

function fallbackQuestions(name: string): string[] {
  return [
    `What makes ${name} special?`,
    `Why is ${name} visible tonight?`,
    `How can I observe ${name} better?`
  ]
}

function ensureMinimumSections(
  sections: Array<{ title: string; markdown: string }>
): Array<{ title: string; markdown: string }> {
  const next = [...sections]
  if (next.length < 1) {
    next.push({ title: 'Overview', markdown: 'Sky AI could not fully structure this answer.' })
  }
  if (next.length < 2) {
    next.push({ title: 'Observation Tips', markdown: 'Observe from darker skies when possible.' })
  }
  if (next.length < 3) {
    next.push({ title: 'Interesting Facts', markdown: 'Use suggested questions to dig deeper.' })
  }
  return next
}

function normalizeAiPayload(
  parsed: unknown,
  request: SkyAIExplainRequest
): z.infer<typeof aiStructuredSchema> {
  const strict = aiStructuredSchema.safeParse(parsed)
  if (strict.success) {
    return strict.data
  }

  if (typeof parsed === 'object' && parsed !== null) {
    const maybe = parsed as {
      title?: unknown
      sections?: unknown
      suggestedQuestions?: unknown
      markdown?: unknown
      content?: unknown
      overview?: unknown
      history?: unknown
      interestingFacts?: unknown
    }

    if (Array.isArray(maybe.sections) && maybe.sections.length > 0) {
      return {
        title: typeof maybe.title === 'string' && maybe.title.trim() ? maybe.title : `${request.name} Explanation`,
        sections: ensureMinimumSections(maybe.sections
          .map((item) => {
            if (typeof item !== 'object' || item === null) return null
            const row = item as { title?: unknown; markdown?: unknown; content?: unknown }
            const title = typeof row.title === 'string' && row.title.trim() ? row.title : 'Overview'
            const markdown = typeof row.markdown === 'string'
              ? row.markdown
              : (typeof row.content === 'string' ? row.content : '')
            return markdown.trim() ? { title, markdown } : null
          })
          .filter((x): x is { title: string; markdown: string } => x !== null)
          .slice(0, 8)),
        suggestedQuestions: Array.isArray(maybe.suggestedQuestions)
          ? maybe.suggestedQuestions.filter((x): x is string => typeof x === 'string' && x.trim().length > 0).slice(0, 6)
          : fallbackQuestions(request.name)
      }
    }

    const markdownText =
      (typeof maybe.markdown === 'string' && maybe.markdown)
      || (typeof maybe.content === 'string' && maybe.content)

    if (markdownText && markdownText.trim()) {
      return {
        title: typeof maybe.title === 'string' && maybe.title.trim() ? maybe.title : `${request.name} Explanation`,
        sections: [
          { title: 'Overview', markdown: markdownText },
          { title: 'Observation Tips', markdown: 'Use local sky conditions and dark skies for better viewing results.' },
          { title: 'Interesting Facts', markdown: `Ask Sky AI follow-up questions to learn more about ${request.name}.` }
        ],
        suggestedQuestions: fallbackQuestions(request.name)
      }
    }
  }

  throw createError({
    statusCode: 502,
    statusMessage: 'Sky AI provider returned invalid structure.'
  })
}

class OpenAIProvider implements SkyAIProvider {
  readonly name = 'openai'
  constructor(private readonly apiKey: string, private readonly model: string) {}

  async explain(request: SkyAIExplainRequest): Promise<SkyAIExplainResponse> {
    const payload = {
      model: this.model,
      input: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: buildUserPrompt(request) }
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'sky_ai_explain',
          schema: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              sections: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    markdown: { type: 'string' }
                  },
                  required: ['title', 'markdown'],
                  additionalProperties: false
                }
              },
              suggestedQuestions: {
                type: 'array',
                items: { type: 'string' }
              }
            },
            required: ['title', 'sections', 'suggestedQuestions'],
            additionalProperties: false
          }
        }
      }
    }

    const raw = await $fetch<{
      output_text?: string
    }>('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`
      },
      body: payload
    })

    if (!raw.output_text) {
      throw createError({ statusCode: 502, statusMessage: 'Sky AI provider returned empty content.' })
    }

    const parsed = normalizeAiPayload(parseJsonFromText(raw.output_text), request)
    return {
      ...parsed,
      provider: this.name,
      generatedAt: new Date().toISOString()
    }
  }
}

class GeminiProvider implements SkyAIProvider {
  readonly name = 'gemini'
  constructor(private readonly apiKey: string, private readonly model: string) {}

  async explain(request: SkyAIExplainRequest): Promise<SkyAIExplainResponse> {
    const payload = {
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: buildUserPrompt(request) }]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    }

    const raw = await $fetch<{
      candidates?: Array<{
        content?: {
          parts?: Array<{ text?: string }>
        }
      }>
    }>(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`,
      {
        method: 'POST',
        query: { key: this.apiKey },
        body: payload
      }
    )

    const text = raw.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) {
      throw createError({ statusCode: 502, statusMessage: 'Sky AI provider returned empty content.' })
    }

    const parsed = normalizeAiPayload(parseJsonFromText(text), request)
    return {
      ...parsed,
      provider: this.name,
      generatedAt: new Date().toISOString()
    }
  }
}

export function createSkyAIProvider(config: {
  provider: string
  openaiApiKey: string
  openaiModel: string
  geminiApiKey: string
  geminiModel: string
}): SkyAIProvider {
  if (config.provider === 'gemini') {
    if (!config.geminiApiKey) {
      throw createError({ statusCode: 503, statusMessage: 'Missing Gemini API key for Sky AI.' })
    }
    return new GeminiProvider(config.geminiApiKey, config.geminiModel)
  }

  if (config.provider === 'openai') {
    if (!config.openaiApiKey) {
      throw createError({ statusCode: 503, statusMessage: 'Missing OpenAI API key for Sky AI.' })
    }
    return new OpenAIProvider(config.openaiApiKey, config.openaiModel)
  }

  throw createError({ statusCode: 400, statusMessage: `Unsupported AI provider: ${config.provider}` })
}
