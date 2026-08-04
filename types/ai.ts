export type SkyAIObjectType =
  | 'moon'
  | 'sun'
  | 'planet'
  | 'constellation'
  | 'meteor-shower'
  | 'iss'
  | 'deep-sky-object'
  | 'moon-calendar'
  | 'astrophotography'

export type SkyAILanguage = 'en' | 'vi'

export interface SkyAIExplainRequest {
  objectType: SkyAIObjectType
  name: string
  language: SkyAILanguage
  altitude?: number
  azimuth?: number
  visible?: boolean
  distanceKm?: number
  question?: string
  context?: Record<string, string | number | boolean | null>
}

export interface SkyAISection {
  title: string
  markdown: string
}

export interface SkyAIExplainResponse {
  title: string
  sections: SkyAISection[]
  suggestedQuestions: string[]
  provider: string
  generatedAt: string
}

export interface SkyAIProvider {
  readonly name: string
  explain(request: SkyAIExplainRequest): Promise<SkyAIExplainResponse>
}
