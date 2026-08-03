import type { MoonInfo } from '../../types/astronomy'
import {
  illuminatedPercentage,
  moonPhaseAngleDeg,
  moonPhaseName
} from './phase'
import { getMoonHorizontal, getMoonRiseSet } from './position'

export function getMoonInfo(
  lat: number,
  lng: number,
  when: Date
): MoonInfo {
  const phaseAngle = moonPhaseAngleDeg(when)
  const { altitude, azimuth } = getMoonHorizontal(lat, lng, when)
  const { riseTime, setTime } = getMoonRiseSet(lat, lng, when)

  return {
    altitude,
    azimuth,
    riseTime,
    setTime,
    illuminatedPercentage: illuminatedPercentage(when),
    phase: moonPhaseName(phaseAngle)
  }
}
