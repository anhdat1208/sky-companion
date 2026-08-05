<script setup lang="ts">
import type { TimeWarpFactor } from '../../../types/universe'

const props = defineProps<{
  playing: boolean
  warp: TimeWarpFactor
  simulationTime: Date
}>()

const emit = defineEmits<{
  play: []
  pause: []
  'update:warp': [warp: TimeWarpFactor]
  jump: [date: Date]
  resetNow: []
}>()

const { t, locale } = useI18n()
const warps: TimeWarpFactor[] = [1, 10, 100, 1000]
const dateInput = ref('')

const formattedTime = computed(() => {
  return new Intl.DateTimeFormat(locale.value, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC'
  }).format(props.simulationTime) + ' UTC'
})

watch(
  () => props.simulationTime,
  (time) => {
    dateInput.value = time.toISOString().slice(0, 16)
  },
  { immediate: true }
)

function onDateChange(): void {
  if (!dateInput.value) return
  const next = new Date(`${dateInput.value}:00.000Z`)
  if (!Number.isNaN(next.getTime())) {
    emit('jump', next)
  }
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-800 bg-slate-950/80 p-3 text-sm backdrop-blur">
    <button
      v-if="!playing"
      type="button"
      class="rounded-lg bg-sky-500 px-3 py-1.5 font-medium text-slate-950"
      @click="emit('play')"
    >
      {{ t('universe.timeline.play') }}
    </button>
    <button
      v-else
      type="button"
      class="rounded-lg border border-slate-600 px-3 py-1.5 text-slate-100"
      @click="emit('pause')"
    >
      {{ t('universe.timeline.pause') }}
    </button>

    <span class="text-xs text-slate-400">{{ t('universe.timeline.warp') }}</span>
    <button
      v-for="factor in warps"
      :key="factor"
      type="button"
      class="rounded-lg px-2 py-1 text-xs"
      :class="warp === factor
        ? 'bg-indigo-500/30 text-indigo-100 ring-1 ring-indigo-400/40'
        : 'border border-slate-700 text-slate-300'"
      @click="emit('update:warp', factor)"
    >
      {{ factor }}x
    </button>

    <label class="ml-auto flex items-center gap-2 text-xs text-slate-400">
      <span>{{ t('universe.timeline.jump') }}</span>
      <input
        v-model="dateInput"
        type="datetime-local"
        class="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-slate-200"
        @change="onDateChange"
      >
    </label>

    <button
      type="button"
      class="rounded-lg border border-slate-700 px-2 py-1 text-xs text-slate-200"
      @click="emit('resetNow')"
    >
      {{ t('universe.timeline.resetNow') }}
    </button>

    <p class="w-full text-xs text-slate-400 sm:w-auto">
      {{ formattedTime }}
    </p>
  </div>
</template>
