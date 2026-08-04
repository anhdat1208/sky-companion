import type {
  DateCursorHook,
  LightPollutionHook,
  WeatherPhotoHook
} from '../../types/photo'

export function emptyWeatherHook(): WeatherPhotoHook {
  return {
    cloudCoverPct: null,
    windMps: null,
    humidityPct: null,
    seeing: null,
    transparency: null
  }
}

export function emptyLightPollutionHook(): LightPollutionHook {
  return { bortleClass: null, source: null }
}

export function emptyDateCursorHook(): DateCursorHook {
  return { viewedNightStart: null }
}
