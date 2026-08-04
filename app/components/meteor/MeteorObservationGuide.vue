<script setup lang="ts">
import type {
  MeteorEquipmentKind,
  MeteorObservationGuide
} from '../../../types/meteor'

defineProps<{
  guide: MeteorObservationGuide
}>()

const EQUIPMENT_VI: Record<MeteorEquipmentKind, string> = {
  'naked-eye': 'Mắt thường',
  binoculars: 'Ống nhòm',
  telescope: 'Kính thiên văn'
}

function recommendedLabel(value: boolean): string {
  return value ? 'Khuyên dùng' : 'Không cần'
}
</script>

<template>
  <SkyCard>
    <SectionTitle
      title="Hướng dẫn quan sát"
      subtitle="Thời điểm, bầu trời tối, ánh trăng và dụng cụ gợi ý."
    />

    <dl class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Thời điểm khuyên
        </dt>
        <dd class="mt-1 text-sm leading-6 text-slate-100">
          {{ guide.recommendedTime }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Bầu trời tối
        </dt>
        <dd class="mt-1 text-sm leading-6 text-slate-100">
          {{ guide.darkSkyRequirement }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Ảnh hưởng ánh trăng
        </dt>
        <dd class="mt-1 text-sm leading-6 text-slate-100">
          {{ guide.moonlightImpact }}
        </dd>
      </div>
      <div class="rounded-xl bg-slate-950/70 p-4">
        <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">
          Mây
        </dt>
        <dd class="mt-1 text-sm leading-6 text-slate-100">
          {{ guide.cloudReminder }}
        </dd>
      </div>
    </dl>

    <ul
      v-if="guide.equipment.length"
      class="mt-3 space-y-2"
    >
      <li
        v-for="item in guide.equipment"
        :key="item.kind"
        class="rounded-xl bg-slate-950/70 p-4"
      >
        <div class="flex flex-wrap items-baseline justify-between gap-2">
          <p class="text-sm font-medium text-slate-100">
            {{ EQUIPMENT_VI[item.kind] }}
          </p>
          <p
            class="text-xs font-medium uppercase tracking-wider"
            :class="item.recommended ? 'text-sky-300' : 'text-slate-500'"
          >
            {{ recommendedLabel(item.recommended) }}
          </p>
        </div>
        <p class="mt-1.5 text-sm leading-6 text-slate-400">
          {{ item.note }}
        </p>
      </li>
    </ul>
  </SkyCard>
</template>
