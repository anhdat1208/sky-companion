<script setup lang="ts">
import type { MoonQuarterEvent, MoonQuarterType } from '../../../types/moon'

defineProps<{
  events: MoonQuarterEvent[]
}>()

const TYPE_VI: Record<MoonQuarterType, string> = {
  new: 'Trăng mới',
  'first-quarter': 'Bán nguyệt đầu',
  full: 'Trăng tròn',
  'last-quarter': 'Bán nguyệt cuối'
}

function formatEventTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'full',
    timeStyle: 'short'
  }).format(date)
}

function daysRemainingLabel(days: number): string {
  const rounded = Math.max(0, Math.round(days))
  if (rounded === 0) return 'hôm nay'
  if (rounded === 1) return 'còn 1 ngày'
  return `còn ${rounded} ngày`
}
</script>

<template>
  <SkyCard>
    <SectionTitle
      title="Pha sắp tới"
      subtitle="Bốn mốc quý tiếp theo của chu kỳ Mặt Trăng."
    />

    <ul
      v-if="events.length"
      class="space-y-3"
    >
      <li
        v-for="event in events"
        :key="`${event.type}-${event.at}`"
        class="rounded-xl bg-slate-950/70 p-4"
      >
        <div class="flex flex-wrap items-baseline justify-between gap-2">
          <p class="text-base font-medium text-slate-100">
            {{ TYPE_VI[event.type] }}
            <span class="ml-2 text-xs font-normal uppercase tracking-wider text-slate-500">
              {{ event.type }}
            </span>
          </p>
          <p class="text-sm text-sky-300">
            {{ daysRemainingLabel(event.daysRemaining) }}
          </p>
        </div>
        <p class="mt-1.5 text-sm text-slate-400">
          {{ formatEventTime(event.at) }}
        </p>
      </li>
    </ul>

    <p
      v-else
      class="rounded-xl bg-slate-950/70 p-4 text-sm text-slate-400"
    >
      Chưa có sự kiện quý sắp tới.
    </p>
  </SkyCard>
</template>
