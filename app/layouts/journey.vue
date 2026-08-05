<script setup lang="ts">
import LanguageSwitcher from '../components/settings/LanguageSwitcher.vue'
import UnitSwitcher from '../components/settings/UnitSwitcher.vue'

/** Page sets false during cinematic playback so overlays don't collide. */
const showChrome = useState('journey-layout-chrome', () => true)
</script>

<template>
  <div class="min-h-[100dvh] bg-[#030712] text-slate-100 antialiased">
    <header
      v-if="showChrome"
      class="sticky top-0 z-40 border-b border-white/5 bg-[#030712]/90 backdrop-blur-md"
    >
      <div class="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <NuxtLink
          to="/universe"
          class="text-sm text-sky-300/90 transition hover:text-sky-200"
        >
          ← {{ $t('nav.universe') }}
        </NuxtLink>
        <div class="flex flex-wrap items-center justify-end gap-3 sm:gap-4">
          <LanguageSwitcher />
          <UnitSwitcher />
        </div>
      </div>
    </header>
    <main class="w-full">
      <slot />
    </main>
  </div>
</template>
