<script setup lang="ts">
const emit = defineEmits<{
  submit: [lat: number, lng: number]
  retry: []
}>()

const { t } = useI18n()
</script>

<template>
  <SkyCard>
    <SectionTitle
      :title="t('pages.universe.needLocation')"
      :subtitle="t('pages.universe.levelLocked')"
    />
    <PermissionDenied
      :title="t('errors.location.unavailable')"
      :subtitle="t('components.permissionDenied.body')"
      @submit="(lat, lng) => emit('submit', lat, lng)"
    />
    <button
      type="button"
      class="mt-3 rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-200"
      @click="emit('retry')"
    >
      {{ t('pages.home.retryLocation') }}
    </button>
  </SkyCard>
</template>
