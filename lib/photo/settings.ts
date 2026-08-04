import type {
  CameraSettings,
  CameraSubject,
  ConditionModifiers
} from '../../types/photo'

const TABLES: Record<CameraSubject, CameraSettings> = {
  'milky-way': {
    iso: { min: 1600, max: 6400 },
    aperture: 'f/1.4–f/2.8',
    exposureTime: '10–25s',
    focalLengthMm: { min: 14, max: 24 },
    tripodRequired: true,
    remoteShutter: true
  },
  moon: {
    iso: { min: 100, max: 400 },
    aperture: 'f/8–f/11',
    exposureTime: '1/125–1/250s',
    focalLengthMm: { min: 200, max: 600 },
    tripodRequired: true,
    remoteShutter: true
  },
  planet: {
    iso: { min: 400, max: 1600 },
    aperture: 'f/10–f/16',
    exposureTime: '1/60–1/250s',
    focalLengthMm: { min: 1000, max: 2000 },
    tripodRequired: true,
    remoteShutter: true
  },
  'golden-hour': {
    iso: { min: 100, max: 400 },
    aperture: 'f/8–f/11',
    exposureTime: '1/60–1/250s',
    focalLengthMm: { min: 24, max: 70 },
    tripodRequired: false,
    remoteShutter: false
  },
  'blue-hour': {
    iso: { min: 200, max: 800 },
    aperture: 'f/4–f/8',
    exposureTime: '1–8s',
    focalLengthMm: { min: 16, max: 35 },
    tripodRequired: true,
    remoteShutter: true
  }
}

/** `modifiers` accepted for future use; ignored in v1. */
export function getCameraSettings(
  subject: CameraSubject,
  _modifiers?: ConditionModifiers
): CameraSettings {
  return { ...TABLES[subject], iso: { ...TABLES[subject].iso }, focalLengthMm: { ...TABLES[subject].focalLengthMm } }
}

export function lensLabelFromSettings(
  settings: CameraSettings,
  kind: 'wide' | 'tele' | 'planet'
): string {
  const { min, max } = settings.focalLengthMm
  if (kind === 'wide') return `${min}–${max}mm wide`
  if (kind === 'planet') return `${min}–${max}mm (tele / scope)`
  return `${min}–${max}mm tele`
}
