<script setup lang="ts">
import type { Journey, JourneyId } from '../../../types/journey'
import JourneyCard from './JourneyCard.vue'

defineProps<{
  journeys: Journey[]
}>()

const emit = defineEmits<{
  select: [id: JourneyId]
}>()
</script>

<template>
  <section class="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
    <header class="mb-10 max-w-2xl sm:mb-14">
      <p class="text-sm uppercase tracking-[0.25em] text-slate-500">
        {{ $t('journey.eyebrow') }}
      </p>
      <h1 class="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
        {{ $t('journey.heading') }}
      </h1>
      <p class="mt-4 text-base leading-relaxed text-slate-400 sm:text-lg">
        {{ $t('journey.subtitle') }}
      </p>
    </header>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <JourneyCard
        v-for="item in journeys"
        :key="item.id"
        :journey="item"
        @select="emit('select', item.id)"
      />
    </div>
  </section>
</template>
