<script setup lang="ts">
import type { SunInfo } from '../../types/astronomy'

defineProps<{
  sun: SunInfo
}>()

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

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date)
}
</script>

<template>
  <SkyCard>
    <SectionTitle
      title="Mặt Trời"
      subtitle="Cao độ, phương vị và thời điểm mọc/lặn."
    />

    <dl class="grid grid-cols-2 gap-3">
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Cao độ
        </dt>
        <dd class="mt-1 font-mono text-base text-slate-100">
          {{ formatAngle(sun.altitude) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Phương vị
        </dt>
        <dd class="mt-1 font-mono text-base text-slate-100">
          {{ formatAngle(sun.azimuth) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Bình minh
        </dt>
        <dd class="mt-1 text-sm text-slate-100">
          {{ formatTime(sun.sunrise) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Hoàng hôn
        </dt>
        <dd class="mt-1 text-sm text-slate-100">
          {{ formatTime(sun.sunset) }}
        </dd>
      </div>
    </dl>
  </SkyCard>
</template>
