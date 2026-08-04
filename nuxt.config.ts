export default defineNuxtConfig({
  compatibilityDate: '2026-07-30',
  devtools: { enabled: true },
  css: ['~/assets/css/tailwind.css'],
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss'],
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
