<script setup lang="ts">
/**
 * SVG schematic ground track. Path segments update instantly from `groundTrack`.
 * The “now” marker alone is linearly tweened (~1.5s) between successive
 * `position` prop updates via requestAnimationFrame — poll interval unchanged.
 */
import { computed, onBeforeUnmount, ref, watch } from 'vue'

import { splitTrackAtAntimeridian } from '../../../lib/iss/trackSplit'
import type { IssGroundTrackPoint, IssPosition } from '../../../types/iss'

const props = defineProps<{
  groundTrack: IssGroundTrackPoint[]
  position: IssPosition
}>()

const { t } = useI18n()

const WIDTH = 360
const HEIGHT = 180
const MARKER_TWEEN_MS = 1500

const markerLat = ref(props.position.latitude)
const markerLng = ref(props.position.longitude)

let rafId: number | null = null
let tweenStart = 0
let fromLat = props.position.latitude
let fromLng = props.position.longitude
let toLat = props.position.latitude
let toLng = props.position.longitude

function project(lon: number, lat: number): { x: number, y: number } {
  return {
    x: ((lon + 180) / 360) * WIDTH,
    y: ((90 - lat) / 180) * HEIGHT
  }
}

function shortestLngDelta(from: number, to: number): number {
  let d = to - from
  if (d > 180) d -= 360
  if (d < -180) d += 360
  return d
}

function cancelTween(): void {
  if (rafId !== null && typeof cancelAnimationFrame !== 'undefined') {
    cancelAnimationFrame(rafId)
  }
  rafId = null
}

function tick(now: number): void {
  const t = Math.min(1, (now - tweenStart) / MARKER_TWEEN_MS)
  const dLng = shortestLngDelta(fromLng, toLng)
  markerLat.value = fromLat + (toLat - fromLat) * t
  let lng = fromLng + dLng * t
  if (lng > 180) lng -= 360
  if (lng < -180) lng += 360
  markerLng.value = lng

  if (t < 1 && typeof requestAnimationFrame !== 'undefined') {
    rafId = requestAnimationFrame(tick)
  } else {
    rafId = null
    markerLat.value = toLat
    markerLng.value = toLng
  }
}

watch(
  () => [props.position.latitude, props.position.longitude] as const,
  ([lat, lng]) => {
    cancelTween()
    fromLat = markerLat.value
    fromLng = markerLng.value
    toLat = lat
    toLng = lng
    if (typeof requestAnimationFrame === 'undefined') {
      markerLat.value = lat
      markerLng.value = lng
      return
    }
    tweenStart = performance.now()
    rafId = requestAnimationFrame(tick)
  }
)

onBeforeUnmount(() => {
  cancelTween()
})

const pathDs = computed(() => {
  const segments = splitTrackAtAntimeridian(props.groundTrack)
  return segments.map((segment) => {
    if (segment.length === 0) return ''
    return segment
      .map((point, index) => {
        const { x, y } = project(point.longitude, point.latitude)
        const cmd = index === 0 ? 'M' : 'L'
        return `${cmd}${x.toFixed(2)} ${y.toFixed(2)}`
      })
      .join(' ')
  }).filter(Boolean)
})

const marker = computed(() => project(markerLng.value, markerLat.value))

const latLines = [60, 30, 0, -30, -60]
const lonLines = [-120, -60, 0, 60, 120]
</script>

<template>
  <SkyCard>
    <SectionTitle
      :title="t('components.iss.groundTrackMap.title')"
      :subtitle="t('components.iss.groundTrackMap.subtitle')"
    />

    <div class="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/70">
      <svg
        class="h-auto w-full"
        :viewBox="`0 0 ${WIDTH} ${HEIGHT}`"
        role="img"
        :aria-label="t('components.iss.groundTrackMap.ariaLabel')"
      >
        <rect
          x="0"
          y="0"
          :width="WIDTH"
          :height="HEIGHT"
          class="fill-slate-950"
        />

        <!-- Meridians / parallels (schematic world grid) -->
        <g
          class="stroke-slate-800"
          stroke-width="0.4"
          fill="none"
        >
          <line
            v-for="lon in lonLines"
            :key="`lon-${lon}`"
            :x1="project(lon, 90).x"
            y1="0"
            :x2="project(lon, -90).x"
            :y2="HEIGHT"
          />
          <line
            v-for="lat in latLines"
            :key="`lat-${lat}`"
            x1="0"
            :y1="project(0, lat).y"
            :x2="WIDTH"
            :y2="project(0, lat).y"
          />
        </g>

        <!-- Equator / prime meridian accent -->
        <line
          x1="0"
          :y1="project(0, 0).y"
          :x2="WIDTH"
          :y2="project(0, 0).y"
          class="stroke-slate-700"
          stroke-width="0.6"
        />
        <line
          :x1="project(0, 90).x"
          y1="0"
          :x2="project(0, -90).x"
          :y2="HEIGHT"
          class="stroke-slate-700"
          stroke-width="0.6"
        />

        <path
          v-for="(d, index) in pathDs"
          :key="`seg-${index}`"
          :d="d"
          fill="none"
          class="stroke-sky-400"
          stroke-width="1.25"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <circle
          :cx="marker.x"
          :cy="marker.y"
          r="3.5"
          class="fill-sky-300 stroke-sky-100"
          stroke-width="1"
        />
      </svg>
    </div>
  </SkyCard>
</template>
