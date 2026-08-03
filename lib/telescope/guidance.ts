// lib/telescope/guidance.ts
import type {
  DevicePointing,
  FieldOfView,
  GuidanceInstruction
} from '../../types/telescope'
import { lockThresholdDeg } from './profiles'

function normalizeDeltaAzimuth(delta: number): number {
  let value = ((delta + 180) % 360 + 360) % 360 - 180
  if (value === -180) {
    value = 180
  }
  return Math.round(value * 10) / 10
}

function round1(value: number): number {
  return Math.round(value * 10) / 10
}

export function buildGuidanceInstruction(input: {
  targetAltitude: number | null
  targetAzimuth: number | null
  pointing: DevicePointing | null
  fieldOfView: FieldOfView
}): GuidanceInstruction {
  if (
    input.targetAltitude === null
    || input.targetAzimuth === null
    || input.pointing === null
  ) {
    return {
      status: 'need-target',
      deltaAzimuthDeg: 0,
      deltaAltitudeDeg: 0,
      messages: ['Chọn một mục tiêu để bắt đầu căn chỉnh.'],
      locked: false
    }
  }

  if (input.targetAltitude < 0) {
    return {
      status: 'below-horizon',
      deltaAzimuthDeg: 0,
      deltaAltitudeDeg: 0,
      messages: ['Mục tiêu đang dưới chân trời — chưa quan sát được.'],
      locked: false
    }
  }

  const deltaAzimuthDeg = normalizeDeltaAzimuth(
    input.targetAzimuth - input.pointing.azimuth
  )
  const deltaAltitudeDeg = round1(input.targetAltitude - input.pointing.altitude)
  const threshold = lockThresholdDeg(input.fieldOfView.trueFovDeg)
  const locked =
    Math.abs(deltaAzimuthDeg) <= threshold
    && Math.abs(deltaAltitudeDeg) <= threshold

  if (locked) {
    return {
      status: 'locked',
      deltaAzimuthDeg,
      deltaAltitudeDeg,
      messages: ['Target Locked', 'Đã khóa mục tiêu'],
      locked: true
    }
  }

  const messages: string[] = []
  if (Math.abs(deltaAzimuthDeg) > threshold) {
    const degrees = Math.abs(deltaAzimuthDeg).toFixed(0)
    messages.push(
      deltaAzimuthDeg < 0
        ? `Xoay trái ${degrees}°`
        : `Xoay phải ${degrees}°`
    )
  }
  if (Math.abs(deltaAltitudeDeg) > threshold) {
    const degrees = Math.abs(deltaAltitudeDeg).toFixed(0)
    messages.push(
      deltaAltitudeDeg > 0
        ? `Nâng ống kính ${degrees}°`
        : `Hạ ống kính ${degrees}°`
    )
  }

  return {
    status: 'aligning',
    deltaAzimuthDeg,
    deltaAltitudeDeg,
    messages,
    locked: false
  }
}
