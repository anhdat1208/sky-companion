type AppLocale = 'en' | 'vi'

export function useAppLocale() {
  const { locale, locales, setLocale } = useI18n()

  async function switchLocale(code: AppLocale): Promise<void> {
    await setLocale(code)
  }

  return {
    locale,
    locales,
    switchLocale
  }
}
