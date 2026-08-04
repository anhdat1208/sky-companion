<script setup lang="ts">
import type { Direction } from '../../../types/astronomy'
import type {
  Difficulty,
  ObjectType,
  RankedTarget,
  RecommendedInstrument
} from '../../../types/telescope'

defineProps<{
  targets: RankedTarget[]
  selectedId: string | null
}>()

const emit = defineEmits<{
  select: [id: string]
}>()

const { t } = useI18n()
const { formatDateTime } = useFormatters()

function objectTypeLabel(type: ObjectType): string {
  return t(`components.telescope.objectTypes.${type}`)
}

function difficultyLabel(level: Difficulty): string {
  return t(`components.telescope.difficulty.${level}`)
}

function instrumentLabel(instrument: RecommendedInstrument): string {
  return t(`components.telescope.instrument.${instrument}`)
}

function visibilityScoreAriaLabel(score: number): string {
  return t('components.telescope.tonightTargetsList.visibilityScoreAriaLabel', { score })
}

function formatAngle(value: number): string {
  return `${value.toFixed(1)}°`
}

function formatTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return formatDateTime(date)
}

function formatDirection(direction: Direction): string {
  return t(`components.telescope.directions.${direction}`)
}

function scoreDots(score: number): string {
  return '●'.repeat(score) + '○'.repeat(5 - score)
}
</script>

<template>
  <SkyCard>
    <SectionTitle
      :title="t('components.telescope.tonightTargetsList.title')"
      :subtitle="t('components.telescope.tonightTargetsList.subtitle')"
    />

    <ul
      v-if="targets.length > 0"
      class="space-y-3"
    >
      <li
        v-for="ranked in targets"
        :key="ranked.target.id"
      >
        <button
          type="button"
          class="w-full rounded-xl border p-4 text-left transition"
          :class="ranked.target.id === selectedId
            ? 'border-sky-500/60 bg-sky-500/10'
            : 'border-transparent bg-slate-950/70 hover:border-slate-700'"
          @click="emit('select', ranked.target.id)"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="font-medium text-slate-100">
                {{ ranked.target.name }}
              </p>
              <p class="mt-1 text-xs text-slate-400">
                {{ objectTypeLabel(ranked.target.objectType) }}
              </p>
            </div>
            <span
              class="shrink-0 rounded-lg px-2.5 py-1 font-mono text-xs tracking-wider"
              :class="ranked.visibilityScore >= 4
                ? 'bg-emerald-500/15 text-emerald-300'
                : ranked.visibilityScore >= 2
                  ? 'bg-sky-500/15 text-sky-300'
                  : 'bg-slate-700/50 text-slate-300'"
              :aria-label="visibilityScoreAriaLabel(ranked.visibilityScore)"
            >
              {{ scoreDots(ranked.visibilityScore) }}
            </span>
          </div>

          <dl class="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
                {{ t('components.skyLabels.altitude') }}
              </dt>
              <dd class="mt-1 font-mono text-sm text-slate-200">
                {{ formatAngle(ranked.altitude) }}
              </dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
                {{ t('components.skyLabels.azimuth') }}
              </dt>
              <dd class="mt-1 font-mono text-sm text-slate-200">
                {{ formatAngle(ranked.azimuth) }}
              </dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
                {{ t('components.telescope.targetDetailCard.direction') }}
              </dt>
              <dd class="mt-1 text-sm text-slate-200">
                {{ formatDirection(ranked.direction) }}
              </dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
                {{ t('components.telescope.tonightTargetsList.bestTime') }}
              </dt>
              <dd class="mt-1 text-sm text-slate-200">
                {{ formatTime(ranked.bestObservationTime) }}
              </dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
                {{ t('components.telescope.tonightTargetsList.difficulty') }}
              </dt>
              <dd class="mt-1 text-sm text-slate-200">
                {{ difficultyLabel(ranked.difficulty) }}
              </dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
                {{ t('components.telescope.tonightTargetsList.instrument') }}
              </dt>
              <dd class="mt-1 text-sm text-slate-200">
                {{ instrumentLabel(ranked.recommendedInstrument) }}
              </dd>
            </div>
          </dl>
        </button>
      </li>
    </ul>

    <p
      v-else
      class="rounded-xl bg-slate-950/70 p-4 text-sm leading-6 text-slate-400"
    >
      {{ t('components.telescope.tonightTargetsList.empty') }}
    </p>
  </SkyCard>
</template>
