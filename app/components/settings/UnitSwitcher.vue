<script setup lang="ts">
import type { UnitSystem } from '../../../types/units'

const { t } = useI18n()
const { unitSystem, setUnitSystem } = useUnits()

const options: Array<{ code: UnitSystem, labelKey: 'units.metric' | 'units.imperial' }> = [
  { code: 'metric', labelKey: 'units.metric' },
  { code: 'imperial', labelKey: 'units.imperial' }
]
</script>

<template>
  <div class="flex items-center gap-2">
    <span class="text-xs uppercase tracking-wider text-slate-500">
      {{ t('settings.units') }}
    </span>
    <div class="flex gap-1">
      <button
        v-for="option in options"
        :key="option.code"
        type="button"
        class="rounded-md px-2 py-1 text-sm"
        :class="unitSystem === option.code
          ? 'bg-sky-600 text-white'
          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'"
        @click="setUnitSystem(option.code)"
      >
        {{ t(option.labelKey) }}
      </button>
    </div>
  </div>
</template>
