import type { Coordinates } from '../../types/location'
import type {
  MeteorEventDetail,
  MeteorShowerEvent,
  MeteorUpcomingCard
} from '../../types/meteor'
import { getShowerDefinition } from './catalog'
import { moonConditionsAt } from './moon'
import {
  bestDirectionAtPeak,
  bestObservationTimeLabel,
  computeMeteorVisibilityScore,
  getRadiantHorizontal
} from './visibility'

function formatDateLabel(iso: string): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(iso))
}

function formatTimeLabel(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  }).format(new Date(iso))
}

export function formatActivePeriodLabel(event: MeteorShowerEvent): string {
  return `${formatDateLabel(event.activeStart)} – ${formatDateLabel(event.activeEnd)}`
}

export function buildUpcomingCard(
  event: MeteorShowerEvent,
  coords: Coordinates | null
): MeteorUpcomingCard {
  const def = getShowerDefinition(event.id)
  const peakAt = new Date(event.peakAt)
  const moon = moonConditionsAt(peakAt)

  let visibilityScore = null
  let bestDirection = null

  if (coords) {
    const { altitude } = getRadiantHorizontal(def, coords.lat, coords.lng, peakAt)
    visibilityScore = computeMeteorVisibilityScore({
      altitudeDeg: altitude,
      interference: moon.interference,
      zhr: event.zhr
    })
    bestDirection = bestDirectionAtPeak(def, coords.lat, coords.lng, peakAt)
  }

  return {
    id: event.id,
    name: event.name,
    activePeriodLabel: formatActivePeriodLabel(event),
    peakDateLabel: formatDateLabel(event.peakAt),
    peakTimeLabel: formatTimeLabel(event.peakAt),
    peakAt: event.peakAt,
    expectedMeteorsPerHour: event.zhr,
    moonIlluminationPct: moon.illuminationPct,
    moonInterference: moon.interference,
    visibilityScore,
    bestObservationTimeLabel: bestObservationTimeLabel(
      def,
      coords?.lat ?? null,
      coords?.lng ?? null,
      peakAt
    ),
    bestDirection,
    difficulty: event.difficulty
  }
}

export function buildEventDetail(event: MeteorShowerEvent): MeteorEventDetail {
  const def = getShowerDefinition(event.id)
  return {
    id: event.id,
    name: event.name,
    description: def.description,
    originConstellation: def.originConstellation,
    radiantRaHours: def.radiantRaHours,
    radiantDecDeg: def.radiantDecDeg,
    expectedSpeedKmS: def.speedKmS,
    parentComet: def.parentComet,
    peakDurationHours: def.peakDurationHours,
    peakAt: event.peakAt,
    activeStart: event.activeStart,
    activeEnd: event.activeEnd,
    zhr: event.zhr,
    visibilityMap: {
      status: 'unavailable',
      message: 'Bản đồ tầm nhìn sẽ có ở phiên bản sau.'
    }
  }
}
