<script setup lang="ts">
import type { CameraSettings, MilkyWayPhotoInfo } from '../../../types/photo'

defineProps<{
  info: MilkyWayPhotoInfo | null
}>()

function formatTime(value: string | null): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat(undefined, { timeStyle: 'short' }).format(date)
}

function formatAngle(value: number | null): string {
  if (value === null) return '—'
  return `${value.toFixed(1)}°`
}

function formatCore(value: boolean | null): string {
  if (value === null) return '—'
  return value ? 'Có' : 'Không'
}

function formatSettings(settings: CameraSettings): string {
  return [
    `ISO ${settings.iso.min}–${settings.iso.max}`,
    settings.aperture,
    settings.exposureTime,
    `${settings.focalLengthMm.min}–${settings.focalLengthMm.max}mm`
  ].join(' · ')
}
</script>

<template>
  <SkyCard>
    <SectionTitle
      title="Ngân Hà"
      subtitle="Khả năng thấy, hướng, thời điểm tốt và gợi ý ống kính."
    />

    <dl
      v-if="info"
      class="grid grid-cols-2 gap-3 sm:grid-cols-3"
    >
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Visibility
        </dt>
        <dd class="mt-1 text-sm text-slate-100">
          {{ info.visibility }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Hướng
        </dt>
        <dd class="mt-1 text-sm text-sky-300">
          {{ info.direction ?? '—' }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Cao độ
        </dt>
        <dd class="mt-1 font-mono text-sm text-slate-100">
          {{ formatAngle(info.altitudeDeg) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Thời điểm tốt
        </dt>
        <dd class="mt-1 text-sm text-slate-100">
          {{ formatTime(info.bestTime) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Lõi (core)
        </dt>
        <dd class="mt-1 text-sm text-slate-100">
          {{ formatCore(info.coreVisible) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Ống kính
        </dt>
        <dd class="mt-1 text-sm text-slate-100">
          {{ info.recommendedLensLabel }}
        </dd>
      </div>
      <div class="col-span-2 rounded-xl bg-slate-950/70 p-4 sm:col-span-3">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Cài đặt gợi ý
        </dt>
        <dd class="mt-1 text-sm leading-6 text-slate-100">
          {{ formatSettings(info.settings) }}
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
