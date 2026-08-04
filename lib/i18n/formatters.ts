function asDate(value: Date | string | number): Date {
  return value instanceof Date ? value : new Date(value)
}

export function formatDate(value: Date | string | number, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(asDate(value))
}

export function formatTime(value: Date | string | number, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit'
  }).format(asDate(value))
}

export function formatWeekday(value: Date | string | number, locale: string): string {
  return new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(asDate(value))
}

export function formatMonth(value: Date | string | number, locale: string): string {
  return new Intl.DateTimeFormat(locale, { month: 'long' }).format(asDate(value))
}

export function formatDateTime(value: Date | string | number, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(asDate(value))
}

export function formatNumber(
  value: number,
  locale: string,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, options).format(value)
}
