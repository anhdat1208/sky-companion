<script setup lang="ts">
import type { BrightnessLabel, IssBrightness } from '../../../types/iss'

defineProps<{
  brightness: IssBrightness | null
}>()

const { t } = useI18n()

function formatMagnitude(value: number | null): string {
  if (value === null) {
    return '—'
  }
  return value.toFixed(1)
}

function brightnessLabel(label: BrightnessLabel): string {
  return t(`components.iss.brightnessCard.labels.${label}`)
}
</script>

<template>
  <SkyCard>
    <SectionTitle
      :title="t('components.iss.brightnessCard.title')"
      :subtitle="t('components.iss.brightnessCard.subtitle')"
    />

    <dl
      v-if="brightness"
      class="grid grid-cols-2 gap-3"
    >
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          {{ t('components.iss.brightnessCard.magnitude') }}
        </dt>
        <dd class="mt-1 font-mono text-base text-slate-100">
          {{ formatMagnitude(brightness.magnitude) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          {{ t('components.iss.brightnessCard.label') }}
        </dt>
        <dd class="mt-1 text-base text-slate-100">
          {{ brightnessLabel(brightness.label) }}
        </dd>
      </div>
    </dl>

    <p
      v-else
      class="rounded-xl bg-slate-950/70 p-4 text-sm leading-6 text-slate-400"
    >
      {{ t('components.iss.brightnessCard.empty') }}
    </p>
  </SkyCard>
</template>
