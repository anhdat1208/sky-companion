<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <SkyCard>
    <SectionTitle
      :title="t('components.iss.notificationsStub.title')"
      :subtitle="t('components.iss.notificationsStub.subtitle')"
    />

    <div class="rounded-xl bg-slate-950/70 p-4 text-sm leading-6 text-slate-300">
      <p class="font-medium text-sky-300">
        {{ t('components.iss.notificationsStub.comingSoon') }}
      </p>
      <p class="mt-2 text-slate-400">
        {{ t('components.iss.notificationsStub.body') }}
      </p>
    </div>
  </SkyCard>
</template>
