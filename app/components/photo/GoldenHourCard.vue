<script setup lang="ts">
import type { GoldenHourInfo, TimeRange } from '../../../types/photo'

defineProps<{
  info: GoldenHourInfo | null
}>()

function formatTime(value: string | null): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat(undefined, { timeStyle: 'short' }).format(date)
}

function formatRange(range: TimeRange | null): string {
  if (!range) return '—'
  return `${formatTime(range.start)} – ${formatTime(range.end)}`
}

function formatDuration(minutes: number | null): string {
  if (minutes === null) return '—'
  return `${minutes} phút`
}
</script>

<template>
  <SkyCard>
    <SectionTitle
      title="Giờ vàng"
      subtitle="Khoảng sáng ấm quanh bình minh và hoàng hôn."
    />

    <dl
      v-if="info"
      class="grid grid-cols-2 gap-3 sm:grid-cols-3"
    >
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Sáng
        </dt>
        <dd class="mt-1 text-sm text-slate-100">
          {{ formatRange(info.morning) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Chiều
        </dt>
        <dd class="mt-1 text-sm text-slate-100">
          {{ formatRange(info.evening) }}
        </dd>
      </div>
      <div class="col-span-2 rounded-xl bg-slate-950/70 p-4 sm:col-span-1">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Tổng thời lượng
        </dt>
        <dd class="mt-1 font-mono text-sm text-slate-100">
          {{ formatDuration(info.durationMinutes) }}
        </dd>
      </div>
    </dl>

    <p
      v-else
      class="rounded-xl bg-slate-950/70 p-4 text-sm leading-6 text-slate-400"
    >
      Cần vị trí
    </p>
  </SkyCard>
</template>
