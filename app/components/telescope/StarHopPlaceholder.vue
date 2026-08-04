<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <SkyCard>
    <SectionTitle
      :title="t('components.telescope.starHop.title')"
      :subtitle="t('components.telescope.starHop.subtitle')"
    />

    <div class="rounded-xl bg-slate-950/70 p-4 text-sm leading-6 text-slate-300">
      <p class="font-medium text-sky-300">
        {{ t('components.telescope.starHop.comingSoon') }}
      </p>
      <p class="mt-2">
        <i18n-t
          keypath="components.telescope.starHop.body1"
          tag="span"
        >
          <template #hopStep>
            <code class="rounded bg-slate-900 px-1.5 py-0.5 font-mono text-xs text-sky-200">HopStep</code>
          </template>
          <template #referenceStar>
            <code class="rounded bg-slate-900 px-1.5 py-0.5 font-mono text-xs text-sky-200">ReferenceStar</code>
          </template>
          <template #targetObject>
            <code class="rounded bg-slate-900 px-1.5 py-0.5 font-mono text-xs text-sky-200">TargetObject</code>
          </template>
        </i18n-t>
      </p>
      <p class="mt-2 text-slate-400">
        {{ t('components.telescope.starHop.body2') }}
      </p>
    </div>
  </SkyCard>
</template>
