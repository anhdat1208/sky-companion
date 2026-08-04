<script setup lang="ts">
import SkyAIExplainPanel from '../../components/ai/SkyAIExplainPanel.vue'

const { t } = useI18n()

useHead({ title: () => t('pages.ai.constellation.title') })
const route = useRoute()

const name = computed(() => {
  const raw = Array.isArray(route.query.name) ? route.query.name[0] : route.query.name
  return typeof raw === 'string' && raw.trim()
    ? raw.trim()
    : t('pages.ai.constellation.defaultName')
})

const heading = computed(() => t('pages.ai.constellation.heading', { name: name.value }))
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
        {{ t('pages.ai.constellation.subtitle') }}
      </p>
    </header>
    <SkyAIExplainPanel
      object-type="constellation"
      :name="name"
    />
  </div>
</template>
