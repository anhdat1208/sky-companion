<script setup lang="ts">
import type { PlanetPhotoInfo } from '../../../types/photo'

defineProps<{
  planets: PlanetPhotoInfo[] | null
}>()

const BRIGHTNESS_VI: Record<PlanetPhotoInfo['brightness'], string> = {
  faint: 'Mờ',
  moderate: 'Vừa',
  bright: 'Sáng',
  'very-bright': 'Rất sáng'
}

function formatAngle(value: number): string {
  return `${value.toFixed(1)}°`
}
</script>

<template>
  <SkyCard>
    <SectionTitle
      title="Hành tinh"
      subtitle="Cao độ, độ sáng và độ phóng đại gợi ý."
    />

    <ul
      v-if="planets && planets.length"
      class="space-y-3"
    >
      <li
        v-for="planet in planets"
        :key="planet.name"
        class="rounded-xl bg-slate-950/70 p-4"
      >
        <div class="flex flex-wrap items-baseline justify-between gap-2">
          <p class="text-sm font-medium text-slate-100">
            {{ planet.name }}
          </p>
          <span
            class="text-xs font-medium uppercase tracking-wider"
            :class="planet.isVisible ? 'text-sky-300' : 'text-slate-500'"
          >
            {{ planet.isVisible ? 'Thấy được' : 'Không thấy' }}
          </span>
        </div>

        <dl class="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div>
            <dt class="text-xs text-slate-500">
              Cao độ
            </dt>
            <dd class="mt-0.5 font-mono text-sm text-slate-100">
              {{ formatAngle(planet.altitudeDeg) }}
            </dd>
          </div>
          <div>
            <dt class="text-xs text-slate-500">
              Độ sáng
            </dt>
            <dd class="mt-0.5 text-sm text-slate-100">
              {{ BRIGHTNESS_VI[planet.brightness] }}
            </dd>
          </div>
          <div class="col-span-2 sm:col-span-1">
            <dt class="text-xs text-slate-500">
              Phóng đại
            </dt>
            <dd class="mt-0.5 text-sm text-slate-100">
              {{ planet.recommendedMagnification }}
            </dd>
          </div>
        </dl>
      </li>
    </ul>

    <p
      v-else-if="planets"
      class="rounded-xl bg-slate-950/70 p-4 text-sm leading-6 text-slate-400"
    >
      Không có hành tinh trong danh sách.
    </p>

    <p
      v-else
      class="rounded-xl bg-slate-950/70 p-4 text-sm leading-6 text-slate-400"
    >
      Cần vị trí
    </p>
  </SkyCard>
</template>
