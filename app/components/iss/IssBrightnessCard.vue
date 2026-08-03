<script setup lang="ts">
import type { BrightnessLabel, IssBrightness } from '../../../types/iss'

defineProps<{
  brightness: IssBrightness | null
}>()

const LABEL_VI: Record<BrightnessLabel, string> = {
  Bright: 'Sáng',
  Moderate: 'Trung bình',
  Dim: 'Mờ',
  'Not Visible': 'Không nhìn thấy'
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
      title="Độ sáng"
      subtitle="Ước tính độ sáng ISS từ vị trí quan sát hiện tại."
    />

    <dl
      v-if="brightness"
      class="grid grid-cols-2 gap-3"
    >
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Cấp sao
        </dt>
        <dd class="mt-1 font-mono text-base text-slate-100">
          {{ formatMagnitude(brightness.magnitude) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Nhãn
        </dt>
        <dd class="mt-1 text-base text-slate-100">
          {{ LABEL_VI[brightness.label] }}
        </dd>
      </div>
    </dl>

    <p
      v-else
      class="rounded-xl bg-slate-950/70 p-4 text-sm leading-6 text-slate-400"
    >
      Cần vị trí quan sát để ước tính độ sáng.
    </p>
  </SkyCard>
</template>
