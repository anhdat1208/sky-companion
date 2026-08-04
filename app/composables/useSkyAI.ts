import type { Ref } from 'vue'
import type { SkyAIExplainRequest, SkyAIExplainResponse, SkyAILanguage } from '../../types/ai'

type SkyAIRequestContext = Omit<SkyAIExplainRequest, 'language' | 'question'>

export function useSkyAI(
  context: Ref<SkyAIRequestContext | null>,
  language: Ref<SkyAILanguage>
) {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const response = ref<SkyAIExplainResponse | null>(null)
  const lastQuestion = ref<string | null>(null)

  async function explain(question?: string): Promise<void> {
    const value = context.value
    if (!value) {
      error.value = 'Thiếu dữ liệu thiên văn để giải thích.'
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
          language: language.value,
          question
        } satisfies SkyAIExplainRequest
      })
    } catch (caught) {
      if (typeof caught === 'object' && caught !== null) {
        const maybe = caught as { data?: { message?: string }; statusMessage?: string; message?: string }
        error.value = maybe.data?.message ?? maybe.statusMessage ?? maybe.message ?? 'Không thể tạo phần giải thích AI.'
      } else {
        error.value = 'Không thể tạo phần giải thích AI.'
      }
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
