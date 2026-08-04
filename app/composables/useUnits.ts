import type { UnitSystem } from '../../types/units'
import {
  celsiusToFahrenheit,
  kmhToMph,
  kmToMiles
} from '../../lib/units/convert'

const STORAGE_KEY = 'sky_companion_units'

function canUseLocalStorage(): boolean {
  return import.meta.client || typeof localStorage !== 'undefined'
}

function readStoredUnitSystem(): UnitSystem {
  if (!canUseLocalStorage()) {
    return 'metric'
  }
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw === 'imperial' ? 'imperial' : 'metric'
}

export function useUnits() {
  const { t } = useI18n()
  const unitSystem = useState<UnitSystem>('sky-companion-units', () => readStoredUnitSystem())

  function setUnitSystem(system: UnitSystem): void {
    unitSystem.value = system
    if (canUseLocalStorage()) {
      localStorage.setItem(STORAGE_KEY, system)
    }
  }

  function formatDistanceFromKm(km: number): string {
    if (unitSystem.value === 'imperial') {
      return `${kmToMiles(km).toFixed(1)} ${t('units.mi')}`
    }
    return `${Math.round(km)} ${t('units.km')}`
  }

  function formatSpeedFromKmh(kmh: number): string {
    if (unitSystem.value === 'imperial') {
      return `${Math.round(kmhToMph(kmh))} ${t('units.mph')}`
    }
    return `${Math.round(kmh)} ${t('units.kmh')}`
  }

  function formatTemperatureFromC(c: number): string {
    if (unitSystem.value === 'imperial') {
      return `${Math.round(celsiusToFahrenheit(c))} ${t('units.fahrenheit')}`
    }
    return `${Math.round(c)} ${t('units.celsius')}`
  }

  return {
    unitSystem,
    setUnitSystem,
    formatDistanceFromKm,
    formatSpeedFromKmh,
    formatTemperatureFromC
  }
}
