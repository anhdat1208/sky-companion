<script setup lang="ts">
interface LoadingLocationProps {
  message?: string
}

withDefaults(defineProps<LoadingLocationProps>(), {
  message: 'Đang xác định vị trí của bạn...'
})
</script>

<template>
  <SkyCard
    role="status"
    aria-live="polite"
  >
    <div class="flex items-center gap-4">
      <span
        class="h-11 w-11 shrink-0 animate-pulse rounded-full bg-slate-800"
        aria-hidden="true"
      />
      <div class="min-w-0 flex-1">
        <p class="font-medium text-slate-200">
          {{ message }}
        </p>
        <div
          class="mt-3 h-2.5 w-2/3 animate-pulse rounded-full bg-slate-800"
          aria-hidden="true"
        />
      </div>
    </div>
  </SkyCard>
</template>
