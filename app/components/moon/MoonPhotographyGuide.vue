<script setup lang="ts">
import type { PhotographyGuide } from '../../../types/moon'

defineProps<{
  guide: PhotographyGuide
}>()

function yesNo(value: boolean): string {
  return value ? 'Có' : 'Không'
}
</script>

<template>
  <SkyCard>
    <SectionTitle
      title="Gợi ý chụp ảnh"
      subtitle="Phù hợp phong cảnh, hố va chạm hay Mặt Trăng mọc — kèm tiêu cự gợi ý."
    />

    <dl class="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Phong cảnh
        </dt>
        <dd class="mt-1 text-base text-slate-100">
          {{ yesNo(guide.bestForLandscape) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Hố va chạm
        </dt>
        <dd class="mt-1 text-base text-slate-100">
          {{ yesNo(guide.bestForCraters) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Mặt Trăng mọc
        </dt>
        <dd class="mt-1 text-base text-slate-100">
          {{ yesNo(guide.bestForMoonrise) }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4 sm:col-span-3">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Tiêu cự gợi ý
        </dt>
        <dd class="mt-1 font-mono text-base text-slate-100">
          {{ guide.recommendedFocalLengthMm.min }}–{{ guide.recommendedFocalLengthMm.max }} mm
        </dd>
      </div>
    </dl>

    <ul
      v-if="guide.notes.length"
      class="mt-3 list-disc space-y-1.5 rounded-xl bg-slate-950/70 p-4 pl-9 text-sm leading-6 text-slate-400"
    >
      <li
        v-for="(note, index) in guide.notes"
        :key="index"
      >
        {{ note }}
      </li>
    </ul>
  </SkyCard>
</template>
