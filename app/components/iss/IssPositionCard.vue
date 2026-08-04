<script setup lang="ts">
import type { IssPosition } from '../../../types/iss'

defineProps<{
  position: IssPosition
}>()

const { t } = useI18n()
const { formatDateTime } = useFormatters()

function formatCoord(value: number, positive: string, negative: string): string {
  const abs = Math.abs(value).toFixed(2)
  const hemi = value >= 0 ? positive : negative
  return `${abs}° ${hemi}`
}

function formatTime(value: string): string {
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
      :title="t('components.iss.positionCard.title')"
      :subtitle="t('components.iss.positionCard.subtitle')"
    />

    <dl class="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          {{ t('components.iss.positionCard.latitude') }}
        </dt>
        <dd class="mt-1 font-mono text-base text-slate-100">
          {{ formatCoord(position.latitude, t('components.iss.positionCard.north'), t('components.iss.positionCard.south')) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          {{ t('components.iss.positionCard.longitude') }}
        </dt>
        <dd class="mt-1 font-mono text-base text-slate-100">
          {{ formatCoord(position.longitude, t('components.iss.positionCard.east'), t('components.iss.positionCard.west')) }}
        </dd>
      </div>
      <div class="col-span-2 rounded-xl bg-slate-950/70 p-4 sm:col-span-1">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          {{ t('components.iss.positionCard.timestamp') }}
        </dt>
        <dd class="mt-1 text-sm text-slate-100">
          {{ formatTime(position.timestamp) }}
        </dd>
      </div>
    </dl>
  </SkyCard>
</template>
