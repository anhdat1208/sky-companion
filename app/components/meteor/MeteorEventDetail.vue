<script setup lang="ts">
import type { MeteorEventDetail } from '../../../types/meteor'

defineProps<{
  detail: MeteorEventDetail
}>()

function formatTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date)
}

function formatHours(value: number): string {
  return `${value.toFixed(1)} giờ`
}

function formatRa(hours: number): string {
  return `${hours.toFixed(2)}h`
}

function formatDec(deg: number): string {
  const sign = deg >= 0 ? '+' : ''
  return `${sign}${deg.toFixed(1)}°`
}

function formatSpeed(kmS: number): string {
  return `${kmS.toFixed(0)} km/s`
}
</script>

<template>
  <SkyCard>
    <SectionTitle
      title="Chi tiết"
      :subtitle="detail.name"
    />

    <p class="mb-4 text-sm leading-6 text-slate-300">
      {{ detail.description }}
    </p>

    <dl class="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Chòm sao gốc
        </dt>
        <dd class="mt-1 text-sm text-slate-100">
          {{ detail.originConstellation }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Radiant RA
        </dt>
        <dd class="mt-1 font-mono text-sm text-slate-100">
          {{ formatRa(detail.radiantRaHours) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Radiant Dec
        </dt>
        <dd class="mt-1 font-mono text-sm text-slate-100">
          {{ formatDec(detail.radiantDecDeg) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Tốc độ
        </dt>
        <dd class="mt-1 font-mono text-sm text-slate-100">
          {{ formatSpeed(detail.expectedSpeedKmS) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Sao chổi mẹ
        </dt>
        <dd class="mt-1 text-sm text-slate-100">
          {{ detail.parentComet ?? '—' }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Thời lượng đỉnh
        </dt>
        <dd class="mt-1 font-mono text-sm text-slate-100">
          {{ formatHours(detail.peakDurationHours) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Đỉnh
        </dt>
        <dd class="mt-1 text-sm text-slate-100">
          {{ formatTime(detail.peakAt) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Bắt đầu hoạt động
        </dt>
        <dd class="mt-1 text-sm text-slate-100">
          {{ formatTime(detail.activeStart) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Kết thúc hoạt động
        </dt>
        <dd class="mt-1 text-sm text-slate-100">
          {{ formatTime(detail.activeEnd) }}
        </dd>
      </div>
      <div class="col-span-2 rounded-xl bg-slate-950/70 p-4 sm:col-span-3">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          ZHR
        </dt>
        <dd class="mt-1 font-mono text-base text-slate-100">
          {{ detail.zhr }}
        </dd>
      </div>
    </dl>

    <div class="mt-3 rounded-xl bg-slate-950/70 p-4 text-sm leading-6 text-slate-300">
      <p class="text-xs font-medium uppercase tracking-wider text-slate-500">
        Bản đồ tầm nhìn
      </p>
      <p class="mt-2 font-medium text-sky-300">
        Sắp có
      </p>
      <p class="mt-1 text-slate-400">
        {{ detail.visibilityMap.message }}
      </p>
    </div>
  </SkyCard>
</template>
