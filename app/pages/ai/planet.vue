<script setup lang="ts">
import SkyAIExplainPanel from '../../components/ai/SkyAIExplainPanel.vue'

useHead({ title: 'Sky AI · Planet' })
const route = useRoute()

function parseNum(value: unknown): number | undefined {
  const asText = Array.isArray(value) ? value[0] : value
  const parsed = Number(asText)
  return Number.isFinite(parsed) ? parsed : undefined
}

const name = computed(() => {
  const raw = Array.isArray(route.query.name) ? route.query.name[0] : route.query.name
  return typeof raw === 'string' && raw.trim() ? raw.trim() : 'Planet'
})
const altitude = computed(() => parseNum(route.query.altitude))
const azimuth = computed(() => parseNum(route.query.azimuth))
const visible = computed(() => {
  const raw = Array.isArray(route.query.visible) ? route.query.visible[0] : route.query.visible
  return raw === 'true' ? true : raw === 'false' ? false : undefined
})
</script>

<template>
  <div class="space-y-6">
    <header class="space-y-3">
      <p class="text-sm font-medium uppercase tracking-[0.2em] text-violet-300/80">Sky AI</p>
      <h1 class="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{{ name }} Explanation</h1>
      <p class="max-w-2xl text-base leading-7 text-slate-400">
        Giải thích dành riêng cho hành tinh bạn đang quan sát.
      </p>
    </header>
    <SkyAIExplainPanel
      object-type="planet"
      :name="name"
      :altitude="altitude"
      :azimuth="azimuth"
      :visible="visible"
      language="en"
    />
  </div>
</template>
