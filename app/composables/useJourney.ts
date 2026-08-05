import { computed, onBeforeUnmount, ref, shallowRef, type Ref } from 'vue'
import {
  JourneyEngine,
  getJourney,
  getResolvedSteps
} from '../../lib/journey'
import type {
  Journey,
  JourneyEnginePhase,
  JourneyId,
  JourneyPlaybackSpeed,
  JourneyStep
} from '../../types/journey'
import type { UniverseLevel } from '../../types/universe'

export interface JourneyCameraBridge {
  animateCamera: (keyframe: import('../../types/journey').CameraKeyframe) => Promise<void>
  cancelCameraAnimation: () => void
  setControlsEnabled: (enabled: boolean) => void
}

/**
 * Playback + selection state for Journey Mode.
 * Pass a camera bridge once the UniverseCanvas renderer is ready.
 */
export function useJourney(
  setLevel: (level: UniverseLevel, options?: { animateCamera?: boolean }) => void,
  options: {
    reducedMotion?: Ref<boolean>
  } = {}
) {
  const selectedId = ref<JourneyId | null>(null)
  const journey = shallowRef<Journey | null>(null)
  const steps = shallowRef<JourneyStep[]>([])
  const stepIndex = ref(0)
  const phase = ref<JourneyEnginePhase>('idle')
  const speed = ref<JourneyPlaybackSpeed>(1)
  const playing = ref(false)
  const view = ref<'selection' | 'playback'>('selection')
  const showSubtitles = ref(true)

  const engine = shallowRef<JourneyEngine | null>(null)
  const reducedMotion = options.reducedMotion ?? ref(false)

  const currentStep = computed(() => steps.value[stepIndex.value] ?? null)
  const progress = computed(() => {
    if (steps.value.length === 0) return 0
    return stepIndex.value / Math.max(1, steps.value.length - 1)
  })

  function syncFromEngine(): void {
    const state = engine.value?.getState()
    if (!state) return
    stepIndex.value = state.stepIndex
    phase.value = state.phase
    speed.value = state.speed
    playing.value = state.playing
    steps.value = state.steps
  }

  function attachCamera(bridge: JourneyCameraBridge): void {
    engine.value?.dispose()
    const next = new JourneyEngine({
      setLevel,
      camera: {
        animateCamera: bridge.animateCamera,
        cancelCameraAnimation: bridge.cancelCameraAnimation
      },
      setControlsEnabled: bridge.setControlsEnabled,
      reducedMotion: () => reducedMotion.value
    })
    next.subscribe({ onChange: syncFromEngine })
    engine.value = next

    if (journey.value) {
      next.load(journey.value, steps.value)
      next.setSpeed(speed.value)
      syncFromEngine()
    }
  }

  function selectJourney(id: JourneyId): boolean {
    const found = getJourney(id)
    if (!found || found.status !== 'available') return false
    const resolved = getResolvedSteps(id)
    if (resolved.length === 0) return false
    selectedId.value = id
    journey.value = found
    steps.value = resolved
    view.value = 'playback'
    stepIndex.value = 0
    phase.value = 'idle'
    playing.value = false
    engine.value?.load(found, resolved)
    syncFromEngine()
    return true
  }

  function backToSelection(): void {
    engine.value?.pause()
    view.value = 'selection'
    selectedId.value = null
    journey.value = null
    steps.value = []
    stepIndex.value = 0
    phase.value = 'idle'
    playing.value = false
  }

  async function play(): Promise<void> {
    await engine.value?.play()
    syncFromEngine()
  }

  function pause(): void {
    engine.value?.pause()
    syncFromEngine()
  }

  async function restart(): Promise<void> {
    await engine.value?.restart()
    syncFromEngine()
  }

  async function next(): Promise<void> {
    await engine.value?.next()
    syncFromEngine()
  }

  async function previous(): Promise<void> {
    await engine.value?.previous()
    syncFromEngine()
  }

  async function skip(): Promise<void> {
    await engine.value?.skip()
    syncFromEngine()
  }

  async function jumpToStep(index: number): Promise<void> {
    await engine.value?.jumpToStep(index)
    syncFromEngine()
  }

  function setSpeed(nextSpeed: JourneyPlaybackSpeed): void {
    speed.value = nextSpeed
    engine.value?.setSpeed(nextSpeed)
    syncFromEngine()
  }

  function toggleSubtitles(): void {
    showSubtitles.value = !showSubtitles.value
  }

  onBeforeUnmount(() => {
    engine.value?.dispose()
    engine.value = null
  })

  return {
    view,
    selectedId,
    journey,
    steps,
    stepIndex,
    phase,
    speed,
    playing,
    currentStep,
    progress,
    showSubtitles,
    attachCamera,
    selectJourney,
    backToSelection,
    play,
    pause,
    restart,
    next,
    previous,
    skip,
    jumpToStep,
    setSpeed,
    toggleSubtitles
  }
}
