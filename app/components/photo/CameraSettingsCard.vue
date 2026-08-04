<script setup lang="ts">
import type { CameraSettings } from '../../../types/photo'

defineProps<{
  settings: CameraSettings | null
  subjectLabel?: string
}>()

function formatYesNo(value: boolean): string {
  return value ? 'Có' : 'Không'
}
</script>

<template>
  <SkyCard>
    <SectionTitle
      :title="subjectLabel ? `Cài đặt · ${subjectLabel}` : 'Cài đặt máy ảnh'"
      subtitle="ISO, khẩu độ, phơi sáng, tiêu cự, chân máy và remote."
    />

    <dl
      v-if="settings"
      class="grid grid-cols-2 gap-3 sm:grid-cols-3"
    >
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          ISO
        </dt>
        <dd class="mt-1 font-mono text-sm text-slate-100">
          {{ settings.iso.min }}–{{ settings.iso.max }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Khẩu độ
        </dt>
        <dd class="mt-1 text-sm text-slate-100">
          {{ settings.aperture }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Phơi sáng
        </dt>
        <dd class="mt-1 text-sm text-slate-100">
          {{ settings.exposureTime }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Tiêu cự
        </dt>
        <dd class="mt-1 font-mono text-sm text-slate-100">
          {{ settings.focalLengthMm.min }}–{{ settings.focalLengthMm.max }}mm
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Chân máy
        </dt>
        <dd class="mt-1 text-sm text-slate-100">
          {{ formatYesNo(settings.tripodRequired) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Remote
        </dt>
        <dd class="mt-1 text-sm text-slate-100">
          {{ formatYesNo(settings.remoteShutter) }}
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
