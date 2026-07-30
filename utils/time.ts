export function resolveObservationTime(time?: string): Date {
  return time === undefined ? new Date() : new Date(time)
}

export function toIsoTimestamp(date: Date | null): string | null {
  return date?.toISOString() ?? null
}
