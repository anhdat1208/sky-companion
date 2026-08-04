<script setup lang="ts">
import type { Coordinates } from '../../types/location'

const { t } = useI18n()

interface CurrentLocationProps {
  coordinates: Coordinates
  label?: string
  sourceLabel?: string
}

const props = defineProps<CurrentLocationProps>()

const displayLabel = computed(() => props.label ?? t('components.currentLocation.label'))
const displaySourceLabel = computed(() => props.sourceLabel ?? t('components.currentLocation.sourceLabel'))
</script>

<template>
  <SkyCard>
    <SectionTitle
      :title="displayLabel"
      :subtitle="displaySourceLabel"
    />

    <dl class="grid grid-cols-2 gap-3">
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          {{ t('components.currentLocation.latitude') }}
        </dt>
        <dd class="mt-1 font-mono text-base text-slate-100">
          {{ coordinates.lat.toFixed(4) }}°
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          {{ t('components.currentLocation.longitude') }}
        </dt>
        <dd class="mt-1 font-mono text-base text-slate-100">
          {{ coordinates.lng.toFixed(4) }}°
        </dd>
      </div>
    </dl>
  </SkyCard>
</template>
