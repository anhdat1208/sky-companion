<script setup lang="ts">
import type { CameraSettings } from '../../../types/photo'

const props = defineProps<{
  settings: CameraSettings | null
  subjectLabel?: string
}>()

const { t } = useI18n()

const cardTitle = computed(() => {
  if (props.subjectLabel) {
    return t('components.photo.cameraSettingsCard.titleWithSubject', {
      subject: props.subjectLabel
    })
  }
  return t('components.photo.cameraSettingsCard.title')
})

function formatYesNo(value: boolean): string {
  return value ? t('components.moon.yes') : t('components.moon.no')
}
</script>

<template>
  <SkyCard>
    <SectionTitle
      :title="cardTitle"
      :subtitle="t('components.photo.cameraSettingsCard.subtitle')"
    />

    <dl
      v-if="settings"
      class="grid grid-cols-2 gap-3 sm:grid-cols-3"
    >
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          ISO
        </dt>
        <dd class="mt-1 font-mono text-sm text-slate-100">
          {{ settings.iso.min }}–{{ settings.iso.max }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          {{ t('components.photo.cameraSettingsCard.aperture') }}
        </dt>
        <dd class="mt-1 text-sm text-slate-100">
          {{ settings.aperture }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          {{ t('components.photo.cameraSettingsCard.exposure') }}
        </dt>
        <dd class="mt-1 text-sm text-slate-100">
          {{ settings.exposureTime }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          {{ t('components.photo.cameraSettingsCard.focalLength') }}
        </dt>
        <dd class="mt-1 font-mono text-sm text-slate-100">
          {{ settings.focalLengthMm.min }}–{{ settings.focalLengthMm.max }}mm
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          {{ t('components.photo.cameraSettingsCard.tripod') }}
        </dt>
        <dd class="mt-1 text-sm text-slate-100">
          {{ formatYesNo(settings.tripodRequired) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          {{ t('components.photo.cameraSettingsCard.remote') }}
        </dt>
        <dd class="mt-1 text-sm text-slate-100">
          {{ formatYesNo(settings.remoteShutter) }}
        </dd>
      </div>
    </dl>

    <p
      v-else
      class="rounded-xl bg-slate-950/70 p-4 text-sm leading-6 text-slate-400"
    >
      {{ t('components.photo.locationRequired') }}
    </p>
  </SkyCard>
</template>
