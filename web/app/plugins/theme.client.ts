import { watch } from 'vue'
import { useSettingsStore } from '~/stores/settings'
import type { ThemePref } from '~/stores/settings'

/**
 * Applique le thème : pose `data-theme="light|dark"` sur <html>.
 * « system » suit prefers-color-scheme et réagit à ses changements.
 */
export default defineNuxtPlugin(async () => {
  const settings = useSettingsStore()
  await settings.load()

  const media = window.matchMedia('(prefers-color-scheme: dark)')

  const resolve = (pref: ThemePref) => {
    if (pref !== 'system') return pref
    return media.matches ? 'dark' : 'light'
  }

  const apply = () => {
    document.documentElement.dataset.theme = resolve(settings.values.theme)
  }

  apply()
  watch(() => settings.values.theme, apply)
  media.addEventListener('change', () => {
    if (settings.values.theme === 'system') apply()
  })
})
