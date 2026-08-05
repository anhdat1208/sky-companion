<script setup lang="ts">
import type { JourneyPlaybackSpeed } from '../../../types/journey'

defineProps<{
  playing: boolean
  speed: JourneyPlaybackSpeed
  completed: boolean
}>()

const emit = defineEmits<{
  play: []
  pause: []
  restart: []
  skip: []
  previous: []
  next: []
  setSpeed: [speed: JourneyPlaybackSpeed]
}>()

const speeds: JourneyPlaybackSpeed[] = [1, 2, 4, 8]

const btn =
  'rounded-full px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-slate-200 transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 disabled:opacity-40'
</script>

<template>
  <div class="flex flex-wrap items-center gap-2" role="group" :aria-label="$t('journey.controls.label')">
    <button type="button" :class="btn" @click="emit('previous')">
      {{ $t('journey.controls.previous') }}
    </button>
    <button
      v-if="!playing"
      type="button"
      :class="btn"
      class="bg-white/10"
      @click="emit('play')"
    >
      {{ completed ? $t('journey.controls.restart') : $t('journey.controls.play') }}
    </button>
    <button
      v-else
      type="button"
      :class="btn"
      class="bg-white/10"
      @click="emit('pause')"
    >
      {{ $t('journey.controls.pause') }}
    </button>
    <button type="button" :class="btn" @click="emit('next')">
      {{ $t('journey.controls.next') }}
    </button>
    <button type="button" :class="btn" @click="emit('skip')">
      {{ $t('journey.controls.skip') }}
    </button>
    <button type="button" :class="btn" @click="emit('restart')">
      {{ $t('journey.controls.restart') }}
    </button>

    <div class="ml-auto flex items-center gap-1" role="group" :aria-label="$t('journey.controls.speed')">
      <button
        v-for="value in speeds"
        :key="value"
        type="button"
        :class="[
          btn,
          speed === value ? 'bg-sky-400/20 text-sky-100' : ''
        ]"
        @click="emit('setSpeed', value)"
      >
        {{ value }}x
      </button>
    </div>
  </div>
</template>
