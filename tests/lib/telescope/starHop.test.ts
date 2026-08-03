// tests/lib/telescope/starHop.test.ts
import { describe, expect, it } from 'vitest'
import { getCatalogTargets } from '../../../lib/telescope/catalog'
import { buildStarHopPlan } from '../../../lib/telescope/starHop'

describe('buildStarHopPlan', () => {
  it('returns an empty plan stub for any target', () => {
    const target = getCatalogTargets()[0]!
    expect(buildStarHopPlan(target)).toEqual([])
    expect(buildStarHopPlan(target, [])).toEqual([])
  })
})
