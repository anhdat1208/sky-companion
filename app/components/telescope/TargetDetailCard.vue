<script setup lang="ts">
import type { TargetDetail } from '../../../types/telescope'

defineProps<{
  detail: TargetDetail | null
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
  return `${value.toLocaleString(undefined, { maximumFractionDigits: 1 })} ly`
}
</script>

<template>
  <SkyCard>
    <SectionTitle
      title="Chi tiết mục tiêu"
      :subtitle="detail
        ? `Thông tin quan sát cho ${detail.target.name}.`
        : 'Chọn một mục tiêu từ danh sách để xem chi tiết.'"
    />

    <dl
      v-if="detail"
      class="grid grid-cols-2 gap-3 sm:grid-cols-3"
    >
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
          Chòm sao
        </dt>
        <dd class="mt-1 text-base text-slate-100">
          {{ detail.target.constellation || '—' }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Cấp sao
        </dt>
        <dd class="mt-1 font-mono text-base text-slate-100">
          {{ formatMagnitude(detail.target.apparentMagnitude) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Khoảng cách
        </dt>
        <dd class="mt-1 font-mono text-base text-slate-100">
          {{ formatDistance(detail.target.distanceLy) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Hướng
        </dt>
        <dd class="mt-1 text-base text-slate-100">
          {{ detail.direction }}
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
    </dl>

    <p
      v-else
      class="rounded-xl bg-slate-950/70 p-4 text-sm leading-6 text-slate-400"
    >
      Chưa chọn mục tiêu.
    </p>
  </SkyCard>
</template>
