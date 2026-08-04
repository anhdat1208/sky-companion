<script setup lang="ts">
import type { SunInfo } from '../../types/astronomy'

defineProps<{
  sun: SunInfo
}>()

const { t } = useI18n()
const { formatDateTime } = useFormatters()

function formatAngle(value: number): string {
  return `${value.toFixed(1)}°`
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
      :title="t('components.sunCard.title')"
      :subtitle="t('components.sunCard.subtitle')"
    />

    <dl class="grid grid-cols-2 gap-3">
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          {{ t('components.skyLabels.altitude') }}
        </dt>
        <dd class="mt-1 font-mono text-base text-slate-100">
          {{ formatAngle(sun.altitude) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          {{ t('components.skyLabels.azimuth') }}
        </dt>
        <dd class="mt-1 font-mono text-base text-slate-100">
          {{ formatAngle(sun.azimuth) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          {{ t('components.sunCard.sunrise') }}
        </dt>
        <dd class="mt-1 text-sm text-slate-100">
          {{ formatTime(sun.sunrise) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          {{ t('components.sunCard.sunset') }}
        </dt>
        <dd class="mt-1 text-sm text-slate-100">
          {{ formatTime(sun.sunset) }}
        </dd>
      </div>
    </dl>
  </SkyCard>
</template>
