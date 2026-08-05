<script setup lang="ts">
import LanguageSwitcher from '../components/settings/LanguageSwitcher.vue'
import UnitSwitcher from '../components/settings/UnitSwitcher.vue'
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 antialiased">
    <header class="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur">
      <div class="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <NuxtLink
          to="/"
          class="text-sm text-sky-300 hover:text-sky-200"
        >
          {{ $t('common.backHome') }}
        </NuxtLink>
        <div class="flex flex-wrap items-center justify-end gap-4">
          <LanguageSwitcher />
          <UnitSwitcher />
        </div>
      </div>
    </header>
    <main class="mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-6 sm:py-6">
      <slot />
    </main>
  </div>
</template>
