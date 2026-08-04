<script setup lang="ts">
import SkyAIExplainPanel from '../../components/ai/SkyAIExplainPanel.vue'

useHead({ title: 'Sky AI · Constellation' })
const route = useRoute()

const name = computed(() => {
  const raw = Array.isArray(route.query.name) ? route.query.name[0] : route.query.name
  return typeof raw === 'string' && raw.trim() ? raw.trim() : 'Constellation'
})
</script>

<template>
  <div class="space-y-6">
    <header class="space-y-3">
      <p class="text-sm font-medium uppercase tracking-[0.2em] text-violet-300/80">Sky AI</p>
      <h1 class="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{{ name }} Explanation</h1>
      <p class="max-w-2xl text-base leading-7 text-slate-400">
        Giải thích chòm sao theo ngữ cảnh bầu trời hiện tại.
      </p>
    </header>
    <SkyAIExplainPanel
      object-type="constellation"
      :name="name"
      language="en"
    />
  </div>
</template>
