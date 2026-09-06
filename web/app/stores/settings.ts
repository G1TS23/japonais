import { defineStore } from 'pinia'
import { getDb } from '~/lib/db'

export type ThemePref = 'system' | 'light' | 'dark'
export type SensLang = 'fr' | 'en'

/** Clé du miroir de préférence de thème lu par le script anti-flash du <head>. */
const THEME_MIRROR_KEY = 'japonais:theme'

function mirrorTheme(pref: ThemePref) {
  try {
    localStorage.setItem(THEME_MIRROR_KEY, pref)
  } catch {
    // localStorage indisponible (mode privé strict) : le thème s'appliquera
    // quand même après hydratation, sans plus.
  }
}

export interface AppSettings {
  newCardsPerDay: number
  retention: number
  theme: ThemePref
  sensLang: SensLang
}

const DEFAULTS: AppSettings = {
  newCardsPerDay: 10,
  retention: 0.9,
  theme: 'system',
  sensLang: 'fr',
}

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    loaded: false,
    values: { ...DEFAULTS } as AppSettings,
  }),
  actions: {
    async load() {
      if (this.loaded) return
      const rows = await getDb().settings.toArray()
      const stored = Object.fromEntries(rows.map((r) => [r.key, r.value]))
      this.values = { ...DEFAULTS, ...stored } as AppSettings
      this.loaded = true
      mirrorTheme(this.values.theme)
    },
    async set<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
      this.values[key] = value
      if (key === 'theme') mirrorTheme(value as ThemePref)
      await getDb().settings.put({ key, value })
    },
    async resetToDefaults() {
      this.values = { ...DEFAULTS }
      mirrorTheme(this.values.theme)
      await getDb().settings.bulkPut(
        (Object.keys(DEFAULTS) as (keyof AppSettings)[]).map((key) => ({ key, value: DEFAULTS[key] })),
      )
    },
  },
})
