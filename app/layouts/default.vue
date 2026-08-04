<script setup lang="ts">
import LanguageSwitcher from '../components/settings/LanguageSwitcher.vue'
import UnitSwitcher from '../components/settings/UnitSwitcher.vue'
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 antialiased">
    <main class="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div class="mb-6 flex flex-wrap items-center justify-end gap-4">
        <LanguageSwitcher />
        <UnitSwitcher />
      </div>
      <slot />
    </main>
  </div>
</template>
