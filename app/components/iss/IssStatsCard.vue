<script setup lang="ts">
import type { IssPosition } from '../../../types/iss'

defineProps<{
  position: IssPosition
}>()

function formatAltitude(km: number): string {
  return `${km.toFixed(1)} km`
}

function formatSpeed(kph: number): string {
  return `${Math.round(kph).toLocaleString()} km/h`
}
</script>

<template>
  <SkyCard>
    <SectionTitle
      title="Độ cao & tốc độ"
      subtitle="Độ cao quỹ đạo và vận tốc mặt đất ước tính."
    />

    <dl class="grid grid-cols-2 gap-3">
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Độ cao
        </dt>
        <dd class="mt-1 font-mono text-base text-slate-100">
          {{ formatAltitude(position.altitudeKm) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Tốc độ
        </dt>
        <dd class="mt-1 font-mono text-base text-slate-100">
          {{ formatSpeed(position.velocityKph) }}
        </dd>
      </div>
    </dl>
  </SkyCard>
</template>
