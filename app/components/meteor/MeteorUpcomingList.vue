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

function peakYear(peakAt: string): number {
  return new Date(peakAt).getUTCFullYear()
}

const DIFFICULTY_VI: Record<MeteorDifficulty, string> = {
  easy: 'Dễ',
  moderate: 'Trung bình',
  challenging: 'Khó'
}

const MOON_INTERFERENCE_VI: Record<MoonInterference, string> = {
  none: 'Không',
  low: 'Thấp',
  moderate: 'Trung bình',
  high: 'Cao',
  severe: 'Rất cao'
}

const SCORE_LABEL_VI: Record<VisibilityScoreLabel, string> = {
  Poor: 'Kém',
  Fair: 'Trung bình',
  Good: 'Tốt',
  Excellent: 'Xuất sắc'
}

function scoreDots(stars: number): string {
  return '●'.repeat(stars) + '○'.repeat(5 - stars)
}
</script>

<template>
  <SkyCard>
    <SectionTitle
      title="Mưa sao băng sắp tới"
      subtitle="Chọn một trận mưa để xem điểm quan sát và chi tiết."
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
              :aria-label="`${SCORE_LABEL_VI[card.visibilityScore.label]}, ${card.visibilityScore.stars} trên 5`"
            >
              {{ scoreDots(card.visibilityScore.stars) }}
            </span>
            <span
              v-else
              class="shrink-0 rounded-lg bg-slate-700/50 px-2.5 py-1 text-xs text-slate-400"
            >
              Chưa chấm điểm
            </span>
          </div>

          <dl class="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
                Đỉnh
              </dt>
              <dd class="mt-1 text-sm text-slate-200">
                {{ card.peakDateLabel }}
                <span class="text-slate-400">· {{ card.peakTimeLabel }}</span>
              </dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
                ZHR ước tính
              </dt>
              <dd class="mt-1 font-mono text-sm text-slate-200">
                {{ card.expectedMeteorsPerHour }}/giờ
              </dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
                Nhiễu trăng
              </dt>
              <dd class="mt-1 text-sm text-slate-200">
                {{ MOON_INTERFERENCE_VI[card.moonInterference] }}
                <span class="font-mono text-slate-400">
                  ({{ card.moonIlluminationPct.toFixed(0) }}%)
                </span>
              </dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
                Độ khó
              </dt>
              <dd class="mt-1 text-sm text-slate-200">
                {{ DIFFICULTY_VI[card.difficulty] }}
              </dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
                Thời điểm tốt
              </dt>
              <dd class="mt-1 text-sm text-slate-200">
                {{ card.bestObservationTimeLabel }}
              </dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
                Hướng tốt
              </dt>
              <dd class="mt-1 text-sm text-slate-200">
                {{ card.bestDirection ?? 'Cần vị trí' }}
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
      Chưa có mưa sao băng sắp tới trong danh sách.
    </p>
  </SkyCard>
</template>
