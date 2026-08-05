<script setup lang="ts">
import LanguageSwitcher from '../components/settings/LanguageSwitcher.vue'
import UnitSwitcher from '../components/settings/UnitSwitcher.vue'
</script>

<template>
  <div class="min-h-[100dvh] bg-[#030712] text-slate-100 antialiased">
    <header class="pointer-events-none absolute inset-x-0 top-0 z-40">
      <div class="pointer-events-auto mx-auto flex w-full items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <NuxtLink
          to="/universe"
          class="text-sm text-sky-300/90 hover:text-sky-200"
        >
          {{ $t('nav.universe') }}
        </NuxtLink>
        <div class="flex flex-wrap items-center justify-end gap-4">
          <LanguageSwitcher />
          <UnitSwitcher />
        </div>
      </div>
    </header>
    <main class="min-h-[100dvh] w-full">
      <slot />
    </main>
  </div>
</template>
