<script setup lang="ts">
import type { JourneyStep } from '../../../types/journey'

const props = defineProps<{
  steps: JourneyStep[]
  stepIndex: number
}>()

const emit = defineEmits<{
  jump: [index: number]
}>()

const { t } = useI18n()

const startLabel = computed(() => {
  const first = props.steps[0]
  return first ? t(first.narration.titleKey) : ''
})

const endLabel = computed(() => {
  const last = props.steps[props.steps.length - 1]
  return last ? t(last.narration.titleKey) : ''
})
</script>

<template>
  <div class="w-full" role="navigation" :aria-label="$t('journey.timeline.label')">
    <div class="mb-2 flex justify-between text-[11px] uppercase tracking-[0.18em] text-slate-400">
      <span class="truncate pr-2">{{ startLabel }}</span>
      <span class="truncate pl-2 text-right">{{ endLabel }}</span>
    </div>
    <div class="relative flex items-center gap-0">
      <div class="absolute inset-x-2 top-1/2 h-px -translate-y-1/2 bg-white/15" />
      <button
        v-for="(step, index) in steps"
        :key="step.id"
        type="button"
        class="relative z-10 flex flex-1 justify-center"
        :aria-label="t(step.narration.titleKey)"
        :aria-current="index === stepIndex ? 'step' : undefined"
        @click="emit('jump', index)"
      >
        <span
          class="block h-2.5 w-2.5 rounded-full transition"
          :class="index <= stepIndex
            ? 'bg-white shadow-[0_0_12px_rgba(255,255,255,0.45)]'
            : 'bg-white/25'"
        />
      </button>
    </div>
  </div>
</template>
