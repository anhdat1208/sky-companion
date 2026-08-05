<script setup lang="ts">
import type { Coordinates } from '../../../types/location'
import type { JourneyId } from '../../../types/journey'
import { listJourneys } from '../../../lib/journey/journeys'
import JourneyPlayback from '../../components/journey/JourneyPlayback.vue'
import JourneySelection from '../../components/journey/JourneySelection.vue'
import UniverseCanvas from '../../components/universe/UniverseCanvas.vue'

definePageMeta({
  layout: 'journey'
})

const { t } = useI18n()

useHead({
  title: () => t('pages.journey.title')
})

const journeys = listJourneys()
const geo = useGeolocationInput()
const coordinates = computed<Coordinates | null>(() => geo.coordinates.value)

const {
  level,
  selectedBodyId,
  overlays,
  cameraMode,
  snapshot,
  setLevel,
  selectBody
} = useUniverse(coordinates)

const reducedMotion = ref(false)
onMounted(() => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    reducedMotion.value = mq.matches
    const onChange = () => {
      reducedMotion.value = mq.matches
    }
    mq.addEventListener?.('change', onChange)
    onBeforeUnmount(() => mq.removeEventListener?.('change', onChange))
  }
})

const journeyApi = useJourney(
  (nextLevel, options) => {
    setLevel(nextLevel)
    // Journey engine already requests animateCamera:false via its own path;
    // UniverseCanvas autoAnimateLevel=false prevents double animation.
    void options
  },
  { reducedMotion }
)

const canvasRef = ref<InstanceType<typeof UniverseCanvas> | null>(null)
const pendingAutoplay = ref(false)

function onCanvasReady(): void {
  const canvas = canvasRef.value
  if (!canvas) return
  journeyApi.attachCamera({
    animateCamera: (kf) => canvas.animateCamera(kf),
    cancelCameraAnimation: () => canvas.cancelCameraAnimation(),
    setControlsEnabled: (enabled) => canvas.setControlsEnabled(enabled)
  })
  if (pendingAutoplay.value) {
    pendingAutoplay.value = false
    void journeyApi.play()
  }
}

function onSelect(id: JourneyId): void {
  const ok = journeyApi.selectJourney(id)
  if (ok) {
    pendingAutoplay.value = true
    const first = journeyApi.steps.value[0]
    if (first) setLevel(first.level)
  }
}

function onKeydown(event: KeyboardEvent): void {
  if (journeyApi.view.value !== 'playback') return
  if (event.code === 'Space') {
    event.preventDefault()
    if (journeyApi.playing.value) journeyApi.pause()
    else void journeyApi.play()
  } else if (event.key === 'ArrowRight') {
    event.preventDefault()
    void journeyApi.next()
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault()
    void journeyApi.previous()
  } else if (event.key === 'Escape') {
    event.preventDefault()
    if (journeyApi.playing.value) journeyApi.pause()
    else journeyApi.backToSelection()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})

const journeyTitle = computed(() => {
  if (!journeyApi.journey.value) return ''
  return t(journeyApi.journey.value.titleKey)
})
</script>

<template>
  <div class="min-h-[100dvh] bg-[#030712] text-slate-100">
    <JourneySelection
      v-if="journeyApi.view.value === 'selection'"
      :journeys="journeys"
      @select="onSelect"
    />

    <div
      v-else
      class="relative min-h-[100dvh] w-full"
    >
      <UniverseCanvas
        ref="canvasRef"
        variant="journey"
        :auto-animate-level="false"
        :level="level"
        :snapshot="snapshot"
        :overlays="overlays"
        :camera-mode="cameraMode"
        :follow-body-id="selectedBodyId"
        @ready="onCanvasReady"
        @select-body="selectBody"
      />
      <JourneyPlayback
        :steps="journeyApi.steps.value"
        :step-index="journeyApi.stepIndex.value"
        :playing="journeyApi.playing.value"
        :speed="journeyApi.speed.value"
        :phase="journeyApi.phase.value"
        :show-subtitles="journeyApi.showSubtitles.value"
        :title="journeyTitle"
        @play="journeyApi.play()"
        @pause="journeyApi.pause()"
        @restart="journeyApi.restart()"
        @skip="journeyApi.skip()"
        @previous="journeyApi.previous()"
        @next="journeyApi.next()"
        @set-speed="journeyApi.setSpeed($event)"
        @jump="journeyApi.jumpToStep($event)"
        @back="journeyApi.backToSelection()"
        @toggle-subtitles="journeyApi.toggleSubtitles()"
      />
    </div>
  </div>
</template>
