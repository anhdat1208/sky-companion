<script setup lang="ts">
import type { Coordinates } from '../../types/location'

interface CurrentLocationProps {
  coordinates: Coordinates
  label?: string
  sourceLabel?: string
}

withDefaults(defineProps<CurrentLocationProps>(), {
  label: 'Vị trí hiện tại',
  sourceLabel: 'Tọa độ được dùng để quan sát bầu trời.'
})
</script>

<template>
  <SkyCard>
    <SectionTitle
      :title="label"
      :subtitle="sourceLabel"
    />

    <dl class="grid grid-cols-2 gap-3">
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Vĩ độ
        </dt>
        <dd class="mt-1 font-mono text-base text-slate-100">
          {{ coordinates.lat.toFixed(4) }}°
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Kinh độ
        </dt>
        <dd class="mt-1 font-mono text-base text-slate-100">
          {{ coordinates.lng.toFixed(4) }}°
        </dd>
      </div>
    </dl>
  </SkyCard>
</template>
