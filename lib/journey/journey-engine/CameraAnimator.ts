import type { CameraKeyframe, JourneyPlaybackSpeed } from '../../../types/journey'

export interface CameraDriver {
  animateCamera: (keyframe: CameraKeyframe) => Promise<void>
  cancelCameraAnimation: () => void
}

export interface CameraAnimatorOptions {
  reducedMotion?: boolean
}

/**
 * Sequences camera keyframes for a journey step.
 * Respects playback speed and prefers-reduced-motion.
 */
export class CameraAnimator {
  private readonly driver: CameraDriver
  private cancelled = false

  constructor(driver: CameraDriver) {
    this.driver = driver
  }

  async playSequence(
    keyframes: CameraKeyframe[],
    speed: JourneyPlaybackSpeed,
    options: CameraAnimatorOptions = {}
  ): Promise<void> {
    this.cancelled = false
    for (const keyframe of keyframes) {
      if (this.cancelled) return
      const durationMs = options.reducedMotion
        ? Math.min(120, keyframe.durationMs)
        : Math.max(16, keyframe.durationMs / speed)
      await this.driver.animateCamera({
        ...keyframe,
        durationMs
      })
    }
  }

  cancel(): void {
    this.cancelled = true
    this.driver.cancelCameraAnimation()
  }
}

/** Pure helper for tests — scale duration by speed / reduced motion. */
export function scaleKeyframeDuration(
  durationMs: number,
  speed: JourneyPlaybackSpeed,
  reducedMotion = false
): number {
  if (reducedMotion) return Math.min(120, durationMs)
  return Math.max(16, durationMs / speed)
}
