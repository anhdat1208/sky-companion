<script setup lang="ts">
import type { PhotographyGuide } from '../../../types/moon'

defineProps<{
  guide: PhotographyGuide
}>()

const { t } = useI18n()

function yesNo(value: boolean): string {
  return value ? t('components.moon.yes') : t('components.moon.no')
}
</script>

<template>
  <SkyCard>
    <SectionTitle
      :title="t('components.moon.photographyGuide.title')"
      :subtitle="t('components.moon.photographyGuide.subtitle')"
    />

    <dl class="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          {{ t('components.moon.photographyGuide.landscape') }}
        </dt>
        <dd class="mt-1 text-base text-slate-100">
          {{ yesNo(guide.bestForLandscape) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          {{ t('components.moon.photographyGuide.craters') }}
        </dt>
        <dd class="mt-1 text-base text-slate-100">
          {{ yesNo(guide.bestForCraters) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          {{ t('components.moon.photographyGuide.moonrise') }}
        </dt>
        <dd class="mt-1 text-base text-slate-100">
          {{ yesNo(guide.bestForMoonrise) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4 sm:col-span-3">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          {{ t('components.moon.photographyGuide.recommendedFocalLength') }}
        </dt>
        <dd class="mt-1 font-mono text-base text-slate-100">
          {{ guide.recommendedFocalLengthMm.min }}–{{ guide.recommendedFocalLengthMm.max }} mm
        </dd>
      </div>
    </dl>

    <ul
      v-if="guide.notes.length"
      class="mt-3 list-disc space-y-1.5 rounded-xl bg-slate-950/70 p-4 pl-9 text-sm leading-6 text-slate-400"
    >
      <li
        v-for="(note, index) in guide.notes"
        :key="index"
      >
        {{ note }}
      </li>
    </ul>
  </SkyCard>
</template>
