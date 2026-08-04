<script setup lang="ts">
const { t } = useI18n()
const { locale, switchLocale } = useAppLocale()

const options = [
  { code: 'en', labelKey: 'settings.english' },
  { code: 'vi', labelKey: 'settings.vietnamese' }
] as const
</script>

<template>
  <div class="flex items-center gap-2">
    <span class="text-xs uppercase tracking-wider text-slate-500">
      {{ t('settings.language') }}
    </span>
    <div class="flex gap-1">
      <button
        v-for="option in options"
        :key="option.code"
        type="button"
        class="rounded-md px-2 py-1 text-sm"
        :class="locale === option.code
          ? 'bg-sky-600 text-white'
          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'"
        @click="switchLocale(option.code)"
      >
        {{ t(option.labelKey) }}
      </button>
    </div>
  </div>
</template>
