<script setup lang="ts">
import type { UniverseLevel } from '../../../types/universe'

const props = defineProps<{
  level: UniverseLevel
  canUseLevel1: boolean
}>()

const emit = defineEmits<{
  'update:level': [level: UniverseLevel]
}>()

const { t } = useI18n()

const levels = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const

function select(level: UniverseLevel): void {
  if (level === 1 && !props.canUseLevel1) return
  emit('update:level', level)
}

function step(delta: number): void {
  const next = Math.min(9, Math.max(1, props.level + delta)) as UniverseLevel
  select(next)
}
</script>

<template>
  <div class="space-y-2 rounded-2xl border border-slate-800 bg-slate-950/80 p-3 backdrop-blur">
    <div class="flex items-center justify-between gap-2">
      <button
        type="button"
        class="rounded-lg border border-slate-700 px-2 py-1 text-xs text-slate-200 disabled:opacity-40"
        :disabled="level <= 1 || (level === 2 && !canUseLevel1)"
        @click="step(-1)"
      >
        ↑
      </button>
      <p class="text-xs font-medium text-sky-300">
        {{ t(`universe.levels.${level}`) }}
      </p>
      <button
        type="button"
        class="rounded-lg border border-slate-700 px-2 py-1 text-xs text-slate-200 disabled:opacity-40"
        :disabled="level >= 9"
        @click="step(1)"
      >
        ↓
      </button>
    </div>
    <div class="flex flex-col gap-1">
      <button
        v-for="item in levels"
        :key="item"
        type="button"
        class="rounded-lg px-2 py-1.5 text-left text-xs transition"
        :class="item === level
          ? 'bg-sky-500/20 text-sky-200 ring-1 ring-sky-500/40'
          : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'"
        :disabled="item === 1 && !canUseLevel1"
        :title="item === 1 && !canUseLevel1 ? t('pages.universe.levelLocked') : undefined"
        @click="select(item)"
      >
        {{ item }}. {{ t(`universe.levels.${item}`) }}
      </button>
    </div>
  </div>
</template>
