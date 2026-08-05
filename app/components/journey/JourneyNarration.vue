<script setup lang="ts">
import type { Narration } from '../../../types/journey'

defineProps<{
  narration: Narration
  showSubtitles: boolean
}>()
</script>

<template>
  <div class="pointer-events-none max-w-xl">
    <Transition
      enter-active-class="transition duration-500 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-300 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
      mode="out-in"
    >
      <div :key="narration.titleKey">
        <h2 class="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
          {{ $t(narration.titleKey) }}
        </h2>
        <p class="mt-3 text-base leading-relaxed text-slate-300 sm:text-lg">
          {{ $t(narration.bodyKey) }}
        </p>
        <p
          v-if="showSubtitles && narration.subtitleKey"
          class="mt-4 border-l border-white/20 pl-3 text-sm text-slate-400"
          aria-live="polite"
        >
          {{ $t(narration.subtitleKey) }}
        </p>
      </div>
    </Transition>
  </div>
</template>
