<script setup lang="ts">
import { marked } from 'marked'
import type { SkyAIExplainResponse } from '../../../types/ai'

const props = defineProps<{
  response: SkyAIExplainResponse
}>()

const renderedSections = computed(() =>
  props.response.sections.map((section) => ({
    ...section,
    html: marked.parse(section.markdown, { async: false })
  }))
)
</script>

<template>
  <SkyCard class="space-y-5">
    <SectionTitle
      :title="response.title"
      subtitle="Nội dung do AI tạo dựa trên dữ liệu thiên văn hiện tại."
    />

    <article
      v-for="section in renderedSections"
      :key="section.title"
      class="rounded-2xl border border-slate-800 bg-slate-950/60 p-4"
    >
      <h3 class="text-xl font-semibold text-slate-100">
        {{ section.title }}
      </h3>
      <div
        class="prose prose-invert mt-3 max-w-none prose-headings:text-slate-100 prose-p:text-slate-200 prose-strong:text-white prose-li:text-slate-200"
        v-html="section.html"
      />
    </article>
  </SkyCard>
</template>
