<script setup lang="ts">
import type { MoonCalendarDay, MoonPhaseIconKey } from '../../../types/moon'

const props = defineProps<{
  year: number
  month: number
  days: MoonCalendarDay[]
  selectedDateISO: string | null
}>()

const emit = defineEmits<{
  prev: []
  next: []
  select: [dateISO: string]
}>()

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'] as const

const PHASE_GLYPH: Record<MoonPhaseIconKey, string> = {
  new: '🌑',
  'waxing-crescent': '🌒',
  'first-quarter': '🌓',
  'waxing-gibbous': '🌔',
  full: '🌕',
  'waning-gibbous': '🌖',
  'last-quarter': '🌗',
  'waning-crescent': '🌘'
}

const monthLabel = computed(() => {
  const date = new Date(props.year, props.month - 1, 1)
  return new Intl.DateTimeFormat('vi-VN', {
    month: 'long',
    year: 'numeric'
  }).format(date)
})

function dayNumber(dateISO: string): string {
  return String(Number(dateISO.slice(8, 10)))
}

function shortTime(value: string | null): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

function onSelect(day: MoonCalendarDay): void {
  if (!day.inCurrentMonth) return
  emit('select', day.dateISO)
}
</script>

<template>
  <SkyCard>
    <SectionTitle
      title="Lịch tháng"
      subtitle="Chọn một ngày trong tháng để xem chi tiết."
    />

    <div class="mb-4 flex items-center justify-between gap-3">
      <button
        type="button"
        class="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
        aria-label="Tháng trước"
        @click="emit('prev')"
      >
        ←
      </button>
      <p class="text-base font-medium capitalize text-slate-100">
        {{ monthLabel }}
      </p>
      <button
        type="button"
        class="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
        aria-label="Tháng sau"
        @click="emit('next')"
      >
        →
      </button>
    </div>

    <div class="grid grid-cols-7 gap-1.5 sm:gap-2">
      <div
        v-for="label in WEEKDAYS"
        :key="label"
        class="pb-1 text-center text-[11px] font-medium uppercase tracking-wider text-slate-500 sm:text-xs"
      >
        {{ label }}
      </div>

      <button
        v-for="day in days"
        :key="day.dateISO"
        type="button"
        class="min-h-[4.5rem] rounded-xl border p-1.5 text-left transition focus:outline-none focus:ring-2 focus:ring-sky-500/40 sm:min-h-[5.5rem] sm:p-2"
        :class="[
          day.inCurrentMonth
            ? 'border-slate-800 bg-slate-950/70 hover:border-slate-600'
            : 'cursor-default border-transparent bg-slate-950/20 text-slate-600',
          day.isToday && day.inCurrentMonth ? 'ring-1 ring-sky-500/50' : '',
          selectedDateISO === day.dateISO && day.inCurrentMonth
            ? 'border-sky-500/60 bg-sky-950/40'
            : ''
        ]"
        :disabled="!day.inCurrentMonth"
        :aria-pressed="selectedDateISO === day.dateISO"
        :aria-label="`Ngày ${day.dateISO}`"
        @click="onSelect(day)"
      >
        <div class="flex items-center justify-between gap-1">
          <span
            class="text-sm font-medium"
            :class="day.inCurrentMonth ? 'text-slate-100' : 'text-slate-600'"
          >
            {{ dayNumber(day.dateISO) }}
          </span>
          <span
            class="text-sm leading-none"
            aria-hidden="true"
          >{{ PHASE_GLYPH[day.iconKey] }}</span>
        </div>
        <p
          class="mt-1 font-mono text-[10px] sm:text-xs"
          :class="day.inCurrentMonth ? 'text-slate-400' : 'text-slate-700'"
        >
          {{ day.illuminatedPercentage.toFixed(0) }}%
        </p>
        <p
          class="mt-0.5 hidden text-[10px] leading-4 sm:block"
          :class="day.inCurrentMonth ? 'text-slate-500' : 'text-slate-700'"
        >
          ↑ {{ shortTime(day.riseTime) }}
          <br>
          ↓ {{ shortTime(day.setTime) }}
        </p>
      </button>
    </div>
  </SkyCard>
</template>
