import { getCurrentInstance, onUnmounted, ref } from 'vue'
import type { DevicePointing, GuidanceMode } from '../../types/telescope'

type PointingMode = Extract<GuidanceMode, 'manual' | 'sensor'>

type OrientationEvent = DeviceOrientationEvent & {
  webkitCompassHeading?: number
}

type OrientationConstructor = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>
}

const DEFAULT_POINTING: DevicePointing = {
  azimuth: 0,
  altitude: 30,
  source: 'manual'
}

function isOrientationSupported(): boolean {
  return typeof window !== 'undefined' && typeof window.DeviceOrientationEvent !== 'undefined'
}

/** Normalize degrees into [0, 360). */
function normalizeAzimuth(deg: number): number {
  return ((deg % 360) + 360) % 360
}

/**
 * Absolute compass heading (CW from north).
 * Prefer iOS `webkitCompassHeading`; else convert W3C `alpha` (CCW) via `(360 - alpha) % 360`.
 */
function headingFromEvent(event: OrientationEvent): number {
  if (typeof event.webkitCompassHeading === 'number') {
    return normalizeAzimuth(event.webkitCompassHeading)
  }
  return normalizeAzimuth(360 - (event.alpha ?? 0))
}

function clampAltitude(beta: number | null): number {
  return Math.min(90, Math.max(-90, beta ?? 0))
}

export function useDevicePointing() {
  const pointing = ref<DevicePointing>({ ...DEFAULT_POINTING })
  const mode = ref<PointingMode>('manual')
  const sensorAvailable = ref(isOrientationSupported())
  const sensorError = ref<string | null>(null)
  let listening = false

  function onOrientation(event: DeviceOrientationEvent) {
    pointing.value = {
      azimuth: headingFromEvent(event as OrientationEvent),
      altitude: clampAltitude(event.beta),
      source: 'sensor'
    }
    mode.value = 'sensor'
  }

  function disableSensor() {
    if (listening && typeof window !== 'undefined') {
      window.removeEventListener('deviceorientation', onOrientation)
    }
    listening = false
  }

  function fallbackToManual(error: string) {
    disableSensor()
    mode.value = 'manual'
    pointing.value = { ...pointing.value, source: 'manual' }
    sensorError.value = error
  }

  function setManualPointing({ azimuth, altitude }: { azimuth: number; altitude: number }) {
    disableSensor()
    mode.value = 'manual'
    pointing.value = { azimuth, altitude, source: 'manual' }
  }

  async function enableSensor() {
    sensorError.value = null
    sensorAvailable.value = isOrientationSupported()

    if (!sensorAvailable.value) {
      fallbackToManual('Device orientation is not supported by this browser.')
      return
    }

    try {
      const DOE = window.DeviceOrientationEvent as OrientationConstructor
      if (typeof DOE.requestPermission === 'function') {
        const permission = await DOE.requestPermission()
        if (permission !== 'granted') {
          fallbackToManual('Device orientation permission was denied.')
          return
        }
      }

      if (!listening) {
        window.addEventListener('deviceorientation', onOrientation)
        listening = true
      }
      mode.value = 'sensor'
    } catch {
      fallbackToManual('Failed to enable device orientation.')
    }
  }

  if (getCurrentInstance()) {
    onUnmounted(disableSensor)
  }

  return {
    pointing,
    mode,
    sensorAvailable,
    sensorError,
    setManualPointing,
    enableSensor,
    disableSensor
  }
}
