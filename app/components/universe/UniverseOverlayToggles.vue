<script setup lang="ts">
import type { OverlayFlags } from '../../../types/universe'

const props = defineProps<{
  overlays: OverlayFlags
}>()

const emit = defineEmits<{
  'update:overlays': [flags: OverlayFlags]
}>()

const { t } = useI18n()

function toggle(key: keyof OverlayFlags): void {
  emit('update:overlays', { ...props.overlays, [key]: !props.overlays[key] })
}
</script>

<template>
  <div class="flex flex-wrap gap-2 rounded-2xl border border-slate-800 bg-slate-950/80 p-3 backdrop-blur">
    <button
      type="button"
      class="rounded-lg px-3 py-1.5 text-xs"
      :class="overlays.labels
        ? 'bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-400/30'
        : 'border border-slate-700 text-slate-400'"
      @click="toggle('labels')"
    >
      {{ t('universe.overlays.labels') }}
    </button>
    <button
      type="button"
      class="rounded-lg px-3 py-1.5 text-xs"
      :class="overlays.orbits
        ? 'bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-400/30'
        : 'border border-slate-700 text-slate-400'"
      @click="toggle('orbits')"
    >
      {{ t('universe.overlays.orbits') }}
    </button>
    <button
      type="button"
      class="rounded-lg px-3 py-1.5 text-xs"
      :class="overlays.distances
        ? 'bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-400/30'
        : 'border border-slate-700 text-slate-400'"
      @click="toggle('distances')"
    >
      {{ t('universe.overlays.distances') }}
    </button>
  </div>
</template>
