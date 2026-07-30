import { describe, expect, it } from 'vitest'
import { azimuthToDirection } from '../../lib/direction'

describe('azimuthToDirection', () => {
  it('maps 135 to South-East', () => {
    expect(azimuthToDirection(135)).toBe('South-East')
  })
})
