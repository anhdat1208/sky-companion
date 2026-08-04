<script setup lang="ts">
const props = defineProps<{
  phaseAngleDeg: number
  label: string
  illuminatedPercentage: number
  iconKey?: string
}>()

const shadeOffset = computed(() => {
  const n = ((props.phaseAngleDeg % 360) + 360) % 360
  return ((n / 180) - 1) * 50
})
</script>

<template>
  <div
    class="relative mx-auto h-40 w-40 overflow-hidden rounded-full bg-slate-900 ring-1 ring-slate-600"
    role="img"
    :aria-label="label"
    :data-icon-key="iconKey"
  >
    <div class="absolute inset-0 rounded-full bg-amber-100" />
    <div
      class="absolute inset-0 rounded-full bg-slate-950/90"
      :style="{ transform: `translateX(${shadeOffset}%)` }"
    />
    <span class="sr-only">{{ illuminatedPercentage.toFixed(0) }}% illuminated</span>
  </div>
</template>
