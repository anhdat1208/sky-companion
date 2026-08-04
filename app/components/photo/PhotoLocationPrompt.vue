<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <SkyCard>
    <SectionTitle
      :title="t('components.photo.photoLocationPrompt.title')"
      :subtitle="t('components.photo.photoLocationPrompt.subtitle')"
    />

    <p class="rounded-xl bg-slate-950/70 p-4 text-sm leading-6 text-slate-300">
      {{ t('components.photo.photoLocationPrompt.body') }}
    </p>
  </SkyCard>
</template>
