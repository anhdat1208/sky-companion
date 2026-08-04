import {
  formatDate as formatDatePure,
  formatDateTime as formatDateTimePure,
  formatMonth as formatMonthPure,
  formatNumber as formatNumberPure,
  formatTime as formatTimePure,
  formatWeekday as formatWeekdayPure
} from '../../lib/i18n/formatters'

function resolveIntlLocale(code: string): string {
  if (code === 'vi') return 'vi-VN'
  if (code === 'en') return 'en-US'
  return code
}

export function useFormatters() {
  const { locale } = useI18n()

  const intlLocale = computed(() => resolveIntlLocale(locale.value))

  return {
    formatDate: (value: Date | string | number) => formatDatePure(value, intlLocale.value),
    formatTime: (value: Date | string | number) => formatTimePure(value, intlLocale.value),
    formatWeekday: (value: Date | string | number) => formatWeekdayPure(value, intlLocale.value),
    formatMonth: (value: Date | string | number) => formatMonthPure(value, intlLocale.value),
    formatDateTime: (value: Date | string | number) => formatDateTimePure(value, intlLocale.value),
    formatNumber: (value: number, options?: Intl.NumberFormatOptions) =>
      formatNumberPure(value, intlLocale.value, options)
  }
}
