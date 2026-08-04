import { getMoonInfo } from '../moon'
import type { MoonPhotoInfo, NightWindow } from '../../types/photo'
import { getCameraSettings, lensLabelFromSettings } from './settings'

const SAMPLE_STEP_MS = 20 * 60 * 1000
const CRATER_ILLUM_MIN = 30
const CRATER_ILLUM_MAX = 70
const CRATER_ALT_MIN = 15
const MOONRISE_ILLUM_MIN = 50

function findCraterPhotographyTime(
  lat: number,
  lng: number,
  night: NightWindow
): string | null {
  const startMs = new Date(night.sunset).getTime()
  const endMs = new Date(night.sunrise).getTime()
  if (!(endMs > startMs)) return null

  for (let t = startMs; t <= endMs; t += SAMPLE_STEP_MS) {
    const sampleWhen = new Date(t)
    const moon = getMoonInfo(lat, lng, sampleWhen)
    const illum = moon.illuminatedPercentage
    if (
      illum >= CRATER_ILLUM_MIN &&
      illum <= CRATER_ILLUM_MAX &&
      moon.altitude >= CRATER_ALT_MIN
    ) {
      return sampleWhen.toISOString()
    }
  }

  return null
}

function resolveBestPhotographyTime(
  lat: number,
  lng: number,
  night: NightWindow | null,
  moonrise: string | null,
  illuminationPct: number
): string | null {
  if (night) {
    const craterTime = findCraterPhotographyTime(lat, lng, night)
    if (craterTime) return craterTime
  }

  if (illuminationPct >= MOONRISE_ILLUM_MIN && moonrise) {
    return moonrise
  }

  return null
}

export function buildMoonPhotoInfo(
  lat: number,
  lng: number,
  when: Date,
  night: NightWindow | null
): MoonPhotoInfo {
  const settings = getCameraSettings('moon')
  const recommendedLensLabel = lensLabelFromSettings(settings, 'tele')
  const moon = getMoonInfo(lat, lng, when)

  const bestPhotographyTime = resolveBestPhotographyTime(
    lat,
    lng,
    night,
    moon.riseTime,
    moon.illuminatedPercentage
  )

  return {
    moonrise: moon.riseTime,
    moonset: moon.setTime,
    phase: moon.phase,
    illuminationPct: moon.illuminatedPercentage,
    bestPhotographyTime,
    recommendedLensLabel,
    settings
  }
}
