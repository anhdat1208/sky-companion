import type {
  NightWindow,
  PhotoTimeline,
  TimeRange,
  TimelineMarker,
  TimelineMarkerKind,
  BlueHourInfo,
  GoldenHourInfo,
  TwilightInfo
} from '../../types/photo'

export interface BuildPhotoTimelineArgs {
  window: NightWindow
  golden: GoldenHourInfo
  blue: BlueHourInfo
  twilight: TwilightInfo
  moonrise: string | null
  moonset: string | null
  milkyWayPeak: string | null
  planetMarkerAt: string | null
  planetMarkerEnd: string | null
}

function rangeMarker(
  kind: TimelineMarkerKind,
  label: string,
  range: TimeRange | null
): TimelineMarker | null {
  if (!range) return null
  if (new Date(range.end).getTime() <= new Date(range.start).getTime()) return null
  return { kind, label, at: range.start, end: range.end }
}

function instantMarker(
  kind: TimelineMarkerKind,
  label: string,
  at: string | null,
  end: string | null = null
): TimelineMarker | null {
  if (!at) return null
  return { kind, label, at, end }
}

export function buildPhotoTimeline(args: BuildPhotoTimelineArgs): PhotoTimeline {
  const markers: TimelineMarker[] = []

  for (const range of [args.golden.evening, args.golden.morning]) {
    const m = rangeMarker('golden-hour', 'Giờ vàng', range)
    if (m) markers.push(m)
  }

  for (const range of [args.blue.evening, args.blue.morning]) {
    const m = rangeMarker('blue-hour', 'Giờ xanh', range)
    if (m) markers.push(m)
  }

  const astro = args.twilight.astronomical
  if (astro.evening?.end && astro.morning?.start) {
    const at = astro.evening.end
    const end = astro.morning.start
    if (new Date(end).getTime() > new Date(at).getTime()) {
      markers.push({
        kind: 'dark-sky',
        label: 'Trời tối',
        at,
        end
      })
    }
  }

  const moonrise = instantMarker('moonrise', 'Mặt Trăng mọc', args.moonrise)
  if (moonrise) markers.push(moonrise)

  const moonset = instantMarker('moonset', 'Mặt Trăng lặn', args.moonset)
  if (moonset) markers.push(moonset)

  const mwPeak = instantMarker('milky-way-peak', 'Đỉnh Ngân Hà', args.milkyWayPeak)
  if (mwPeak) markers.push(mwPeak)

  if (args.planetMarkerAt) {
    markers.push({
      kind: 'planet-visibility',
      label: 'Hành tinh nổi',
      at: args.planetMarkerAt,
      end: args.planetMarkerEnd
    })
  }

  markers.sort(
    (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime()
  )

  return { window: args.window, markers }
}
