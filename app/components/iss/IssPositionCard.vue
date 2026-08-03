<script setup lang="ts">
import type { IssPosition } from '../../../types/iss'

defineProps<{
  position: IssPosition
}>()

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

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'medium'
  }).format(date)
}
</script>

<template>
  <SkyCard>
    <SectionTitle
      title="Vị trí ISS"
      subtitle="Tọa độ địa lý hiện tại của Trạm Vũ trụ Quốc tế."
    />

    <dl class="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Vĩ độ
        </dt>
        <dd class="mt-1 font-mono text-base text-slate-100">
          {{ formatCoord(position.latitude, 'B', 'N') }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Kinh độ
        </dt>
        <dd class="mt-1 font-mono text-base text-slate-100">
          {{ formatCoord(position.longitude, 'Đ', 'T') }}
        </dd>
      </div>
      <div class="col-span-2 rounded-xl bg-slate-950/70 p-4 sm:col-span-1">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Thời điểm
        </dt>
        <dd class="mt-1 text-sm text-slate-100">
          {{ formatTime(position.timestamp) }}
        </dd>
      </div>
    </dl>
  </SkyCard>
</template>
