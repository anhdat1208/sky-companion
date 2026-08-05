<script setup lang="ts">
import type { EducationalCard } from '../../../types/journey'

const props = defineProps<{
  card: EducationalCard
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const { t, te } = useI18n()

function safe(key: string | undefined): string | null {
  if (!key || !te(key)) return null
  return t(key)
}

const facts = computed(() =>
  props.card.factsKeys
    .map((key) => safe(key))
    .filter((value): value is string => Boolean(value))
)
</script>

<template>
  <aside
    class="max-w-sm rounded-2xl border border-white/10 bg-slate-950/70 p-4 backdrop-blur-md transition sm:p-5"
    :class="open ? 'opacity-100' : 'opacity-90'"
  >
    <div class="flex items-start justify-between gap-3">
      <h3 class="text-lg font-medium text-white">
        {{ $t(card.titleKey) }}
      </h3>
      <button
        type="button"
        class="text-xs uppercase tracking-[0.16em] text-slate-400 hover:text-white"
        @click="emit('update:open', !open)"
      >
        {{ open ? $t('journey.card.collapse') : $t('journey.card.expand') }}
      </button>
    </div>

    <p class="mt-2 text-sm leading-relaxed text-slate-300">
      {{ $t(card.descriptionKey) }}
    </p>

    <div v-if="open" class="mt-4 space-y-3 text-sm text-slate-300">
      <ul v-if="facts.length" class="list-disc space-y-1 pl-4 text-slate-400">
        <li v-for="(fact, i) in facts" :key="i">{{ fact }}</li>
      </ul>
      <p v-if="safe(card.scaleKey)">
        <span class="text-slate-500">{{ $t('journey.card.scale') }}</span>
        {{ safe(card.scaleKey) }}
      </p>
      <p v-if="safe(card.distanceKey)">
        <span class="text-slate-500">{{ $t('journey.card.distance') }}</span>
        {{ safe(card.distanceKey) }}
      </p>
      <p v-if="safe(card.sizeComparisonKey)">
        <span class="text-slate-500">{{ $t('journey.card.size') }}</span>
        {{ safe(card.sizeComparisonKey) }}
      </p>
      <p v-if="safe(card.learnMoreKey)" class="border-t border-white/10 pt-3 text-slate-400">
        {{ safe(card.learnMoreKey) }}
      </p>
    </div>
  </aside>
</template>
