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
</script>

<template>
  <div class="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
    <div class="pointer-events-auto flex items-start justify-between gap-4">
      <div>
        <p class="text-xs uppercase tracking-[0.22em] text-slate-400">
          {{ $t('journey.eyebrow') }}
        </p>
        <p class="mt-1 text-sm text-white/90">{{ title }}</p>
      </div>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="rounded-full px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-slate-300 hover:bg-white/10"
          @click="emit('toggleSubtitles')"
        >
          {{ showSubtitles ? $t('journey.subtitles.on') : $t('journey.subtitles.off') }}
        </button>
        <button
          type="button"
          class="rounded-full px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-slate-300 hover:bg-white/10"
          @click="emit('back')"
        >
          {{ $t('journey.back') }}
        </button>
      </div>
    </div>

    <div class="pointer-events-none flex flex-1 items-end justify-between gap-6 py-8">
      <div class="pointer-events-auto">
        <JourneyNarration
          v-if="currentStep"
          :narration="currentStep.narration"
          :show-subtitles="showSubtitles"
        />
      </div>
      <div class="pointer-events-auto hidden md:block">
        <JourneyEduCard
          v-if="currentStep"
          v-model:open="cardOpen"
          :card="currentStep.card"
        />
      </div>
    </div>

    <div class="pointer-events-auto space-y-4 rounded-2xl border border-white/10 bg-slate-950/55 p-4 backdrop-blur-md">
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
