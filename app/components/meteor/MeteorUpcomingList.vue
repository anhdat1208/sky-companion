<script setup lang="ts">
import type {
  MeteorDifficulty,
  MeteorShowerId,
  MeteorUpcomingCard,
  MoonInterference,
  VisibilityScoreLabel
} from '../../../types/meteor'

defineProps<{
  cards: MeteorUpcomingCard[]
  selectedId: MeteorShowerId | null
  selectedYear: number | null
}>()

const emit = defineEmits<{
  select: [id: MeteorShowerId, year: number]
}>()

const { t } = useI18n()

function peakYear(peakAt: string): number {
  return new Date(peakAt).getUTCFullYear()
}

function difficultyLabel(value: MeteorDifficulty): string {
  return t(`components.meteor.difficulty.${value}`)
}

function moonInterferenceLabel(value: MoonInterference): string {
  return t(`components.meteor.moonInterference.${value}`)
}

function scoreLabel(value: VisibilityScoreLabel): string {
  return t(`components.meteor.scoreLabels.${value}`)
}

function scoreAriaLabel(label: VisibilityScoreLabel, stars: number): string {
  return t('components.meteor.upcomingList.scoreAriaLabel', {
    label: scoreLabel(label),
    stars
  })
}

function scoreDots(stars: number): string {
  return '●'.repeat(stars) + '○'.repeat(5 - stars)
}
</script>

<template>
  <SkyCard>
    <SectionTitle
      :title="t('components.meteor.upcomingList.title')"
      :subtitle="t('components.meteor.upcomingList.subtitle')"
    />

    <ul
      v-if="cards.length"
      class="space-y-3"
    >
      <li
        v-for="card in cards"
        :key="card.id"
      >
        <button
          type="button"
          class="w-full rounded-xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-sky-500/40"
          :class="card.id === selectedId && peakYear(card.peakAt) === selectedYear
            ? 'border-sky-500/60 bg-sky-500/10'
            : 'border-transparent bg-slate-950/70 hover:border-slate-700'"
          :aria-pressed="card.id === selectedId && peakYear(card.peakAt) === selectedYear"
          @click="emit('select', card.id, peakYear(card.peakAt))"
        >
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p class="text-base font-medium text-slate-100">
                {{ card.name }}
              </p>
              <p class="mt-1 text-sm text-slate-400">
                {{ card.activePeriodLabel }}
              </p>
            </div>
            <span
              v-if="card.visibilityScore"
              class="shrink-0 rounded-lg px-2.5 py-1 font-mono text-xs tracking-wider"
              :class="card.visibilityScore.stars >= 4
                ? 'bg-emerald-500/15 text-emerald-300'
                : card.visibilityScore.stars >= 2
                  ? 'bg-sky-500/15 text-sky-300'
                  : 'bg-slate-700/50 text-slate-300'"
              :aria-label="scoreAriaLabel(card.visibilityScore.label, card.visibilityScore.stars)"
            >
              {{ scoreDots(card.visibilityScore.stars) }}
            </span>
            <span
              v-else
              class="shrink-0 rounded-lg bg-slate-700/50 px-2.5 py-1 text-xs text-slate-400"
            >
              {{ t('components.meteor.upcomingList.notScored') }}
            </span>
          </div>

          <dl class="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
                {{ t('components.meteor.upcomingList.peak') }}
              </dt>
              <dd class="mt-1 text-sm text-slate-200">
                {{ card.peakDateLabel }}
                <span class="text-slate-400">· {{ card.peakTimeLabel }}</span>
              </dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
                {{ t('components.meteor.upcomingList.estimatedZhr') }}
              </dt>
              <dd class="mt-1 font-mono text-sm text-slate-200">
                {{ card.expectedMeteorsPerHour }}{{ t('components.meteor.upcomingList.perHour') }}
              </dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
                {{ t('components.meteor.upcomingList.moonInterference') }}
              </dt>
              <dd class="mt-1 text-sm text-slate-200">
                {{ moonInterferenceLabel(card.moonInterference) }}
                <span class="font-mono text-slate-400">
                  ({{ card.moonIlluminationPct.toFixed(0) }}%)
                </span>
              </dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
                {{ t('components.meteor.upcomingList.difficulty') }}
              </dt>
              <dd class="mt-1 text-sm text-slate-200">
                {{ difficultyLabel(card.difficulty) }}
              </dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
                {{ t('components.meteor.upcomingList.bestTime') }}
              </dt>
              <dd class="mt-1 text-sm text-slate-200">
                {{ card.bestObservationTimeLabel }}
              </dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
                {{ t('components.meteor.upcomingList.bestDirection') }}
              </dt>
              <dd class="mt-1 text-sm text-slate-200">
                {{ card.bestDirection ?? t('components.meteor.upcomingList.locationRequired') }}
              </dd>
            </div>
          </dl>
        </button>
      </li>
    </ul>

    <p
      v-else
      class="rounded-xl bg-slate-950/70 p-4 text-sm text-slate-400"
    >
      {{ t('components.meteor.upcomingList.empty') }}
    </p>
  </SkyCard>
</template>
