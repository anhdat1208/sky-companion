<script setup lang="ts">
import type { BodyEducationalContent, BodyState, MoonExtras } from '../../../types/universe'

const props = defineProps<{
  content: BodyEducationalContent | null
  bodyState: BodyState | null
  moon: MoonExtras | null
}>()

const emit = defineEmits<{
  close: []
}>()

const { t } = useI18n()
const { formatDistanceFromKm } = useUnits()
const expanded = ref(false)

const name = computed(() => {
  if (!props.content) return ''
  return t(`${props.content.i18nPrefix}.name`)
})

const summary = computed(() => {
  if (!props.content) return ''
  return t(`${props.content.i18nPrefix}.summary`)
})

const facts = computed(() => {
  if (!props.content) return [] as string[]
  // Prefer indexed keys to avoid deep tm() instantiation on locale JSON.
  const prefix = props.content.i18nPrefix
  const out: string[] = []
  for (let i = 0; i < 8; i += 1) {
    const key = `${prefix}.facts[${i}]`
    const value = t(key)
    if (!value || value === key) break
    out.push(value)
  }
  return out
})

const distanceLabel = computed(() => {
  if (!props.content) return '—'
  if (props.content.id === 'moon' && props.moon) {
    return formatDistanceFromKm(props.moon.distanceKm)
  }
  if (props.content.distanceFromSunAu === null) return '—'
  return `${props.content.distanceFromSunAu} AU`
})

const positionLabel = computed(() => {
  if (!props.bodyState) return '—'
  const { x, y, z } = props.bodyState.positionKm
  return `${(x / 1e6).toFixed(1)}, ${(y / 1e6).toFixed(1)}, ${(z / 1e6).toFixed(1)} ×10⁶ km`
})
</script>

<template>
  <aside
    v-if="content"
    class="flex max-h-[70vh] w-full max-w-sm flex-col gap-3 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950/95 p-4 shadow-xl backdrop-blur"
  >
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-xs uppercase tracking-wider text-slate-500">
          {{ t('universe.detail.title') }}
        </p>
        <h2 class="text-lg font-semibold text-white">
          {{ name }}
        </h2>
        <p class="mt-1 text-sm text-slate-400">
          {{ summary }}
        </p>
      </div>
      <button
        type="button"
        class="rounded-lg border border-slate-700 px-2 py-1 text-xs text-slate-300"
        @click="emit('close')"
      >
        {{ t('universe.detail.close') }}
      </button>
    </div>

    <dl class="grid grid-cols-2 gap-2 text-xs text-slate-300">
      <div>
        <dt class="text-slate-500">{{ t('universe.detail.radius') }}</dt>
        <dd>{{ formatDistanceFromKm(content.radiusKm) }}</dd>
      </div>
      <div>
        <dt class="text-slate-500">{{ t('universe.detail.gravity') }}</dt>
        <dd>{{ content.gravityMs2 }} m/s²</dd>
      </div>
      <div>
        <dt class="text-slate-500">{{ t('universe.detail.mass') }}</dt>
        <dd>{{ content.massKg.toExponential(2) }} kg</dd>
      </div>
      <div>
        <dt class="text-slate-500">{{ t('universe.detail.distanceSun') }}</dt>
        <dd>{{ distanceLabel }}</dd>
      </div>
      <div>
        <dt class="text-slate-500">{{ t('universe.detail.orbitalPeriod') }}</dt>
        <dd>{{ content.orbitalPeriodDays ?? '—' }} d</dd>
      </div>
      <div>
        <dt class="text-slate-500">{{ t('universe.detail.rotationPeriod') }}</dt>
        <dd>{{ content.rotationPeriodHours ?? '—' }} h</dd>
      </div>
      <div class="col-span-2">
        <dt class="text-slate-500">{{ t('universe.detail.position') }}</dt>
        <dd class="font-mono text-[11px]">{{ positionLabel }}</dd>
      </div>
    </dl>

    <button
      type="button"
      class="rounded-xl bg-sky-500/90 px-3 py-2 text-sm font-medium text-slate-950"
      @click="expanded = !expanded"
    >
      {{ t('universe.detail.learnMore') }}
    </button>

    <div
      v-if="expanded"
      class="space-y-2 border-t border-slate-800 pt-3"
    >
      <p class="text-xs font-medium uppercase tracking-wider text-slate-500">
        {{ t('universe.detail.facts') }}
      </p>
      <ul class="list-disc space-y-1 pl-4 text-sm text-slate-300">
        <li
          v-for="(fact, index) in facts"
          :key="index"
        >
          {{ fact }}
        </li>
      </ul>
    </div>
  </aside>
</template>
