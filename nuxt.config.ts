export default defineNuxtConfig({
  compatibilityDate: '2026-07-30',
  devtools: { enabled: true },
  css: ['~/assets/css/tailwind.css'],
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss', '@nuxtjs/i18n'],
  i18n: {
    locales: [
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
      { code: 'vi', language: 'vi-VN', name: 'Tiếng Việt', file: 'vi.json' }
    ],
    defaultLocale: 'en',
    strategy: 'no_prefix',
    langDir: '../locales',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'sky_companion_locale',
      redirectOn: 'root',
      fallbackLocale: 'en'
    }
  },
  typescript: {
    strict: true,
    typeCheck: true
  },
  runtimeConfig: {
    skyAIProvider: 'gemini',
    openaiApiKey: '',
    openaiModel: 'gpt-4.1-mini',
    geminiApiKey: '',
    geminiModel: 'gemini-1.5-flash',
    public: {
      mapboxToken: ''
    }
  }
})
