<script setup lang="ts">
import type { PhotoTimeline, TimelineMarker } from '../../../types/photo'

defineProps<{
  timeline: PhotoTimeline | null
}>()

const { t } = useI18n()
const { formatTime: formatTimeValue } = useFormatters()

function formatTime(value: string | null): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return formatTimeValue(date)
}

function formatMarkerTime(marker: TimelineMarker): string {
  if (marker.end) {
    return `${formatTime(marker.at)} – ${formatTime(marker.end)}`
  }
  return formatTime(marker.at)
}

function markerLabel(marker: TimelineMarker): string {
  return t(`components.photo.timelineMarkers.${marker.kind}`)
}
</script>

<template>
  <SkyCard>
    <SectionTitle
      :title="t('components.photo.photoTimeline.title')"
      :subtitle="t('components.photo.photoTimeline.subtitle')"
    />

    <div
      v-if="timeline"
      class="space-y-3"
    >
      <dl class="grid grid-cols-2 gap-3">
        <div class="rounded-xl bg-slate-950/70 p-4">
          <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
            {{ t('components.photo.photoTimeline.sunset') }}
          </dt>
          <dd class="mt-1 text-sm text-slate-100">
            {{ formatTime(timeline.window.sunset) }}
          </dd>
        </div>
        <div class="rounded-xl bg-slate-950/70 p-4">
          <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
            {{ t('components.photo.photoTimeline.sunrise') }}
          </dt>
          <dd class="mt-1 text-sm text-slate-100">
            {{ formatTime(timeline.window.sunrise) }}
          </dd>
        </div>
      </dl>

      <ul
        v-if="timeline.markers.length"
        class="flex flex-col gap-2 sm:flex-row sm:flex-wrap"
      >
        <li
          v-for="(marker, index) in timeline.markers"
          :key="`${marker.kind}-${marker.at}-${index}`"
          class="rounded-xl bg-slate-950/70 px-4 py-3 sm:min-w-[10rem] sm:flex-1"
        >
          <p class="text-xs font-medium uppercase tracking-wider text-slate-500">
            {{ markerLabel(marker) }}
          </p>
          <p class="mt-1 text-sm text-slate-100">
            {{ formatMarkerTime(marker) }}
          </p>
        </li>
      </ul>

      <p
        v-else
        class="rounded-xl bg-slate-950/70 p-4 text-sm leading-6 text-slate-400"
      >
        {{ t('components.photo.photoTimeline.noMarkers') }}
      </p>
    </div>

    <p
      v-else
      class="rounded-xl bg-slate-950/70 p-4 text-sm leading-6 text-slate-400"
    >
      {{ t('components.photo.locationRequired') }}
    </p>
  </SkyCard>
</template>
