<script setup lang="ts">
import type { MoonTodaySnapshot } from '../../../types/moon'
import MoonPhaseIllustration from './MoonPhaseIllustration.vue'

defineProps<{
  today: MoonTodaySnapshot
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
      title="Mặt Trăng hôm nay"
      subtitle="Pha, vị trí và thời điểm mọc/lặn tại vị trí quan sát."
    />

    <MoonPhaseIllustration
      class="mb-5"
      :phase-angle-deg="today.phaseAngleDeg"
      :label="today.phase"
      :illuminated-percentage="today.illuminatedPercentage"
      :icon-key="today.iconKey"
    />

    <dl class="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <div class="col-span-2 rounded-xl bg-slate-950/70 p-4 sm:col-span-3">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Pha
        </dt>
        <dd class="mt-1 text-base text-slate-100">
          {{ today.phase }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Độ sáng
        </dt>
        <dd class="mt-1 font-mono text-base text-slate-100">
          {{ formatPercent(today.illuminatedPercentage) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Tuổi
        </dt>
        <dd class="mt-1 font-mono text-base text-slate-100">
          {{ formatAge(today.ageDays) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Mọc
        </dt>
        <dd class="mt-1 text-sm text-slate-100">
          {{ formatTime(today.riseTime) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Lặn
        </dt>
        <dd class="mt-1 text-sm text-slate-100">
          {{ formatTime(today.setTime) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Cao độ
        </dt>
        <dd class="mt-1 font-mono text-base text-slate-100">
          {{ formatAngle(today.altitude) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Phương vị
        </dt>
        <dd class="mt-1 font-mono text-base text-slate-100">
          {{ formatAngle(today.azimuth) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Khoảng cách
        </dt>
        <dd class="mt-1 font-mono text-base text-slate-100">
          {{ formatDistance(today.distanceKm) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Đường kính góc
        </dt>
        <dd class="mt-1 font-mono text-base text-slate-100">
          {{ formatDiameter(today.angularDiameterDeg) }}
        </dd>
      </div>
    </dl>
  </SkyCard>
</template>
