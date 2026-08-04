<script setup lang="ts">
import type { CameraSettings, MilkyWayPhotoInfo } from '../../../types/photo'
import type { Direction } from '../../../types/astronomy'

defineProps<{
  info: MilkyWayPhotoInfo | null
}>()

const { t } = useI18n()
const { formatTime: formatTimeValue } = useFormatters()

function formatTime(value: string | null): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return formatTimeValue(date)
}

function formatAngle(value: number | null): string {
  if (value === null) return '—'
  return `${value.toFixed(1)}°`
}

function formatCore(value: boolean | null): string {
  if (value === null) return '—'
  return value ? t('components.moon.yes') : t('components.moon.no')
}

function formatDirection(direction: Direction | null): string {
  if (!direction) return '—'
  return t(`components.telescope.directions.${direction}`)
}

function formatVisibility(value: MilkyWayPhotoInfo['visibility']): string {
  return t(`components.photo.milkyWayVisibility.${value}`)
}

function formatSettings(settings: CameraSettings): string {
  return [
    `ISO ${settings.iso.min}–${settings.iso.max}`,
    settings.aperture,
    settings.exposureTime,
    `${settings.focalLengthMm.min}–${settings.focalLengthMm.max}mm`
  ].join(' · ')
}
</script>

<template>
  <SkyCard>
    <SectionTitle
      :title="t('components.photo.milkyWayPhotoCard.title')"
      :subtitle="t('components.photo.milkyWayPhotoCard.subtitle')"
    />

    <dl
      v-if="info"
      class="grid grid-cols-2 gap-3 sm:grid-cols-3"
    >
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          {{ t('components.photo.milkyWayPhotoCard.visibility') }}
        </dt>
        <dd class="mt-1 text-sm text-slate-100">
          {{ formatVisibility(info.visibility) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          {{ t('components.photo.milkyWayPhotoCard.direction') }}
        </dt>
        <dd class="mt-1 text-sm text-sky-300">
          {{ formatDirection(info.direction) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          {{ t('components.photo.milkyWayPhotoCard.altitude') }}
        </dt>
        <dd class="mt-1 font-mono text-sm text-slate-100">
          {{ formatAngle(info.altitudeDeg) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          {{ t('components.photo.milkyWayPhotoCard.bestTime') }}
        </dt>
        <dd class="mt-1 text-sm text-slate-100">
          {{ formatTime(info.bestTime) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          {{ t('components.photo.milkyWayPhotoCard.core') }}
        </dt>
        <dd class="mt-1 text-sm text-slate-100">
          {{ formatCore(info.coreVisible) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          {{ t('components.photo.milkyWayPhotoCard.lens') }}
        </dt>
        <dd class="mt-1 text-sm text-slate-100">
          {{ info.recommendedLensLabel }}
        </dd>
      </div>
      <div class="col-span-2 rounded-xl bg-slate-950/70 p-4 sm:col-span-3">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          {{ t('components.photo.milkyWayPhotoCard.suggestedSettings') }}
        </dt>
        <dd class="mt-1 text-sm leading-6 text-slate-100">
          {{ formatSettings(info.settings) }}
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
