<script setup lang="ts">
import type { MoonInfo, PlanetInfo } from '../../types/astronomy'

interface SkyMapPoint {
  id: string
  label: string
  altitude: number
  azimuth: number
  visible: boolean
  kind: 'moon' | 'planet'
}

interface SkyMap2DProps {
  moon: MoonInfo
  planets: PlanetInfo[]
}

const props = defineProps<SkyMap2DProps>()

const size = 320
const center = size / 2
const horizonRadius = 130
const skyRadius = 122
const markerSize = 5

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function toMapCoordinates(altitude: number, azimuth: number): { x: number; y: number } {
  const normalizedAltitude = clamp(altitude, -10, 90)
  const altitudeRatio = (normalizedAltitude + 10) / 100
  const radius = skyRadius * (1 - altitudeRatio)
  const radians = ((azimuth - 90) * Math.PI) / 180

  return {
    x: center + Math.cos(radians) * radius,
    y: center + Math.sin(radians) * radius
  }
}

const points = computed<SkyMapPoint[]>(() => {
  const moonPoint: SkyMapPoint = {
    id: 'moon',
    label: 'Moon',
    altitude: props.moon.altitude,
    azimuth: props.moon.azimuth,
    visible: props.moon.altitude > 0,
    kind: 'moon'
  }

  const planetPoints = props.planets.map<SkyMapPoint>((planet) => ({
    id: `planet-${planet.name}`,
    label: planet.name,
    altitude: planet.altitude,
    azimuth: planet.azimuth,
    visible: planet.isVisible,
    kind: 'planet'
  }))

  return [moonPoint, ...planetPoints]
})

const renderedPoints = computed(() => {
  return points.value.map((point) => {
    const coordinates = toMapCoordinates(point.altitude, point.azimuth)
    return {
      ...point,
      x: Number(coordinates.x.toFixed(2)),
      y: Number(coordinates.y.toFixed(2))
    }
  })
})
</script>

<template>
  <SkyCard>
    <SectionTitle
      title="Sky Map 2D"
      subtitle="Bản đồ trời nhanh theo azimuth và altitude (N/E/S/W)."
    />

    <div class="overflow-x-auto">
      <svg
        :viewBox="`0 0 ${size} ${size}`"
        class="mx-auto h-auto w-full max-w-[420px]"
        role="img"
        aria-label="Bản đồ trời 2D với Mặt Trăng và hành tinh"
      >
        <defs>
          <radialGradient id="sky-gradient" cx="50%" cy="45%" r="65%">
            <stop offset="0%" stop-color="#0f2948" />
            <stop offset="100%" stop-color="#020617" />
          </radialGradient>
        </defs>

        <circle :cx="center" :cy="center" :r="horizonRadius" fill="url(#sky-gradient)" />
        <circle :cx="center" :cy="center" :r="horizonRadius" fill="none" stroke="#334155" stroke-width="2" />
        <line :x1="center" :y1="center - horizonRadius" :x2="center" :y2="center + horizonRadius" stroke="#1e293b" stroke-width="1" />
        <line :x1="center - horizonRadius" :y1="center" :x2="center + horizonRadius" :y2="center" stroke="#1e293b" stroke-width="1" />

        <text :x="center" :y="center - horizonRadius - 10" text-anchor="middle" fill="#cbd5e1" font-size="12">N</text>
        <text :x="center + horizonRadius + 12" :y="center + 4" text-anchor="middle" fill="#cbd5e1" font-size="12">E</text>
        <text :x="center" :y="center + horizonRadius + 18" text-anchor="middle" fill="#cbd5e1" font-size="12">S</text>
        <text :x="center - horizonRadius - 12" :y="center + 4" text-anchor="middle" fill="#cbd5e1" font-size="12">W</text>

        <g
          v-for="point in renderedPoints"
          :key="point.id"
        >
          <circle
            :cx="point.x"
            :cy="point.y"
            :r="markerSize"
            :fill="point.kind === 'moon' ? '#f8fafc' : '#38bdf8'"
            :opacity="point.visible ? 1 : 0.35"
            stroke="#0f172a"
            stroke-width="1.2"
          />
          <text
            :x="point.x + 8"
            :y="point.y - 8"
            fill="#e2e8f0"
            font-size="11"
          >
            {{ point.label }}
          </text>
        </g>
      </svg>
    </div>

    <p class="mt-4 text-xs text-slate-400">
      Marker mờ nghĩa là vật thể đang ở dưới chân trời (khó quan sát ở thời điểm hiện tại).
    </p>
  </SkyCard>
</template>
