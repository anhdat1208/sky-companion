import type { IssBrightness, IssPassPrediction, IssSnapshot } from '../../types/iss'
import { computeCurrentBrightness } from './brightness'
import { buildGroundTrack } from './groundTrack'
import { findNextVisiblePass } from './passes'
import { propagateIss } from './propagate'
import { getIssTle } from './tle'

export async function buildIssSnapshot(options?: {
  lat?: number
  lng?: number
  when?: Date
  getTle?: typeof getIssTle
}): Promise<IssSnapshot> {
  const when = options?.when ?? new Date()
  const { tle, source } = await (options?.getTle ?? getIssTle)()
  const position = propagateIss(tle, when)
  const groundTrack = buildGroundTrack(tle, when)

  let nextPass: IssPassPrediction | null = null
  let brightness: IssBrightness | null = null
  if (options?.lat !== undefined && options?.lng !== undefined) {
    nextPass = findNextVisiblePass(tle, { lat: options.lat, lng: options.lng }, when)
    brightness = computeCurrentBrightness(tle, options.lat, options.lng, when)
  }

  return {
    position,
    groundTrack,
    nextPass,
    brightness,
    tleEpoch: tle.epoch,
    source
  }
}
