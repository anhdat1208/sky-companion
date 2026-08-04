<script setup lang="ts">
import type { IssPosition } from '../../../types/iss'

defineProps<{
  position: IssPosition
}>()

const { t } = useI18n()
const { formatDistanceFromKm, formatSpeedFromKmh } = useUnits()
</script>

<template>
  <SkyCard>
    <SectionTitle
      :title="t('components.iss.statsCard.title')"
      :subtitle="t('components.iss.statsCard.subtitle')"
    />

    <dl class="grid grid-cols-2 gap-3">
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          {{ t('components.iss.statsCard.altitude') }}
        </dt>
        <dd class="mt-1 font-mono text-base text-slate-100">
          {{ formatDistanceFromKm(position.altitudeKm) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          {{ t('components.iss.statsCard.speed') }}
        </dt>
        <dd class="mt-1 font-mono text-base text-slate-100">
          {{ formatSpeedFromKmh(position.velocityKph) }}
        </dd>
      </div>
    </dl>
  </SkyCard>
</template>
