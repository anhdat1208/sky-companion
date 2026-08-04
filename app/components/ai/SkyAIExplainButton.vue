<script setup lang="ts">
defineProps<{
  loading: boolean
}>()

const { t } = useI18n()
</script>

<template>
  <button
    type="button"
    class="inline-flex items-center gap-2 rounded-2xl border border-violet-400/40 bg-violet-500/15 px-4 py-2.5 text-sm font-semibold text-violet-100 transition hover:border-violet-300/60 hover:bg-violet-500/20 focus:outline-none focus:ring-2 focus:ring-violet-400/40"
    :disabled="loading"
  >
    <span class="text-base">✨</span>
    <span>{{ loading ? t('components.skyAI.explainLoading') : t('components.skyAI.explain') }}</span>
  </button>
</template>
