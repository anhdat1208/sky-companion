import type {
  MoonCalendarDay,
  MoonDayDetail,
  MoonTodaySnapshot
} from '../../types/moon'
import {
  illuminatedPercentage,
  moonAgeDays,
  moonPhaseAngleDeg,
  moonPhaseIconKey,
  moonPhaseName
} from './phase'
import {
  getMoonAngularDiameterDeg,
  getMoonDistanceKm,
  getMoonHorizontal,
  getMoonRiseSet
} from './position'
import { buildPhotographyGuide } from './photography'
import { computeObservationScore } from './score'

export function toDateISO(year: number, month: number, day: number): string {
  const m = String(month).padStart(2, '0')
  const d = String(day).padStart(2, '0')
  return `${year}-${m}-${d}`
}

function localNoon(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day, 12, 0, 0, 0)
}

function parseDateISO(dateISO: string): { year: number; month: number; day: number } {
  const [y, m, d] = dateISO.split('-').map(Number)
  return { year: y!, month: m!, day: d! }
}

function sameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate()
  )
}

function buildDayCell(
  lat: number,
  lng: number,
  year: number,
  month: number,
  day: number,
  viewedYear: number,
  viewedMonth: number,
  now: Date
): MoonCalendarDay {
  const when = localNoon(year, month, day)
  const phaseAngle = moonPhaseAngleDeg(when)
  const { riseTime, setTime } = getMoonRiseSet(lat, lng, when)
  return {
    dateISO: toDateISO(year, month, day),
    phase: moonPhaseName(phaseAngle),
    iconKey: moonPhaseIconKey(phaseAngle),
    illuminatedPercentage: illuminatedPercentage(when),
    riseTime,
    setTime,
    isToday: sameLocalDay(when, now),
    inCurrentMonth: year === viewedYear && month === viewedMonth
  }
}

export function buildMonthCalendar(
  lat: number,
  lng: number,
  year: number,
  month: number,
  now: Date
): MoonCalendarDay[] {
  const first = new Date(year, month - 1, 1)
  // JS: 0=Sun … 6=Sat → Monday-start offset
  const weekday = (first.getDay() + 6) % 7
  const gridStart = new Date(year, month - 1, 1 - weekday)
  const days: MoonCalendarDay[] = []

  for (let i = 0; i < 42; i += 1) {
    const cursor = new Date(
      gridStart.getFullYear(),
      gridStart.getMonth(),
      gridStart.getDate() + i
    )
    days.push(
      buildDayCell(
        lat,
        lng,
        cursor.getFullYear(),
        cursor.getMonth() + 1,
        cursor.getDate(),
        year,
        month,
        now
      )
    )
  }

  // Trim trailing week if entirely outside month (keep 35 when possible)
  const lastWeek = days.slice(35)
  if (lastWeek.every(d => !d.inCurrentMonth)) {
    return days.slice(0, 35)
  }
  return days
}

export function buildMoonDayDetail(
  lat: number,
  lng: number,
  year: number,
  month: number,
  day: number,
  now: Date
): MoonDayDetail {
  const when = localNoon(year, month, day)
  const phaseAngle = moonPhaseAngleDeg(when)
  const { altitude, azimuth } = getMoonHorizontal(lat, lng, when)
  const { riseTime, setTime } = getMoonRiseSet(lat, lng, when)
  const illum = illuminatedPercentage(when)
  const distanceKm = getMoonDistanceKm(when)

  const cell = buildDayCell(lat, lng, year, month, day, year, month, now)

  return {
    ...cell,
    phaseAngleDeg: phaseAngle,
    ageDays: moonAgeDays(phaseAngle),
    altitude,
    azimuth,
    distanceKm,
    angularDiameterDeg: getMoonAngularDiameterDeg(distanceKm),
    observationScore: computeObservationScore(altitude, phaseAngle, illum),
    photography: buildPhotographyGuide(illum, riseTime)
  }
}

export function buildMoonDayDetailFromISO(
  lat: number,
  lng: number,
  dateISO: string,
  now: Date
): MoonDayDetail {
  const { year, month, day } = parseDateISO(dateISO)
  return buildMoonDayDetail(lat, lng, year, month, day, now)
}

export function buildMoonTodaySnapshot(
  lat: number,
  lng: number,
  when: Date
): MoonTodaySnapshot {
  const phaseAngle = moonPhaseAngleDeg(when)
  const { altitude, azimuth } = getMoonHorizontal(lat, lng, when)
  const { riseTime, setTime } = getMoonRiseSet(lat, lng, when)
  const distanceKm = getMoonDistanceKm(when)

  return {
    timestamp: when.toISOString(),
    phase: moonPhaseName(phaseAngle),
    iconKey: moonPhaseIconKey(phaseAngle),
    phaseAngleDeg: phaseAngle,
    illuminatedPercentage: illuminatedPercentage(when),
    ageDays: moonAgeDays(phaseAngle),
    riseTime,
    setTime,
    altitude,
    azimuth,
    distanceKm,
    angularDiameterDeg: getMoonAngularDiameterDeg(distanceKm)
  }
}
