<script setup lang="ts">
import type { MoonQuarterEvent, MoonQuarterType } from '../../../types/moon'

defineProps<{
  events: MoonQuarterEvent[]
}>()

const { t } = useI18n()
const { formatDateTime } = useFormatters()

function quarterTypeLabel(type: MoonQuarterType): string {
  return t(`components.moon.quarterTypes.${type}`)
}

function formatEventTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return formatDateTime(date)
}

function daysRemainingLabel(days: number): string {
  const rounded = Math.max(0, Math.round(days))
  if (rounded === 0) return t('components.moon.upcomingEvents.daysRemainingToday')
  if (rounded === 1) return t('components.moon.upcomingEvents.daysRemainingOne')
  return t('components.moon.upcomingEvents.daysRemainingMany', { count: rounded })
}
</script>

<template>
  <SkyCard>
    <SectionTitle
      :title="t('components.moon.upcomingEvents.title')"
      :subtitle="t('components.moon.upcomingEvents.subtitle')"
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
            {{ quarterTypeLabel(event.type) }}
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
      {{ t('components.moon.upcomingEvents.empty') }}
    </p>
  </SkyCard>
</template>
