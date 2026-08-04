import { describe, expect, it } from 'vitest'
import {
  emptyDateCursorHook,
  emptyLightPollutionHook,
  emptyWeatherHook
} from '../../../lib/photo/future'

describe('photo future stubs', () => {
  it('returns null weather fields', () => {
    expect(emptyWeatherHook().cloudCoverPct).toBeNull()
    expect(emptyLightPollutionHook().bortleClass).toBeNull()
    expect(emptyDateCursorHook().viewedNightStart).toBeNull()
  })
})
