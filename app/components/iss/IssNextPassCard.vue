<script setup lang="ts">
import type { IssPassPrediction } from '../../../types/iss'

defineProps<{
  nextPass: IssPassPrediction | null
}>()

function formatTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date)
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.round(seconds % 60)
  if (mins <= 0) {
    return `${secs} giây`
  }
  return `${mins} phút ${secs.toString().padStart(2, '0')} giây`
}

function formatElevation(deg: number): string {
  return `${deg.toFixed(1)}°`
}

function formatMagnitude(value: number | null): string {
  if (value === null) {
    return '—'
  }
  return value.toFixed(1)
}
</script>

<template>
  <SkyCard>
    <SectionTitle
      title="Lượt qua kế tiếp"
      subtitle="Thời gian, hướng và thời lượng khi ISS có thể nhìn thấy."
    />

    <dl
      v-if="nextPass"
      class="grid grid-cols-2 gap-3 sm:grid-cols-3"
    >
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Mọc
        </dt>
        <dd class="mt-1 text-sm text-slate-100">
          {{ formatTime(nextPass.riseTime) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Cao nhất
        </dt>
        <dd class="mt-1 text-sm text-slate-100">
          {{ formatTime(nextPass.maxTime) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Lặn
        </dt>
        <dd class="mt-1 text-sm text-slate-100">
          {{ formatTime(nextPass.setTime) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Thời lượng
        </dt>
        <dd class="mt-1 font-mono text-base text-slate-100">
          {{ formatDuration(nextPass.durationSeconds) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Cao độ tối đa
        </dt>
        <dd class="mt-1 font-mono text-base text-slate-100">
          {{ formatElevation(nextPass.maxElevationDeg) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Hướng
        </dt>
        <dd class="mt-1 text-base text-slate-100">
          {{ nextPass.direction }}
        </dd>
      </div>
      <div class="col-span-2 rounded-xl bg-slate-950/70 p-4 sm:col-span-3">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Cấp sao (ước tính)
        </dt>
        <dd class="mt-1 font-mono text-base text-slate-100">
          {{ formatMagnitude(nextPass.magnitude) }}
        </dd>
      </div>
    </dl>

    <p
      v-else
      class="rounded-xl bg-slate-950/70 p-4 text-sm leading-6 text-slate-400"
    >
      Chưa có lượt qua nhìn thấy trong 36 giờ tới, hoặc cần vị trí quan sát
      (GPS / nhập tay) để dự đoán.
    </p>
  </SkyCard>
</template>
