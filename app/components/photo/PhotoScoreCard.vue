<script setup lang="ts">
import type {
  PhotographyScore,
  PhotographyScoreLabel
} from '../../../types/photo'

defineProps<{
  score: PhotographyScore | null
}>()

const { t } = useI18n()

function formatLabel(value: PhotographyScoreLabel): string {
  return t(`components.photo.scoreLabels.${value}`)
}

function starsAriaLabel(stars: number): string {
  return t('components.photo.photoScoreCard.starsAriaLabel', { stars })
}
</script>

<template>
  <SkyCard>
    <SectionTitle
      :title="t('components.photo.photoScoreCard.title')"
      :subtitle="t('components.photo.photoScoreCard.subtitle')"
    />

    <div
      v-if="score"
      class="rounded-xl bg-slate-950/70 p-4"
    >
      <div class="flex flex-wrap items-baseline gap-3">
        <p
          class="font-mono text-2xl tracking-widest text-amber-200"
          :aria-label="starsAriaLabel(score.stars)"
        >
          <span
            v-for="n in 5"
            :key="n"
            :class="n <= score.stars ? 'text-amber-200' : 'text-slate-600'"
          >★</span>
        </p>
        <p class="text-base text-slate-100">
          {{ formatLabel(score.label) }}
        </p>
      </div>

      <ul
        v-if="score.reasons.length"
        class="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-6 text-slate-400"
      >
        <li
          v-for="(reason, index) in score.reasons"
          :key="index"
        >
          {{ reason }}
        </li>
      </ul>
    </div>

    <p
      v-else
      class="rounded-xl bg-slate-950/70 p-4 text-sm leading-6 text-slate-400"
    >
      {{ t('components.photo.locationRequiredForScore') }}
    </p>
  </SkyCard>
</template>
