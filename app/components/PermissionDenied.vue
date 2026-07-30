<script setup lang="ts">
interface PermissionDeniedProps {
  title?: string
  subtitle?: string
  submitting?: boolean
}

interface PermissionDeniedEmits {
  submit: [lat: number, lng: number]
}

withDefaults(defineProps<PermissionDeniedProps>(), {
  title: 'Không thể truy cập vị trí',
  subtitle: 'Hãy cho phép truy cập vị trí trong trình duyệt hoặc nhập tọa độ thủ công.',
  submitting: false
})

const emit = defineEmits<PermissionDeniedEmits>()

const lat = ref('')
const lng = ref('')
const touched = reactive({
  lat: false,
  lng: false
})

function parseCoordinate(value: string, min: number, max: number): number | null {
  if (value.trim() === '') {
    return null
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= min && parsed <= max
    ? parsed
    : null
}

const parsedLat = computed(() => parseCoordinate(lat.value, -90, 90))
const parsedLng = computed(() => parseCoordinate(lng.value, -180, 180))
const latError = computed(() => {
  if (lat.value.trim() === '') {
    return 'Vui lòng nhập vĩ độ.'
  }

  return parsedLat.value === null ? 'Vĩ độ phải nằm trong khoảng -90 đến 90.' : ''
})
const lngError = computed(() => {
  if (lng.value.trim() === '') {
    return 'Vui lòng nhập kinh độ.'
  }

  return parsedLng.value === null ? 'Kinh độ phải nằm trong khoảng -180 đến 180.' : ''
})
const isValid = computed(() => parsedLat.value !== null && parsedLng.value !== null)

function submit(): void {
  touched.lat = true
  touched.lng = true

  if (parsedLat.value === null || parsedLng.value === null) {
    return
  }

  emit('submit', parsedLat.value, parsedLng.value)
}
</script>

<template>
  <SkyCard>
    <SectionTitle
      :title="title"
      :subtitle="subtitle"
    />

    <form
      class="space-y-5"
      novalidate
      @submit.prevent="submit"
    >
      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            for="manual-latitude"
            class="mb-2 block text-sm font-medium text-slate-300"
          >
            Vĩ độ
          </label>
          <input
            id="manual-latitude"
            v-model="lat"
            type="text"
            inputmode="decimal"
            autocomplete="off"
            placeholder="Ví dụ: 10.7769"
            class="w-full rounded-xl border bg-slate-950 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-600 focus:ring-2 focus:ring-sky-500/40 disabled:cursor-not-allowed disabled:opacity-60"
            :class="touched.lat && latError ? 'border-rose-500/80' : 'border-slate-700 focus:border-sky-500'"
            :disabled="submitting"
            :aria-invalid="touched.lat && Boolean(latError)"
            :aria-describedby="touched.lat && latError ? 'manual-latitude-error' : undefined"
            @blur="touched.lat = true"
          >
          <p
            v-if="touched.lat && latError"
            id="manual-latitude-error"
            class="mt-2 text-sm text-rose-400"
          >
            {{ latError }}
          </p>
        </div>

        <div>
          <label
            for="manual-longitude"
            class="mb-2 block text-sm font-medium text-slate-300"
          >
            Kinh độ
          </label>
          <input
            id="manual-longitude"
            v-model="lng"
            type="text"
            inputmode="decimal"
            autocomplete="off"
            placeholder="Ví dụ: 106.7009"
            class="w-full rounded-xl border bg-slate-950 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-600 focus:ring-2 focus:ring-sky-500/40 disabled:cursor-not-allowed disabled:opacity-60"
            :class="touched.lng && lngError ? 'border-rose-500/80' : 'border-slate-700 focus:border-sky-500'"
            :disabled="submitting"
            :aria-invalid="touched.lng && Boolean(lngError)"
            :aria-describedby="touched.lng && lngError ? 'manual-longitude-error' : undefined"
            @blur="touched.lng = true"
          >
          <p
            v-if="touched.lng && lngError"
            id="manual-longitude-error"
            class="mt-2 text-sm text-rose-400"
          >
            {{ lngError }}
          </p>
        </div>
      </div>

      <button
        type="submit"
        class="w-full rounded-xl bg-sky-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        :disabled="!isValid || submitting"
      >
        {{ submitting ? 'Đang tải dữ liệu bầu trời...' : 'Dùng tọa độ này' }}
      </button>
    </form>
  </SkyCard>
</template>
