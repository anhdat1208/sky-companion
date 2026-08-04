import type { MeteorNotificationHook, MeteorShowerEvent } from '../../types/meteor'

export function buildMeteorNotificationHooks(
  event: MeteorShowerEvent
): MeteorNotificationHook[] {
  const peakMs = Date.parse(event.peakAt)
  const eventId = `${event.id}-${event.year}`

  return [
    {
      eventId,
      showerId: event.id,
      kind: 't-minus-24h',
      fireAt: new Date(peakMs - 24 * 3600 * 1000).toISOString(),
      title: `${event.name}: còn 24 giờ`,
      body: `Đỉnh ${event.name} dự kiến vào ngày mai. Chuẩn bị nơi quan sát tối.`
    },
    {
      eventId,
      showerId: event.id,
      kind: 't-minus-2h',
      fireAt: new Date(peakMs - 2 * 3600 * 1000).toISOString(),
      title: `${event.name}: còn 2 giờ`,
      body: `Đỉnh ${event.name} sắp tới — ra ngoài trước khi peak.`
    },
    {
      eventId,
      showerId: event.id,
      kind: 'peak-started',
      fireAt: new Date(peakMs).toISOString(),
      title: `${event.name}: đang ở đỉnh`,
      body: `Đỉnh ${event.name} bắt đầu. ZHR kỳ vọng ~${event.zhr}/giờ.`
    }
  ]
}
