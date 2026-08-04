<script setup lang="ts">
import type { TelescopeProfile } from '../../../types/telescope'

defineProps<{
  profiles: TelescopeProfile[]
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [id: string]
}>()

const { t } = useI18n()

function selectProfile(id: string) {
  emit('update:modelValue', id)
}

function formatMagnification(profile: TelescopeProfile): string {
  return `${profile.magnification.value}×`
}

function formatTrueFov(profile: TelescopeProfile): string {
  return `${profile.fieldOfView.trueFovDeg.toFixed(1)}°`
}
</script>

<template>
  <SkyCard>
    <SectionTitle
      :title="t('components.telescope.profilePicker.title')"
      :subtitle="t('components.telescope.profilePicker.subtitle')"
    />

    <ul
      v-if="profiles.length > 0"
      class="space-y-3"
      role="listbox"
      :aria-label="t('components.telescope.profilePicker.listboxAriaLabel')"
    >
      <li
        v-for="profile in profiles"
        :key="profile.id"
      >
        <button
          type="button"
          role="option"
          class="w-full rounded-xl border p-4 text-left transition"
          :class="profile.id === modelValue
            ? 'border-sky-500/60 bg-sky-500/10'
            : 'border-transparent bg-slate-950/70 hover:border-slate-700'"
          :aria-selected="profile.id === modelValue"
          @click="selectProfile(profile.id)"
        >
          <p class="font-medium text-slate-100">
            {{ profile.label }}
          </p>
          <dl class="mt-3 grid grid-cols-2 gap-3">
            <div>
              <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
                {{ t('components.telescope.profilePicker.magnification') }}
              </dt>
              <dd class="mt-1 font-mono text-sm text-slate-200">
                {{ formatMagnification(profile) }}
              </dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
                {{ t('components.telescope.profilePicker.trueFov') }}
              </dt>
              <dd class="mt-1 font-mono text-sm text-slate-200">
                {{ formatTrueFov(profile) }}
              </dd>
            </div>
          </dl>
        </button>
      </li>
    </ul>

    <p
      v-else
      class="rounded-xl bg-slate-950/70 p-4 text-sm leading-6 text-slate-400"
    >
      {{ t('components.telescope.profilePicker.empty') }}
    </p>
  </SkyCard>
</template>
