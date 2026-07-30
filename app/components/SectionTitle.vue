<script setup lang="ts">
interface SectionTitleProps {
  title: string
  subtitle?: string
}

defineProps<SectionTitleProps>()
</script>

<template>
  <header class="mb-4">
    <h2 class="text-xl font-semibold tracking-tight text-white">
      {{ title }}
    </h2>
    <p
      v-if="subtitle"
      class="mt-1.5 text-sm leading-6 text-slate-400"
    >
      {{ subtitle }}
    </p>
  </header>
</template>
