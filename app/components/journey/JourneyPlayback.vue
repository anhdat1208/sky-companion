<script setup lang="ts">
import type { JourneyEnginePhase, JourneyPlaybackSpeed, JourneyStep } from '../../../types/journey'
import JourneyControls from './JourneyControls.vue'
import JourneyEduCard from './JourneyEduCard.vue'
import JourneyNarration from './JourneyNarration.vue'
import JourneyTimeline from './JourneyTimeline.vue'

const props = defineProps<{
  steps: JourneyStep[]
  stepIndex: number
  playing: boolean
  speed: JourneyPlaybackSpeed
  phase: JourneyEnginePhase
  showSubtitles: boolean
  title: string
}>()

const emit = defineEmits<{
  play: []
  pause: []
  restart: []
  skip: []
  previous: []
  next: []
  setSpeed: [speed: JourneyPlaybackSpeed]
  jump: [index: number]
  back: []
  toggleSubtitles: []
}>()

const cardOpen = ref(true)
const currentStep = computed(() => props.steps[props.stepIndex] ?? null)

const chip =
  'rounded-full border border-white/10 bg-black/35 px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-slate-200 backdrop-blur-md transition hover:border-white/25 hover:bg-black/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300'
</script>

<template>
  <div class="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-4 sm:p-5 lg:p-6">
    <!-- Single top bar: title left, actions right — no clash with layout chrome -->
    <div class="pointer-events-auto flex items-center justify-between gap-3">
      <div class="min-w-0 rounded-2xl border border-white/10 bg-black/40 px-3.5 py-2.5 backdrop-blur-md sm:px-4">
        <p class="text-[10px] uppercase tracking-[0.22em] text-slate-400">
          {{ $t('journey.eyebrow') }}
        </p>
        <p class="truncate text-sm font-medium text-white sm:text-base">
          {{ title }}
        </p>
      </div>
      <div class="flex shrink-0 items-center gap-2">
        <button
          type="button"
          :class="chip"
          @click="emit('toggleSubtitles')"
        >
          {{ showSubtitles ? $t('journey.subtitles.on') : $t('journey.subtitles.off') }}
        </button>
        <button
          type="button"
          :class="chip"
          @click="emit('back')"
        >
          {{ $t('journey.back') }}
        </button>
      </div>
    </div>

    <div class="pointer-events-none flex flex-1 items-end justify-between gap-6 py-6">
      <div class="pointer-events-auto max-w-xl">
        <JourneyNarration
          v-if="currentStep"
          :narration="currentStep.narration"
          :show-subtitles="showSubtitles"
        />
      </div>
      <div class="pointer-events-auto hidden lg:block">
        <JourneyEduCard
          v-if="currentStep"
          v-model:open="cardOpen"
          :card="currentStep.card"
        />
      </div>
    </div>

    <div class="pointer-events-auto space-y-3 rounded-2xl border border-white/10 bg-black/45 p-3 backdrop-blur-md sm:space-y-4 sm:p-4">
      <JourneyTimeline
        :steps="steps"
        :step-index="stepIndex"
        @jump="emit('jump', $event)"
      />
      <JourneyControls
        :playing="playing"
        :speed="speed"
        :completed="phase === 'completed'"
        @play="emit('play')"
        @pause="emit('pause')"
        @restart="emit('restart')"
        @skip="emit('skip')"
        @previous="emit('previous')"
        @next="emit('next')"
        @set-speed="emit('setSpeed', $event)"
      />
      <p v-if="phase === 'completed'" class="text-center text-sm text-slate-400">
        {{ $t('journey.completed') }}
        <NuxtLink to="/universe" class="ml-2 text-sky-300 hover:underline">
          {{ $t('journey.openExplorer') }}
        </NuxtLink>
      </p>
    </div>
  </div>
</template>
