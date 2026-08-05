import type {
  Journey,
  JourneyEnginePhase,
  JourneyPlaybackSpeed,
  JourneyStep,
  Narration
} from '../../../types/journey'
import type { UniverseLevel } from '../../../types/universe'
import { AudioBus } from './AudioBus'
import { CameraAnimator, type CameraDriver } from './CameraAnimator'

export interface JourneyEngineDeps {
  setLevel: (level: UniverseLevel, options?: { animateCamera?: boolean }) => void
  camera: CameraDriver
  setControlsEnabled?: (enabled: boolean) => void
  reducedMotion?: () => boolean
  now?: () => number
}

export interface JourneyEngineListener {
  onChange?: () => void
}

/**
 * Data-driven journey playback state machine.
 * Journey definitions stay pure; this class owns timing and control flow.
 */
export class JourneyEngine {
  private journey: Journey | null = null
  private steps: JourneyStep[] = []
  private stepIndex = 0
  private phase: JourneyEnginePhase = 'idle'
  private speed: JourneyPlaybackSpeed = 1
  private playing = false
  private disposed = false
  private holdTimer: ReturnType<typeof setTimeout> | null = null
  private runToken = 0
  private readonly audio = new AudioBus()
  private readonly animator: CameraAnimator
  private readonly deps: JourneyEngineDeps
  private readonly listeners = new Set<JourneyEngineListener>()

  constructor(deps: JourneyEngineDeps) {
    this.deps = deps
    this.animator = new CameraAnimator(deps.camera)
  }

  getAudioBus(): AudioBus {
    return this.audio
  }

