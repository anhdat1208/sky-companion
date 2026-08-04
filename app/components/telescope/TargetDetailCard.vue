<script setup lang="ts">
import type { Direction } from '../../../types/astronomy'
import type { TargetDetail } from '../../../types/telescope'

defineProps<{
  detail: TargetDetail | null
}>()

const { t } = useI18n()
const { formatDateTime, formatNumber } = useFormatters()

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

function formatMagnitude(value: number | null): string {
  if (value === null) {
    return '—'
  }
  return value.toFixed(1)
}

function formatDistance(value: number | null): string {
  if (value === null) {
    return '—'
  }
  return t('components.telescope.targetDetailCard.distanceLy', {
    value: formatNumber(value, { maximumFractionDigits: 1 })
  })
}

function formatDirection(direction: Direction): string {
  return t(`components.telescope.directions.${direction}`)
}
</script>

<template>
  <SkyCard>
    <SectionTitle
      :title="t('components.telescope.targetDetailCard.title')"
      :subtitle="detail
        ? t('components.telescope.targetDetailCard.subtitleWithTarget', { name: detail.target.name })
        : t('components.telescope.targetDetailCard.subtitleEmpty')"
    />

    <dl
      v-if="detail"
      class="grid grid-cols-2 gap-3 sm:grid-cols-3"
    >
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          {{ t('components.skyLabels.altitude') }}
        </dt>
        <dd class="mt-1 font-mono text-base text-slate-100">
          {{ formatAngle(detail.altitude) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          {{ t('components.skyLabels.azimuth') }}
        </dt>
        <dd class="mt-1 font-mono text-base text-slate-100">
          {{ formatAngle(detail.azimuth) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          {{ t('components.telescope.targetDetailCard.constellation') }}
        </dt>
        <dd class="mt-1 text-base text-slate-100">
          {{ detail.target.constellation || '—' }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          {{ t('components.telescope.targetDetailCard.magnitude') }}
        </dt>
        <dd class="mt-1 font-mono text-base text-slate-100">
          {{ formatMagnitude(detail.target.apparentMagnitude) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          {{ t('components.telescope.targetDetailCard.distance') }}
        </dt>
        <dd class="mt-1 font-mono text-base text-slate-100">
          {{ formatDistance(detail.target.distanceLy) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          {{ t('components.telescope.targetDetailCard.direction') }}
        </dt>
        <dd class="mt-1 text-base text-slate-100">
          {{ formatDirection(detail.direction) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          {{ t('components.telescope.targetDetailCard.rise') }}
        </dt>
        <dd class="mt-1 text-sm text-slate-100">
          {{ formatTime(detail.riseTime) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          {{ t('components.telescope.targetDetailCard.set') }}
        </dt>
        <dd class="mt-1 text-sm text-slate-100">
          {{ formatTime(detail.setTime) }}
        </dd>
      </div>
    </dl>

    <p
      v-else
      class="rounded-xl bg-slate-950/70 p-4 text-sm leading-6 text-slate-400"
    >
      {{ t('components.telescope.targetDetailCard.empty') }}
    </p>
  </SkyCard>
</template>
