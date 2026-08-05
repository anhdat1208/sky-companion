import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { useJourney } from '../../app/composables/useJourney'

describe('useJourney', () => {
  it('rejects coming-soon journeys', () => {
    const setLevel = vi.fn()
    const api = useJourney(setLevel)
    expect(api.selectJourney('voyager')).toBe(false)
    expect(api.view.value).toBe('selection')
  })

  it('selects Where Am I and enters playback', () => {
    const setLevel = vi.fn()
    const api = useJourney(setLevel)
    expect(api.selectJourney('where-am-i')).toBe(true)
    expect(api.view.value).toBe('playback')
    expect(api.steps.value).toHaveLength(12)
    expect(api.journey.value?.id).toBe('where-am-i')
  })

  it('returns home resolves reversed steps', () => {
    const setLevel = vi.fn()
    const api = useJourney(setLevel)
    api.selectJourney('return-home')
    expect(api.steps.value[0]?.id).toBe('observable-universe')
  })

  it('attaches camera bridge and can set speed', async () => {
    const setLevel = vi.fn()
    const api = useJourney(setLevel, { reducedMotion: ref(false) })
    api.selectJourney('to-the-sun')
    api.attachCamera({
      animateCamera: async () => {},
      cancelCameraAnimation: () => {},
      setControlsEnabled: () => {}
    })
    api.setSpeed(4)
    expect(api.speed.value).toBe(4)
    await api.jumpToStep(1)
    expect(api.stepIndex.value).toBe(1)
    expect(setLevel).toHaveBeenCalled()
  })
})
