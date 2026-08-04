<script setup lang="ts">
import SkyAIExplainPanel from '../../components/ai/SkyAIExplainPanel.vue'

useHead({ title: 'Sky AI · Sun' })
const route = useRoute()

function parseNum(value: unknown): number | undefined {
  const asText = Array.isArray(value) ? value[0] : value
  const parsed = Number(asText)
  return Number.isFinite(parsed) ? parsed : undefined
}

const altitude = computed(() => parseNum(route.query.altitude))
const azimuth = computed(() => parseNum(route.query.azimuth))
</script>

<template>
  <div class="space-y-6">
    <header class="space-y-3">
      <p class="text-sm font-medium uppercase tracking-[0.2em] text-violet-300/80">Sky AI</p>
      <h1 class="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Sun Explanation</h1>
      <p class="max-w-2xl text-base leading-7 text-slate-400">
        Giải thích bối cảnh quan sát Mặt Trời từ vị trí hiện tại.
      </p>
    </header>
    <SkyAIExplainPanel
      object-type="sun"
      name="Sun"
      :altitude="altitude"
      :azimuth="azimuth"
    />
  </div>
</template>