  subscribe(listener: JourneyEngineListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  getState() {
    return {
      journey: this.journey,
      steps: this.steps,
      stepIndex: this.stepIndex,
      phase: this.phase,
      speed: this.speed,
      playing: this.playing,
      currentStep: this.steps[this.stepIndex] ?? null
    }
  }

  load(journey: Journey, resolvedSteps: JourneyStep[]): void {
    this.cancelRun()
    this.journey = journey
    this.steps = resolvedSteps
    this.stepIndex = 0
    this.phase = 'idle'
    this.playing = false
    this.audio.setAmbient(journey.audio?.ambientKey ?? null)
    this.audio.setSpace(journey.audio?.spaceKey ?? null)
    this.emit()
  }

  setSpeed(speed: JourneyPlaybackSpeed): void {
    this.speed = speed
    this.emit()
  }

  async play(): Promise<void> {
    if (!this.journey || this.steps.length === 0 || this.disposed) return
    if (this.phase === 'completed') {
      this.stepIndex = 0
      this.phase = 'idle'
    }
    this.playing = true
    this.deps.setControlsEnabled?.(false)
    this.emit()
    await this.runFromCurrent()
  }

  pause(): void {
    if (!this.playing && this.phase !== 'holding' && this.phase !== 'transitioning') return
    this.playing = false
    this.cancelRun()
    this.phase = 'paused'
    this.deps.setControlsEnabled?.(true)
    this.emit()
  }

  async restart(): Promise<void> {
    this.cancelRun()
    this.stepIndex = 0
    this.phase = 'idle'
    this.playing = false
    this.emit()
    await this.play()
  }

  async next(): Promise<void> {
    if (this.stepIndex >= this.steps.length - 1) {
      this.complete()
      return
    }
    const wasPlaying = this.playing
    this.cancelRun()
    this.stepIndex += 1
    this.playing = wasPlaying
    this.emit()
    if (wasPlaying) {
      await this.runFromCurrent()
    } else {
      await this.showStep(this.stepIndex, false)
    }
  }

  async previous(): Promise<void> {
    if (this.stepIndex <= 0) return
    const wasPlaying = this.playing
    this.cancelRun()
    this.stepIndex -= 1
    this.playing = wasPlaying
    this.emit()
    if (wasPlaying) {
      await this.runFromCurrent()
    } else {
      await this.showStep(this.stepIndex, false)
    }
  }

  async skip(): Promise<void> {
    await this.next()
  }

  async jumpToStep(index: number): Promise<void> {
    if (index < 0 || index >= this.steps.length) return
    const wasPlaying = this.playing
    this.cancelRun()
    this.stepIndex = index
    this.playing = wasPlaying
    this.emit()
    if (wasPlaying) {
      await this.runFromCurrent()
    } else {
      await this.showStep(index, false)
    }
  }

  dispose(): void {
    this.disposed = true
    this.playing = false
    this.cancelRun()
    this.audio.dispose()
    this.deps.setControlsEnabled?.(true)
    this.listeners.clear()
  }

  private async runFromCurrent(): Promise<void> {
    const token = ++this.runToken
    while (this.playing && !this.disposed && token === this.runToken) {
      await this.showStep(this.stepIndex, true)
      if (!this.playing || this.disposed || token !== this.runToken) return
      if (this.stepIndex >= this.steps.length - 1) {
        this.complete()
        return
      }
      this.stepIndex += 1
      this.emit()
    }
  }

  private async showStep(index: number, hold: boolean): Promise<void> {
    const step = this.steps[index]
    if (!step) return

    this.phase = 'transitioning'
    this.audio.setNarration(step.narration.audioRef ?? null)
    this.emit()

    this.deps.setLevel(step.level, { animateCamera: false })
    const reduced = this.deps.reducedMotion?.() ?? false
    await this.animator.playSequence(step.camera, this.speed, { reducedMotion: reduced })

    this.phase = hold && this.playing ? 'holding' : this.playing ? 'transitioning' : 'paused'
    this.emit()

    if (hold && this.playing) {
      const holdMs = reduced ? Math.min(400, step.holdMs) : step.holdMs / this.speed
      await this.wait(holdMs)
    }
  }

  private complete(): void {
    this.playing = false
    this.phase = 'completed'
    this.deps.setControlsEnabled?.(true)
    this.emit()
  }

  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => {
      this.clearHoldTimer()
      this.holdTimer = setTimeout(() => {
        this.holdTimer = null
        resolve()
      }, ms)
    })
  }

  private clearHoldTimer(): void {
    if (this.holdTimer !== null) {
      clearTimeout(this.holdTimer)
      this.holdTimer = null
    }
  }

  private cancelRun(): void {
    this.clearHoldTimer()
    this.runToken += 1
    this.animator.cancel()
  }

  private emit(): void {
    for (const listener of this.listeners) {
      listener.onChange?.()
    }
  }
}

/** Resolve steps for a journey, including reverseOf + narration overrides. */
export function resolveJourneySteps(
  journey: Journey,
  lookup: (id: string) => Journey | undefined
): JourneyStep[] {
  if (journey.reverseOf) {
    const source = lookup(journey.reverseOf)
    if (!source || source.steps.length === 0) {
      return []
    }
    const reversed = [...source.steps].reverse().map((step) => cloneStep(step))
    const overrides = journey.reverseNarrationOverrides ?? {}
    return reversed.map((step) => {
      const narration = overrides[step.id]
      return narration ? { ...step, narration: { ...narration } } : step
    })
  }
  return journey.steps.map(cloneStep)
}

function cloneStep(step: JourneyStep): JourneyStep {
  return {
    ...step,
    camera: step.camera.map((kf) => ({ ...kf })),
    narration: { ...step.narration },
    card: {
      ...step.card,
      factsKeys: [...step.card.factsKeys]
    },
    focus: step.focus ? { ...step.focus } : undefined,
    transition: step.transition ? { ...step.transition } : undefined
  }
}

export function applyNarrationOverride(
  step: JourneyStep,
  override: Narration | undefined
): JourneyStep {
  if (!override) return step
  return { ...step, narration: { ...override } }
}
