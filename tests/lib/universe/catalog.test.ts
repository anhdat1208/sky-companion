import { describe, expect, it } from 'vitest'
import { getBodyContent, MVP_SOLAR_BODY_IDS } from '../../../lib/universe/content'

describe('universe content catalog', () => {
  it('covers every MVP solar-system body', () => {
    for (const id of MVP_SOLAR_BODY_IDS) {
      const content = getBodyContent(id)
      expect(content.id).toBe(id)
      expect(content.i18nPrefix).toBe(`universe.bodies.${id}`)
      expect(content.radiusKm).toBeGreaterThan(0)
      expect(content.contentRef).toBe(`universe:${id}`)
    }
  })
})
