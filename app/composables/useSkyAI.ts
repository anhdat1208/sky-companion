import type { Ref } from 'vue'
import type { SkyAIExplainRequest, SkyAIExplainResponse } from '../../types/ai'
import { localeToSkyAILanguage } from '../../lib/i18n/aiLanguage'

type SkyAIRequestContext = Omit<SkyAIExplainRequest, 'language' | 'question'>

export function useSkyAI(context: Ref<SkyAIRequestContext | null>) {
  const { t, locale } = useI18n()
  const loading = ref(false)
  const error = ref<string | null>(null)
  const response = ref<SkyAIExplainResponse | null>(null)
  const lastQuestion = ref<string | null>(null)

  async function explain(question?: string): Promise<void> {
    const value = context.value
    if (!value) {
      error.value = t('errors.ai.missingAstronomyData')
      return
    }

    loading.value = true
    error.value = null
    lastQuestion.value = question ?? null

    try {
      response.value = await $fetch<SkyAIExplainResponse>('/api/ai/explain', {
        method: 'POST',
        body: {
          ...value,
          language: localeToSkyAILanguage(locale.value),
          question
        } satisfies SkyAIExplainRequest
      })
    } catch (caught) {
      error.value = t('errors.ai.explainFailed')
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    response,
    lastQuestion,
    explain
  }
}
