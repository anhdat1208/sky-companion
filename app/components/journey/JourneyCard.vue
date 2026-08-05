<script setup lang="ts">
import type { Journey } from '../../../types/journey'

defineProps<{
  journey: Journey
}>()

const emit = defineEmits<{
  select: []
}>()
</script>

<template>
  <button
    type="button"
    class="group flex h-full w-full flex-col items-start rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-6 text-left transition duration-300"
    :class="journey.status === 'available'
      ? 'hover:border-white/25 hover:from-white/[0.11] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300'
      : 'cursor-not-allowed opacity-55'"
    :disabled="journey.status !== 'available'"
    :aria-disabled="journey.status !== 'available'"
    @click="journey.status === 'available' && emit('select')"
  >
    <span class="text-4xl" aria-hidden="true">{{ journey.coverEmoji }}</span>
    <span class="mt-5 text-xl font-medium tracking-tight text-white sm:text-2xl">
      {{ $t(journey.titleKey) }}
    </span>
    <span class="mt-2 text-sm leading-relaxed text-slate-400 sm:text-base">
      {{ $t(journey.descriptionKey) }}
    </span>
    <span
      v-if="journey.status === 'coming-soon'"
      class="mt-6 text-xs uppercase tracking-[0.2em] text-slate-500"
    >
      {{ $t('journey.comingSoon') }}
    </span>
    <span
      v-else
      class="mt-6 text-xs uppercase tracking-[0.2em] text-sky-300/80 opacity-0 transition group-hover:opacity-100"
    >
      {{ $t('journey.begin') }}
    </span>
  </button>
</template>
