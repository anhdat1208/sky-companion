<script setup lang="ts">
import type { DevicePointing, GuidanceInstruction } from '../../../types/telescope'

const props = defineProps<{
  guidance: GuidanceInstruction
  pointing: DevicePointing
  sensorError: string | null
}>()

const emit = defineEmits<{
  'enable-sensor': []
  'disable-sensor': []
  'update:pointing': [pointing: DevicePointing]
}>()

const { t } = useI18n()

const canSwitchToManual = computed(() => {
  return props.pointing.source === 'sensor' && props.sensorError === null
})

const showManualControls = computed(() => {
  return props.pointing.source === 'manual' || props.sensorError !== null
})

const statusLabel = computed(() => {
  return t(`components.telescope.status.${props.guidance.status}`)
})

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function emitPointing(azimuth: number, altitude: number) {
  emit('update:pointing', {
    azimuth: clamp(azimuth, 0, 360),
    altitude: clamp(altitude, -20, 90),
    source: 'manual'
  })
}

function onAzimuthInput(event: Event) {
  const value = Number((event.target as HTMLInputElement).value)
  if (Number.isNaN(value)) {
    return
  }
  emitPointing(value, props.pointing.altitude)
}

function onAltitudeInput(event: Event) {
  const value = Number((event.target as HTMLInputElement).value)
  if (Number.isNaN(value)) {
    return
  }
  emitPointing(props.pointing.azimuth, value)
}
</script>

<template>
  <SkyCard>
    <SectionTitle
      :title="t('components.telescope.guidancePanel.title')"
      :subtitle="t('components.telescope.guidancePanel.subtitle')"
    />

    <div
      class="rounded-xl border p-4"
      :class="guidance.locked
        ? 'border-emerald-500/40 bg-emerald-500/10'
        : 'border-sky-500/30 bg-sky-500/5'"
    >
      <div class="flex items-center justify-between gap-3">
        <p class="text-xs font-medium uppercase tracking-wider text-slate-400">
          {{ statusLabel }}
        </p>
        <span
          v-if="guidance.locked"
          class="rounded-lg bg-emerald-500/20 px-2.5 py-1 text-xs font-medium text-emerald-300"
        >
          {{ t('components.telescope.guidancePanel.targetLocked') }}
        </span>
      </div>

      <ul class="mt-3 space-y-2">
        <li
          v-for="(message, index) in guidance.messages"
          :key="`${index}-${message}`"
          class="text-lg font-semibold leading-7 text-white"
        >
          {{ message }}
        </li>
      </ul>

      <dl class="mt-4 grid grid-cols-2 gap-3">
        <div>
          <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
            {{ t('components.telescope.guidancePanel.deltaAzimuth') }}
          </dt>
          <dd class="mt-1 font-mono text-sm text-slate-200">
            {{ guidance.deltaAzimuthDeg.toFixed(1) }}°
          </dd>
        </div>
        <div>
          <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
            {{ t('components.telescope.guidancePanel.deltaAltitude') }}
          </dt>
          <dd class="mt-1 font-mono text-sm text-slate-200">
            {{ guidance.deltaAltitudeDeg.toFixed(1) }}°
          </dd>
        </div>
      </dl>
    </div>

    <div class="mt-4 flex flex-wrap items-center gap-3">
      <button
        type="button"
        class="rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-sky-400"
        @click="emit('enable-sensor')"
      >
        {{ t('components.telescope.guidancePanel.useSensor') }}
      </button>
      <button
        v-if="canSwitchToManual"
        type="button"
        class="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-900"
        @click="emit('disable-sensor')"
      >
        {{ t('components.telescope.guidancePanel.useManual') }}
      </button>
      <p class="text-xs text-slate-400">
        {{ t('components.telescope.guidancePanel.currentSource') }}
        <span class="font-medium text-slate-300">
          {{ pointing.source === 'sensor'
            ? t('components.telescope.guidancePanel.sourceSensor')
            : t('components.telescope.guidancePanel.sourceManual') }}
        </span>
      </p>
    </div>

    <p
      v-if="sensorError"
      class="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm leading-6 text-amber-200"
    >
      {{ sensorError }}
    </p>

    <div
      v-if="showManualControls"
      class="mt-4 space-y-4 rounded-xl bg-slate-950/70 p-4"
    >
      <p class="text-sm text-slate-300">
        {{ t('components.telescope.guidancePanel.manualHint') }}
      </p>

      <div class="space-y-2">
        <div class="flex items-center justify-between gap-3">
          <label
            for="telescope-az"
            class="text-xs font-medium uppercase tracking-wider text-slate-500"
          >
            {{ t('components.telescope.guidancePanel.azimuthLabel') }}
          </label>
          <span class="font-mono text-sm text-slate-200">
            {{ pointing.azimuth.toFixed(1) }}°
          </span>
        </div>
        <input
          id="telescope-az"
          type="range"
          min="0"
          max="360"
          step="0.5"
          class="w-full accent-sky-400"
          :value="pointing.azimuth"
          @input="onAzimuthInput"
        >
        <input
          type="number"
          min="0"
          max="360"
          step="0.1"
          class="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-sm text-slate-100"
          :value="pointing.azimuth"
          @change="onAzimuthInput"
        >
      </div>

      <div class="space-y-2">
        <div class="flex items-center justify-between gap-3">
          <label
            for="telescope-alt"
            class="text-xs font-medium uppercase tracking-wider text-slate-500"
          >
            {{ t('components.telescope.guidancePanel.altitudeLabel') }}
          </label>
          <span class="font-mono text-sm text-slate-200">
            {{ pointing.altitude.toFixed(1) }}°
          </span>
        </div>
        <input
          id="telescope-alt"
          type="range"
          min="-20"
          max="90"
          step="0.5"
          class="w-full accent-sky-400"
          :value="pointing.altitude"
          @input="onAltitudeInput"
        >
        <input
          type="number"
          min="-20"
          max="90"
          step="0.1"
          class="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-sm text-slate-100"
          :value="pointing.altitude"
          @change="onAltitudeInput"
        >
      </div>
    </div>
  </SkyCard>
</template>
