<script setup lang="ts">
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

const objectTypeLabels: Record<ObjectType, string> = {
  moon: 'Mặt Trăng',
  planet: 'Hành tinh',
  galaxy: 'Thiên hà',
  nebula: 'Tinh vân',
  starCluster: 'Cụm sao',
  star: 'Sao',
  other: 'Khác'
}

const difficultyLabels: Record<Difficulty, string> = {
  easy: 'Dễ',
  moderate: 'Trung bình',
  hard: 'Khó'
}

const instrumentLabels: Record<RecommendedInstrument, string> = {
  eye: 'Mắt thường',
  binocular: 'Ống nhòm',
  telescope: 'Kính thiên văn'
}

function formatAngle(value: number): string {
  return `${value.toFixed(1)}°`
}

function formatTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date)
}

function scoreDots(score: number): string {
  return '●'.repeat(score) + '○'.repeat(5 - score)
}
</script>

<template>
  <SkyCard>
    <SectionTitle
      title="Mục tiêu tốt nhất đêm nay"
      subtitle="Danh sách xếp hạng theo độ cao, độ sáng và cấu hình kính."
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
                {{ objectTypeLabels[ranked.target.objectType] }}
              </p>
            </div>
            <span
              class="shrink-0 rounded-lg px-2.5 py-1 font-mono text-xs tracking-wider"
              :class="ranked.visibilityScore >= 4
                ? 'bg-emerald-500/15 text-emerald-300'
                : ranked.visibilityScore >= 2
                  ? 'bg-sky-500/15 text-sky-300'
                  : 'bg-slate-700/50 text-slate-300'"
              :aria-label="`Điểm nhìn thấy ${ranked.visibilityScore} trên 5`"
            >
              {{ scoreDots(ranked.visibilityScore) }}
            </span>
          </div>

          <dl class="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
                Cao độ
              </dt>
              <dd class="mt-1 font-mono text-sm text-slate-200">
                {{ formatAngle(ranked.altitude) }}
              </dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
                Phương vị
              </dt>
              <dd class="mt-1 font-mono text-sm text-slate-200">
                {{ formatAngle(ranked.azimuth) }}
              </dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
                Hướng
              </dt>
              <dd class="mt-1 text-sm text-slate-200">
                {{ ranked.direction }}
              </dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
                Thời điểm tốt
              </dt>
              <dd class="mt-1 text-sm text-slate-200">
                {{ formatTime(ranked.bestObservationTime) }}
              </dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
                Độ khó
              </dt>
              <dd class="mt-1 text-sm text-slate-200">
                {{ difficultyLabels[ranked.difficulty] }}
              </dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
                Dụng cụ
              </dt>
              <dd class="mt-1 text-sm text-slate-200">
                {{ instrumentLabels[ranked.recommendedInstrument] }}
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
      Chưa có mục tiêu nào cho vị trí và thời điểm hiện tại.
    </p>
  </SkyCard>
</template>
