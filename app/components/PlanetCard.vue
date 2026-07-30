<script setup lang="ts">
import type { PlanetInfo } from '../../types/astronomy'

const props = defineProps<{
  planets: PlanetInfo[]
}>()

const visiblePlanets = computed(() => props.planets.filter(planet => planet.isVisible))

function formatAngle(value: number): string {
  return `${value.toFixed(1)}°`
}
</script>

<template>
  <SkyCard>
    <SectionTitle
      title="Các hành tinh nhìn thấy"
      subtitle="Những hành tinh đang trên bầu trời tại vị trí của bạn."
    />

    <ul
      v-if="visiblePlanets.length > 0"
      class="space-y-3"
    >
      <li
        v-for="planet in visiblePlanets"
        :key="planet.name"
        class="rounded-xl bg-slate-950/70 p-4"
      >
        <div class="flex items-start justify-between gap-3">
          <p class="font-medium text-slate-100">
            {{ planet.name }}
          </p>
          <span class="shrink-0 rounded-lg bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-300">
            Visible
          </span>
        </div>
        <dl class="mt-3 grid grid-cols-2 gap-3">
          <div>
            <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
              Cao độ
            </dt>
            <dd class="mt-1 font-mono text-sm text-slate-200">
              {{ formatAngle(planet.altitude) }}
            </dd>
          </div>
          <div>
            <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
              Phương vị
            </dt>
            <dd class="mt-1 font-mono text-sm text-slate-200">
              {{ formatAngle(planet.azimuth) }}
            </dd>
          </div>
        </dl>
      </li>
    </ul>

    <p
      v-else
      class="rounded-xl bg-slate-950/70 p-4 text-sm leading-6 text-slate-400"
    >
      Không có hành tinh nào đang nhìn thấy trên bầu trời lúc này.
    </p>
  </SkyCard>
</template>
