<script setup lang="ts">
const props = defineProps<{
  moonAzimuth: number
  planetAzimuth: number | null
  planetName?: string | null
}>()

function normalizeAzimuth(azimuth: number): number {
  const normalized = azimuth % 360
  return normalized < 0 ? normalized + 360 : normalized
}

function markerStyle(azimuth: number): Record<string, string> {
  return {
    transform: `rotate(${normalizeAzimuth(azimuth)}deg)`
  }
}

const moonLabel = computed(() => `Moon ${normalizeAzimuth(props.moonAzimuth).toFixed(1)}°`)
const planetLabel = computed(() => {
  if (props.planetAzimuth === null) {
    return null
  }

  const name = props.planetName?.trim() || 'Planet'
  return `${name} ${normalizeAzimuth(props.planetAzimuth).toFixed(1)}°`
})
</script>

<template>
  <div class="mx-auto w-full max-w-md">
    <div
      class="relative mx-auto aspect-square w-full max-w-sm"
      role="img"
      :aria-label="`Static compass. ${moonLabel}${planetLabel ? `. ${planetLabel}` : ''}`"
    >
      <div class="absolute inset-0 rounded-full border border-slate-700 bg-gradient-to-b from-slate-900 to-slate-950 shadow-inner shadow-slate-950/80" />
      <div class="absolute inset-[12%] rounded-full border border-dashed border-slate-700/80" />
      <div class="absolute inset-[28%] rounded-full border border-slate-800 bg-slate-950/70" />

      <span class="absolute left-1/2 top-3 -translate-x-1/2 text-sm font-semibold tracking-[0.25em] text-sky-300">
        N
      </span>
      <span class="absolute bottom-3 left-1/2 -translate-x-1/2 text-sm font-semibold tracking-[0.25em] text-slate-400">
        S
      </span>
      <span class="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold tracking-[0.25em] text-slate-400">
        E
      </span>
      <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold tracking-[0.25em] text-slate-400">
        W
      </span>

      <div
        class="pointer-events-none absolute inset-0 flex justify-center"
        :style="markerStyle(moonAzimuth)"
      >
        <div class="mt-8 flex flex-col items-center">
          <span class="h-3 w-3 rounded-full bg-amber-300 shadow-[0_0_12px_rgba(252,211,77,0.7)]" />
          <span class="mt-1 rounded bg-slate-950/80 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-200">
            Moon
          </span>
        </div>
      </div>

      <div
        v-if="planetAzimuth !== null"
        class="pointer-events-none absolute inset-0 flex justify-center"
        :style="markerStyle(planetAzimuth)"
      >
        <div class="mt-8 flex flex-col items-center">
          <span class="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.7)]" />
          <span class="mt-1 max-w-[4.5rem] truncate rounded bg-slate-950/80 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-200">
            {{ planetName || 'Planet' }}
          </span>
        </div>
      </div>

      <div class="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-200" />
    </div>

    <ul class="mt-5 space-y-2 text-sm text-slate-300">
      <li class="flex items-center gap-2">
        <span class="h-2.5 w-2.5 rounded-full bg-amber-300" />
        <span>{{ moonLabel }}</span>
      </li>
      <li
        v-if="planetLabel"
        class="flex items-center gap-2"
      >
        <span class="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        <span>{{ planetLabel }}</span>
      </li>
      <li
        v-else
        class="text-slate-500"
      >
        Không có hành tinh nhìn thấy để đánh dấu trên la bàn.
      </li>
    </ul>
  </div>
</template>
