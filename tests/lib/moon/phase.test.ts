import { describe, expect, it } from 'vitest'
import {
  moonAgeDays,
  moonPhaseIconKey,
  moonPhaseName,
  normalizePhaseAngle
} from '../../../lib/moon/phase'

describe('moon phase helpers', () => {
  it('maps phase angles to the eight named phases', () => {
    expect(moonPhaseName(0)).toBe('New Moon')
    expect(moonPhaseName(45)).toBe('Waxing Crescent')
    expect(moonPhaseName(90)).toBe('First Quarter')
    expect(moonPhaseName(180)).toBe('Full Moon')
    expect(moonPhaseName(270)).toBe('Last Quarter')
  })

  it('maps phase angles to icon keys', () => {
    expect(moonPhaseIconKey(0)).toBe('new')
    expect(moonPhaseIconKey(90)).toBe('first-quarter')
    expect(moonPhaseIconKey(180)).toBe('full')
    expect(moonPhaseIconKey(270)).toBe('last-quarter')
  })

  it('normalizes negative angles and computes age in synodic range', () => {
    expect(normalizePhaseAngle(-90)).toBe(270)
    const age = moonAgeDays(180)
    expect(age).toBeGreaterThan(14)
    expect(age).toBeLessThan(15)
    expect(moonAgeDays(0)).toBe(0)
    expect(moonAgeDays(359)).toBeLessThan(29.530588853)
  })
})
