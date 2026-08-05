import { describe, expect, it } from 'vitest'
import { auToScene, radiusKmToScene } from '../../../lib/universe/scale'

describe('hybrid scale', () => {
  it('maps larger AU to larger scene distance', () => {
    expect(auToScene(1)).toBeGreaterThan(0)
    expect(auToScene(5.2)).toBeGreaterThan(auToScene(1))
    expect(auToScene(30)).toBeGreaterThan(auToScene(5.2))
  })

  it('exaggerates Mercury radius but keeps it below Jupiter display radius', () => {
    const mercury = radiusKmToScene(2439.7, 'mercury')
    const jupiter = radiusKmToScene(69911, 'jupiter')
    expect(mercury).toBeGreaterThan(0)
    expect(jupiter).toBeGreaterThan(mercury)
  })
})
