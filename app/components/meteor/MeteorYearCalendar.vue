<script setup lang="ts">
import type {
  MeteorDifficulty,
  MeteorShowerEvent,
  MeteorShowerId
} from '../../../types/meteor'

defineProps<{
  year: number
  events: MeteorShowerEvent[]
  selectedId: MeteorShowerId | null
}>()

const emit = defineEmits<{
  prev: []
  next: []
  select: [id: MeteorShowerId]
}>()

const DIFFICULTY_VI: Record<MeteorDifficulty, string> = {
  easy: 'Dễ',
  moderate: 'Trung bình',
  challenging: 'Khó'
}

function formatPeakDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('vi-VN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date)
}

function formatActiveRange(start: string, end: string): string {
  const startDate = new Date(start)
  const endDate = new Date(end)
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return `${start} – ${end}`
  }
  const fmt = new Intl.DateTimeFormat('vi-VN', {
    day: 'numeric',
    month: 'short'
  })
  return `${fmt.format(startDate)} – ${fmt.format(endDate)}`
}
</script>

<template>
  <SkyCard>
    <SectionTitle
      title="Lịch trong năm"
      subtitle="Tám trận mưa sao băng chính theo năm đang xem."
    />

    <div class="mb-4 flex items-center justify-between gap-3">
      <button
        type="button"
        class="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
        aria-label="Năm trước"
        @click="emit('prev')"
      >
        ←
      </button>
      <p class="text-base font-medium text-slate-100">
        {{ year }}
      </p>
      <button
        type="button"
        class="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
        aria-label="Năm sau"
        @click="emit('next')"
      >
        →
      </button>
    </div>

    <ul
      v-if="events.length"
      class="space-y-2"
    >
      <li
        v-for="event in events"
        :key="`${event.id}-${event.year}`"
      >
        <button
          type="button"
          class="w-full rounded-xl border p-3 text-left transition focus:outline-none focus:ring-2 focus:ring-sky-500/40 sm:p-4"
          :class="event.id === selectedId
            ? 'border-sky-500/60 bg-sky-500/10'
            : 'border-transparent bg-slate-950/70 hover:border-slate-700'"
          :aria-pressed="event.id === selectedId"
          @click="emit('select', event.id)"
        >
          <div class="flex flex-wrap items-baseline justify-between gap-2">
            <p class="text-sm font-medium text-slate-100 sm:text-base">
              {{ event.name }}
            </p>
            <p class="text-sm text-sky-300">
              {{ formatPeakDate(event.peakAt) }}
            </p>
          </div>
          <div class="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 sm:text-sm">
            <span>{{ formatActiveRange(event.activeStart, event.activeEnd) }}</span>
            <span class="font-mono">ZHR {{ event.zhr }}</span>
            <span>{{ DIFFICULTY_VI[event.difficulty] }}</span>
          </div>
        </button>
      </li>
    </ul>

    <p
      v-else
      class="rounded-xl bg-slate-950/70 p-4 text-sm text-slate-400"
    >
      Chưa có sự kiện mưa sao băng cho năm này.
    </p>
  </SkyCard>
</template>
