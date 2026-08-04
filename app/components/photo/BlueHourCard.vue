<script setup lang="ts">
import type { BlueHourInfo, TimeRange } from '../../../types/photo'

defineProps<{
  info: BlueHourInfo | null
}>()

const { t } = useI18n()
const { formatTime: formatTimeValue } = useFormatters()

function formatTime(value: string | null): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return formatTimeValue(date)
}

function formatRange(range: TimeRange | null): string {
  if (!range) return '—'
  return `${formatTime(range.start)} – ${formatTime(range.end)}`
}
</script>

<template>
  <SkyCard>
    <SectionTitle
      :title="t('components.photo.blueHourCard.title')"
      :subtitle="t('components.photo.blueHourCard.subtitle')"
    />

    <dl
      v-if="info"
      class="grid grid-cols-2 gap-3"
    >
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          {{ t('components.photo.morning') }}
        </dt>
        <dd class="mt-1 text-sm text-slate-100">
          {{ formatRange(info.morning) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          {{ t('components.photo.evening') }}
        </dt>
        <dd class="mt-1 text-sm text-slate-100">
          {{ formatRange(info.evening) }}
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
