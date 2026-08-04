<script setup lang="ts">
import SkyAIExplainPanel from '../../components/ai/SkyAIExplainPanel.vue'

const { t } = useI18n()

useHead({ title: () => t('pages.ai.deepSkyObject.title') })
const route = useRoute()

function parseNum(value: unknown): number | undefined {
  const asText = Array.isArray(value) ? value[0] : value
  const parsed = Number(asText)
  return Number.isFinite(parsed) ? parsed : undefined
}

const name = computed(() => {
  const raw = Array.isArray(route.query.name) ? route.query.name[0] : route.query.name
  return typeof raw === 'string' && raw.trim()
    ? raw.trim()
    : t('pages.ai.deepSkyObject.defaultName')
})

const heading = computed(() => t('pages.ai.deepSkyObject.heading', { name: name.value }))

const altitude = computed(() => parseNum(route.query.altitude))
const azimuth = computed(() => parseNum(route.query.azimuth))
</script>

<template>
  <div class="space-y-6">
    <header class="space-y-3">
      <p class="text-sm font-medium uppercase tracking-[0.2em] text-violet-300/80">
        {{ t('pages.ai.brand') }}
      </p>
      <h1 class="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        {{ heading }}
      </h1>
      <p class="max-w-2xl text-base leading-7 text-slate-400">
        {{ t('pages.ai.deepSkyObject.subtitle') }}
      </p>
    </header>
    <SkyAIExplainPanel
      object-type="deep-sky-object"
      :name="name"
      :altitude="altitude"
      :azimuth="azimuth"
    />
  </div>
</template>
