import type { SkyAILanguage } from '../../types/ai'

const SUPPORTED: ReadonlySet<SkyAILanguage> = new Set(['en', 'vi'])

export function localeToSkyAILanguage(locale: string): SkyAILanguage {
  const base = locale.toLowerCase().split('-')[0] ?? 'en'
  return SUPPORTED.has(base as SkyAILanguage) ? (base as SkyAILanguage) : 'en'
}
