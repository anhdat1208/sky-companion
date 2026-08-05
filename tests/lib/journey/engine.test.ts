import { describe, expect, it, vi } from 'vitest'
import {
  JourneyEngine,
  resolveJourneySteps
} from '../../../lib/journey/journey-engine'
import type { Journey, JourneyStep } from '../../../types/journey'

function makeStep(id: string, level: 1 | 2 | 3 = 1): JourneyStep {
  return {
    id,
    level,
    holdMs: 50,
    camera: [{ durationMs: 20, easing: 'linear' }],
    narration: {
      titleKey: `${id}.title`,
      bodyKey: `${id}.body`
    },
    card: {
      titleKey: `${id}.card`,
      descriptionKey: `${id}.desc`,
      factsKeys: []
    }
  }
}

function createEngine(overrides?: {
  reducedMotion?: boolean
}) {
  const setLevel = vi.fn()
  const animateCamera = vi.fn(async () => {})
  const cancelCameraAnimation = vi.fn()
  const setControlsEnabled = vi.fn()
  const engine = new JourneyEngine({
    setLevel,
    camera: { animateCamera, cancelCameraAnimation },
    setControlsEnabled,
    reducedMotion: () => overrides?.reducedMotion ?? false
  })
  return { engine, setLevel, animateCamera, cancelCameraAnimation, setControlsEnabled }
}

describe('resolveJourneySteps', () => {
  it('clones forward steps', () => {
    const journey: Journey = {
      id: 'to-the-sun',
      status: 'available',
      titleKey: 't',
      descriptionKey: 'd',
      steps: [makeStep('a'), makeStep('b')]
    }
    const steps = resolveJourneySteps(journey, () => undefined)
    expect(steps.map((s) => s.id)).toEqual(['a', 'b'])
    expect(steps[0]).not.toBe(journey.steps[0])
  })

  it('reverses steps and applies narration overrides', () => {
    const source: Journey = {
      id: 'where-am-i',
      status: 'available',
      titleKey: 't',
      descriptionKey: 'd',
      steps: [makeStep('you'), makeStep('earth'), makeStep('universe')]
    }
    const reverse: Journey = {
      id: 'return-home',
      status: 'available',
      titleKey: 't',
      descriptionKey: 'd',
      steps: [],
      reverseOf: 'where-am-i',
      reverseNarrationOverrides: {
        you: { titleKey: 'home.you', bodyKey: 'home.you.body' }
      }
    }
    const steps = resolveJourneySteps(reverse, (id) => (id === 'where-am-i' ? source : undefined))
    expect(steps.map((s) => s.id)).toEqual(['universe', 'earth', 'you'])
    expect(steps[2]?.narration.titleKey).toBe('home.you')
  })
})

describe('JourneyEngine', () => {
  it('plays through steps and completes', async () => {
    const { engine, setLevel, animateCamera } = createEngine()
    const journey: Journey = {
      id: 'to-the-sun',
      status: 'available',
      titleKey: 't',
      descriptionKey: 'd',
      steps: [makeStep('a', 2), makeStep('b', 3)]
    }
    engine.load(journey, journey.steps)
    await engine.play()
    expect(setLevel).toHaveBeenCalled()
    expect(animateCamera).toHaveBeenCalled()
    expect(engine.getState().phase).toBe('completed')
    expect(engine.getState().playing).toBe(false)
  })

  it('pauses and resumes controls', async () => {
    const { engine, setControlsEnabled } = createEngine()
    const journey: Journey = {
      id: 'to-the-sun',
      status: 'available',
      titleKey: 't',
      descriptionKey: 'd',
      steps: [makeStep('a'), makeStep('b')]
    }
    engine.load(journey, journey.steps)
    const playPromise = engine.play()
    engine.pause()
    await playPromise
    expect(engine.getState().phase).toBe('paused')
    expect(setControlsEnabled).toHaveBeenCalledWith(true)
  })

  it('jumps to a step index', async () => {
    const { engine, setLevel } = createEngine()
    const journey: Journey = {
      id: 'to-the-sun',
      status: 'available',
      titleKey: 't',
      descriptionKey: 'd',
      steps: [makeStep('a', 1), makeStep('b', 2), makeStep('c', 3)]
    }
    engine.load(journey, journey.steps)
    await engine.jumpToStep(2)
    expect(engine.getState().stepIndex).toBe(2)
    expect(setLevel).toHaveBeenCalledWith(3, { animateCamera: false })
  })

  it('changes speed', () => {
    const { engine } = createEngine()
    engine.setSpeed(4)
    expect(engine.getState().speed).toBe(4)
  })
})
