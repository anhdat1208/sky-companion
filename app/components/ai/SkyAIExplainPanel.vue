<script setup lang="ts">
import type { SkyAIObjectType } from '../../../types/ai'
import SkyAIExplainButton from './SkyAIExplainButton.vue'
import SkyAIResponseCard from './SkyAIResponseCard.vue'

const props = defineProps<{
  objectType: SkyAIObjectType
  name: string
  altitude?: number
  azimuth?: number
  visible?: boolean
  distanceKm?: number
  context?: Record<string, string | number | boolean | null>
}>()

const { t } = useI18n()

const requestContext = computed(() => ({
  objectType: props.objectType,
  name: props.name,
  altitude: props.altitude,
  azimuth: props.azimuth,
  visible: props.visible,
  distanceKm: props.distanceKm,
  context: props.context
}))

const {
  loading,
  error,
  response,
  explain
} = useSkyAI(requestContext)
</script>

<template>
  <div class="space-y-4">
    <SkyAIExplainButton
      :loading="loading"
      @click="explain()"
    />

    <SkyCard
      v-if="loading"
      role="status"
      class="space-y-3"
    >
      <SectionTitle
        :title="t('components.skyAI.analyzingTitle')"
        :subtitle="t('components.skyAI.analyzingSubtitle')"
      />
      <div class="h-3 w-11/12 animate-pulse rounded-full bg-slate-800" />
      <div class="h-3 w-9/12 animate-pulse rounded-full bg-slate-800" />
      <div class="h-3 w-10/12 animate-pulse rounded-full bg-slate-800" />
    </SkyCard>

    <SkyCard
      v-else-if="error"
      role="alert"
    >
      <SectionTitle
        :title="t('components.skyAI.unavailableTitle')"
        :subtitle="error"
      />
      <p class="text-sm text-slate-400">
        {{ t('components.skyAI.unavailableHint') }}
      </p>
    </SkyCard>

    <SkyAIResponseCard
      v-else-if="response"
      :response="response"
    />

    <SkyCard
      v-if="response && response.suggestedQuestions.length > 0"
      class="space-y-3"
    >
      <SectionTitle
        :title="t('components.skyAI.suggestedQuestions')"
        :subtitle="t('components.skyAI.suggestedQuestionsSubtitle')"
      />
      <div class="flex flex-wrap gap-2">
        <button
          v-for="question in response.suggestedQuestions"
          :key="question"
          type="button"
          class="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 transition hover:border-slate-500 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
          :disabled="loading"
          @click="explain(question)"
        >
          {{ question }}
        </button>
      </div>
    </SkyCard>
  </div>
</template>
