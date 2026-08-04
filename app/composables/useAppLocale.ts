export function useAppLocale() {
  const { locale, locales, setLocale } = useI18n()

  async function switchLocale(code: string): Promise<void> {
    await setLocale(code)
  }

  return {
    locale,
    locales,
    switchLocale
  }
}
