import { describe, expect, it } from 'vitest'
import { localeToSkyAILanguage } from '../../../lib/i18n/aiLanguage'

describe('localeToSkyAILanguage', () => {
  it('maps known locales', () => {
    expect(localeToSkyAILanguage('en')).toBe('en')
    expect(localeToSkyAILanguage('vi')).toBe('vi')
  })

  it('falls back to en for unsupported locales', () => {
    expect(localeToSkyAILanguage('fr')).toBe('en')
    expect(localeToSkyAILanguage('ja-JP')).toBe('en')
  })
})
