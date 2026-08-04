<script setup lang="ts">
import type { ObservationScore, ObservationScoreLabel } from '../../../types/moon'

defineProps<{
  score: ObservationScore
}>()

const LABEL_VI: Record<ObservationScoreLabel, string> = {
  Poor: 'Kém',
  Fair: 'Trung bình',
  Good: 'Tốt',
  Excellent: 'Xuất sắc'
}
</script>

<template>
  <SkyCard>
    <SectionTitle
      title="Điểm quan sát"
      subtitle="Đánh giá nhanh điều kiện xem Mặt Trăng lúc này."
    />

    <div class="rounded-xl bg-slate-950/70 p-4">
      <div class="flex flex-wrap items-baseline gap-3">
        <p
          class="font-mono text-2xl tracking-widest text-amber-200"
          :aria-label="`${score.stars} trên 5 sao`"
        >
          <span
            v-for="n in 5"
            :key="n"
            :class="n <= score.stars ? 'text-amber-200' : 'text-slate-600'"
          >★</span>
        </p>
        <p class="text-base text-slate-100">
          {{ LABEL_VI[score.label] }}
        </p>
      </div>

      <ul
        v-if="score.reasons.length"
        class="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-6 text-slate-400"
      >
        <li
          v-for="(reason, index) in score.reasons"
          :key="index"
        >
          {{ reason }}
        </li>
      </ul>
    </div>
  </SkyCard>
</template>
