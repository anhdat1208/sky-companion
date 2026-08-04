import { describe, expect, it } from 'vitest'
import { listUpcomingLunarEclipses } from '../../../lib/moon/eclipse'

describe('listUpcomingLunarEclipses', () => {
  it('returns an empty list in this version', () => {
    expect(listUpcomingLunarEclipses()).toEqual([])
  })
})
