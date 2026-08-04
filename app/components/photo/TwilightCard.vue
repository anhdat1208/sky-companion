<script setup lang="ts">
import type { TimeRange, TwilightInfo } from '../../../types/photo'

defineProps<{
  info: TwilightInfo | null
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
</script>

<template>
  <SkyCard>
    <SectionTitle
      title="Chạng vạng"
      subtitle="Civil, nautical và astronomical — sáng và chiều."
    />

    <div
      v-if="info"
      class="space-y-3"
    >
      <div class="rounded-xl bg-slate-950/70 p-4">
        <p class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Civil
        </p>
        <dl class="mt-2 grid grid-cols-2 gap-3">
          <div>
            <dt class="text-xs text-slate-500">
              Sáng
            </dt>
            <dd class="mt-0.5 text-sm text-slate-100">
              {{ formatRange(info.civil.morning) }}
            </dd>
          </div>
          <div>
            <dt class="text-xs text-slate-500">
              Chiều
            </dt>
            <dd class="mt-0.5 text-sm text-slate-100">
              {{ formatRange(info.civil.evening) }}
            </dd>
          </div>
        </dl>
      </div>

      <div class="rounded-xl bg-slate-950/70 p-4">
        <p class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Nautical
        </p>
        <dl class="mt-2 grid grid-cols-2 gap-3">
          <div>
            <dt class="text-xs text-slate-500">
              Sáng
            </dt>
            <dd class="mt-0.5 text-sm text-slate-100">
              {{ formatRange(info.nautical.morning) }}
            </dd>
          </div>
          <div>
            <dt class="text-xs text-slate-500">
              Chiều
            </dt>
            <dd class="mt-0.5 text-sm text-slate-100">
              {{ formatRange(info.nautical.evening) }}
            </dd>
          </div>
        </dl>
      </div>

      <div class="rounded-xl bg-slate-950/70 p-4">
        <p class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Astronomical
        </p>
        <dl class="mt-2 grid grid-cols-2 gap-3">
          <div>
            <dt class="text-xs text-slate-500">
              Sáng
            </dt>
            <dd class="mt-0.5 text-sm text-slate-100">
              {{ formatRange(info.astronomical.morning) }}
            </dd>
          </div>
          <div>
            <dt class="text-xs text-slate-500">
              Chiều
            </dt>
            <dd class="mt-0.5 text-sm text-slate-100">
              {{ formatRange(info.astronomical.evening) }}
            </dd>
          </div>
        </dl>
      </div>
    </div>

    <p
      v-else
      class="rounded-xl bg-slate-950/70 p-4 text-sm leading-6 text-slate-400"
    >
      Cần vị trí
    </p>
  </SkyCard>
</template>
