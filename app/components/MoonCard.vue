<script setup lang="ts">
import type { MoonInfo } from '../../types/astronomy'

defineProps<{
  moon: MoonInfo
}>()

const { t } = useI18n()
const { formatDateTime } = useFormatters()

function formatAngle(value: number): string {
  return `${value.toFixed(1)}°`
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}

function formatTime(value: string | null): string {
  if (!value) {
    return '—'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  return formatDateTime(date)
}
</script>

<template>
  <SkyCard>
    <SectionTitle
      :title="t('components.moonCard.title')"
      :subtitle="t('components.moonCard.subtitle')"
    />

    <dl class="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          {{ t('components.skyLabels.altitude') }}
        </dt>
        <dd class="mt-1 font-mono text-base text-slate-100">
          {{ formatAngle(moon.altitude) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          {{ t('components.skyLabels.azimuth') }}
        </dt>
        <dd class="mt-1 font-mono text-base text-slate-100">
          {{ formatAngle(moon.azimuth) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          {{ t('components.moonCard.illumination') }}
        </dt>
        <dd class="mt-1 font-mono text-base text-slate-100">
          {{ formatPercent(moon.illuminatedPercentage) }}
        </dd>
      </div>
      <div class="col-span-2 rounded-xl bg-slate-950/70 p-4 sm:col-span-3">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          {{ t('components.moonCard.phase') }}
        </dt>
        <dd class="mt-1 text-base text-slate-100">
          {{ moon.phase }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          {{ t('components.moonCard.rise') }}
        </dt>
        <dd class="mt-1 text-sm text-slate-100">
          {{ formatTime(moon.riseTime) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          {{ t('components.moonCard.set') }}
        </dt>
        <dd class="mt-1 text-sm text-slate-100">
          {{ formatTime(moon.setTime) }}
        </dd>
      </div>
    </dl>
  </SkyCard>
</template>
