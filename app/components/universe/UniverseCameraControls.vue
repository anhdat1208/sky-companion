<script setup lang="ts">
import type { CameraMode, CelestialBodyId } from '../../../types/universe'

defineProps<{
  cameraMode: CameraMode
  selectedBodyId: CelestialBodyId | null
  level: number
}>()

const emit = defineEmits<{
  reset: []
  follow: []
  focus: []
}>()

const { t } = useI18n()
</script>

<template>
  <div class="flex flex-wrap gap-2 rounded-2xl border border-slate-800 bg-slate-950/80 p-3 backdrop-blur">
    <button
      type="button"
      class="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-200"
      @click="emit('reset')"
    >
      {{ t('universe.camera.reset') }}
    </button>
    <button
      type="button"
      class="rounded-lg px-3 py-1.5 text-xs"
      :class="cameraMode === 'follow'
        ? 'bg-sky-500/25 text-sky-100 ring-1 ring-sky-400/40'
        : 'border border-slate-700 text-slate-200'"
      :disabled="!selectedBodyId || level < 4"
      @click="emit('follow')"
    >
      {{ t('universe.camera.follow') }}
    </button>
    <button
      type="button"
      class="rounded-lg px-3 py-1.5 text-xs"
      :class="cameraMode === 'focus'
        ? 'bg-sky-500/25 text-sky-100 ring-1 ring-sky-400/40'
        : 'border border-slate-700 text-slate-200'"
      :disabled="!selectedBodyId"
      @click="emit('focus')"
    >
      {{ t('universe.camera.focus') }}
    </button>
  </div>
</template>
