<script setup lang="ts">
import type { UniverseRenderer } from '../../../lib/universe/renderer'
import type { CameraKeyframe } from '../../../types/journey'
import type {
  CameraMode,
  CelestialBodyId,
  OverlayFlags,
  UniverseLevel,
  UniverseSnapshot
} from '../../../types/universe'

const props = withDefaults(defineProps<{
  level: UniverseLevel
  snapshot: UniverseSnapshot
  overlays: OverlayFlags
  cameraMode: CameraMode
  followBodyId: CelestialBodyId | null
  /** Full-bleed cinematic shell for Journey Mode */
  variant?: 'explorer' | 'journey'
  /** When false, setLevel will not auto-animate camera (journey drives keyframes) */
  autoAnimateLevel?: boolean
}>(), {
  variant: 'explorer',
  autoAnimateLevel: true
})

const emit = defineEmits<{
  selectBody: [id: CelestialBodyId | null]
  ready: []
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

let renderer: UniverseRenderer | null = null
let resizeObserver: ResizeObserver | null = null

async function mountRenderer(): Promise<void> {
  if (!canvasRef.value || !import.meta.client) return
  loading.value = true
  error.value = null
  try {
    const { createUniverseRenderer } = await import('../../../lib/universe/renderer')
    renderer = await createUniverseRenderer()
    await renderer.mount(canvasRef.value)
    renderer.onSelectBody((id) => emit('selectBody', id))
    renderer.setLevel(props.level, { animateCamera: props.autoAnimateLevel })
    renderer.setSnapshot(props.snapshot)
    renderer.setOverlays(props.overlays)
    renderer.setCameraMode(props.cameraMode, props.followBodyId)
    if (containerRef.value) {
      renderer.resize(containerRef.value.clientWidth, containerRef.value.clientHeight)
    }
    emit('ready')
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : 'Failed to start renderer'
  } finally {
    loading.value = false
  }
}

watch(
  () => props.level,
  (level) => {
    renderer?.setLevel(level, { animateCamera: props.autoAnimateLevel })
  }
)

watch(
  () => props.snapshot,
  (snapshot) => {
    renderer?.setSnapshot(snapshot)
  },
  { deep: true }
)

watch(
  () => props.overlays,
  (flags) => {
    renderer?.setOverlays(flags)
  },
  { deep: true }
)

watch(
  () => [props.cameraMode, props.followBodyId] as const,
  ([mode, bodyId]) => {
    renderer?.setCameraMode(mode, bodyId)
  }
)

onMounted(async () => {
  // Wait one frame so absolute canvas inherits the container's real box size.
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve())
  })
  await mountRenderer()
  if (containerRef.value && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry || !renderer) return
      const { width, height } = entry.contentRect
      if (width < 2 || height < 2) return
      renderer.resize(width, height)
    })
    resizeObserver.observe(containerRef.value)
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
  renderer?.dispose()
  renderer = null
})

defineExpose({
  animateCamera(keyframe: CameraKeyframe) {
    return renderer?.animateCamera(keyframe) ?? Promise.resolve()
  },
  cancelCameraAnimation() {
    renderer?.cancelCameraAnimation()
  },
  setControlsEnabled(enabled: boolean) {
    renderer?.setControlsEnabled(enabled)
  }
})
</script>

<template>
  <div
    ref="containerRef"
    :class="variant === 'journey'
      ? 'relative h-full min-h-[100dvh] w-full overflow-hidden bg-slate-950'
      : 'relative aspect-[16/10] w-full min-h-[420px] overflow-hidden rounded-2xl bg-slate-950 sm:min-h-[520px] lg:min-h-[640px]'"
  >
    <canvas
      ref="canvasRef"
      class="absolute inset-0 block h-full w-full touch-none"
    />
    <div
      v-if="loading"
      class="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-slate-950/70 text-sm text-slate-300"
    >
      {{ $t('common.loading') }}
    </div>
    <div
      v-if="error"
      class="absolute inset-x-0 bottom-0 z-10 bg-rose-950/80 px-4 py-2 text-sm text-rose-100"
      role="alert"
    >
      {{ error }}
    </div>
  </div>
</template>
