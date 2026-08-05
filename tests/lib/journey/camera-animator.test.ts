import { describe, expect, it, vi } from 'vitest'
import { scaleKeyframeDuration } from '../../../lib/journey/journey-engine/CameraAnimator'
import type { CameraKeyframe } from '../../../types/journey'
import { CameraAnimator } from '../../../lib/journey/journey-engine/CameraAnimator'

describe('scaleKeyframeDuration', () => {
  it('divides by playback speed', () => {
    expect(scaleKeyframeDuration(2000, 2)).toBe(1000)
    expect(scaleKeyframeDuration(2000, 8)).toBe(250)
  })

  it('clamps reduced motion to 120ms', () => {
    expect(scaleKeyframeDuration(2000, 1, true)).toBe(120)
    expect(scaleKeyframeDuration(50, 1, true)).toBe(50)
  })
})

describe('CameraAnimator', () => {
  it('plays keyframes sequentially with scaled durations', async () => {
    const calls: number[] = []
    const animator = new CameraAnimator({
      animateCamera: async (kf) => {
        calls.push(kf.durationMs)
      },
      cancelCameraAnimation: () => {}
    })

    const keyframes: CameraKeyframe[] = [
      { durationMs: 2000, easing: 'linear' },
      { durationMs: 1000, easing: 'easeOut' }
    ]

    await animator.playSequence(keyframes, 2)
    expect(calls).toEqual([1000, 500])
  })

  it('stops mid-sequence when cancelled', async () => {
    let resolveFirst!: () => void
    const first = new Promise<void>((r) => {
      resolveFirst = r
    })
    let secondCalled = false
    const animator = new CameraAnimator({
      animateCamera: async (kf) => {
        if (kf.durationMs === 100) {
          await first
          return
        }
        secondCalled = true
      },
      cancelCameraAnimation: () => {}
    })

    const run = animator.playSequence(
      [
        { durationMs: 200, easing: 'linear' },
        { durationMs: 400, easing: 'linear' }
      ],
      2
    )
    animator.cancel()
    resolveFirst()
    await run
    expect(secondCalled).toBe(false)
  })
})
