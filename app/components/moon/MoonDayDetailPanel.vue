<script setup lang="ts">
import type { MoonDayDetail } from '../../../types/moon'
import MoonObservationScore from './MoonObservationScore.vue'
import MoonPhotographyGuide from './MoonPhotographyGuide.vue'

defineProps<{
  detail: MoonDayDetail
}>()

const emit = defineEmits<{
  close: []
}>()

function formatAngle(value: number): string {
  return `${value.toFixed(1)}°`
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}

function formatAge(days: number): string {
  return `${days.toFixed(1)} ngày`
}

function formatDistance(km: number): string {
  return `${Math.round(km).toLocaleString('vi-VN')} km`
}

function formatDiameter(deg: number): string {
  return `${(deg * 60).toFixed(1)}′`
}

function formatTime(value: string | null): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date)
}

function formatDateLabel(dateISO: string): string {
  const date = new Date(`${dateISO}T12:00:00`)
  if (Number.isNaN(date.getTime())) return dateISO
  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date)
}
</script>

<template>
  <SkyCard>
    <div class="mb-4 flex items-start justify-between gap-3">
      <SectionTitle
        class="mb-0"
        title="Chi tiết ngày"
        :subtitle="formatDateLabel(detail.dateISO)"
      />
      <button
        type="button"
        class="shrink-0 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
        @click="emit('close')"
      >
        Đóng
      </button>
    </div>

    <dl class="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
      <div class="col-span-2 rounded-xl bg-slate-950/70 p-4 sm:col-span-3">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Pha
        </dt>
        <dd class="mt-1 text-base text-slate-100">
          {{ detail.phase }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Độ sáng
        </dt>
        <dd class="mt-1 font-mono text-base text-slate-100">
          {{ formatPercent(detail.illuminatedPercentage) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Tuổi
        </dt>
        <dd class="mt-1 font-mono text-base text-slate-100">
          {{ formatAge(detail.ageDays) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Mọc
        </dt>
        <dd class="mt-1 text-sm text-slate-100">
          {{ formatTime(detail.riseTime) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Lặn
        </dt>
        <dd class="mt-1 text-sm text-slate-100">
          {{ formatTime(detail.setTime) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Cao độ
        </dt>
        <dd class="mt-1 font-mono text-base text-slate-100">
          {{ formatAngle(detail.altitude) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Phương vị
        </dt>
        <dd class="mt-1 font-mono text-base text-slate-100">
          {{ formatAngle(detail.azimuth) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Khoảng cách
        </dt>
        <dd class="mt-1 font-mono text-base text-slate-100">
          {{ formatDistance(detail.distanceKm) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Đường kính góc
        </dt>
        <dd class="mt-1 font-mono text-base text-slate-100">
          {{ formatDiameter(detail.angularDiameterDeg) }}
        </dd>
      </div>
    </dl>

    <div class="space-y-4">
      <MoonObservationScore :score="detail.observationScore" />
      <MoonPhotographyGuide :guide="detail.photography" />
    </div>
  </SkyCard>
</template>
