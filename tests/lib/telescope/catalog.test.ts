// tests/lib/telescope/catalog.test.ts
import { describe, expect, it } from 'vitest'
import { getCatalogTargets } from '../../../lib/telescope/catalog'

describe('getCatalogTargets', () => {
  it('includes moon, five planets, and three deep-sky objects', () => {
    const targets = getCatalogTargets()
    const names = targets.map(t => t.name)

    expect(names).toEqual(expect.arrayContaining([
      'Moon',
      'Mercury',
      'Venus',
      'Mars',
      'Jupiter',
      'Saturn',
      'Andromeda Galaxy',
      'Orion Nebula',
      'Pleiades'
    ]))
    expect(targets).toHaveLength(9)
  })

  it('marks solar-system bodies as dynamic and deep-sky with RA/Dec', () => {
    const targets = getCatalogTargets()
    const moon = targets.find(t => t.id === 'moon')
    const andromeda = targets.find(t => t.id === 'm31')

    expect(moon?.dynamicBody).toBe('moon')
    expect(moon?.raHours).toBeNull()
    expect(andromeda?.raHours).not.toBeNull()
    expect(andromeda?.decDeg).not.toBeNull()
  })
})
