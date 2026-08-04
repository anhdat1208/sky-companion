<script setup lang="ts">
import type { MoonPhotoInfo } from '../../../types/photo'

defineProps<{
  info: MoonPhotoInfo | null
}>()

const { t } = useI18n()
const { formatTime: formatTimeValue } = useFormatters()

function formatTime(value: string | null): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return formatTimeValue(date)
}

function formatIllumination(pct: number): string {
  return `${Math.round(pct)}%`
}
</script>

<template>
  <SkyCard>
    <SectionTitle
      :title="t('components.photo.moonPhotoCard.title')"
      :subtitle="t('components.photo.moonPhotoCard.subtitle')"
    />

    <dl
      v-if="info"
      class="grid grid-cols-2 gap-3 sm:grid-cols-3"
    >
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          {{ t('components.photo.moonPhotoCard.moonrise') }}
        </dt>
        <dd class="mt-1 text-sm text-slate-100">
          {{ formatTime(info.moonrise) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          {{ t('components.photo.moonPhotoCard.moonset') }}
        </dt>
        <dd class="mt-1 text-sm text-slate-100">
          {{ formatTime(info.moonset) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          {{ t('components.photo.moonPhotoCard.phase') }}
        </dt>
        <dd class="mt-1 text-sm text-slate-100">
          {{ info.phase }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          {{ t('components.photo.moonPhotoCard.illumination') }}
        </dt>
        <dd class="mt-1 font-mono text-sm text-slate-100">
          {{ formatIllumination(info.illuminationPct) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          {{ t('components.photo.moonPhotoCard.bestTime') }}
        </dt>
        <dd class="mt-1 text-sm text-slate-100">
          {{ formatTime(info.bestPhotographyTime) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          {{ t('components.photo.moonPhotoCard.lens') }}
        </dt>
        <dd class="mt-1 text-sm text-slate-100">
          {{ info.recommendedLensLabel }}
        </dd>
      </div>
    </dl>

    <p
      v-else
      class="rounded-xl bg-slate-950/70 p-4 text-sm leading-6 text-slate-400"
    >
      {{ t('components.photo.locationRequired') }}
    </p>
  </SkyCard>
</template>
