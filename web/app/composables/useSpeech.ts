import { computed, readonly, ref, shallowRef, type Ref, type ShallowRef } from 'vue'
import { japaneseVoices, resolveJapaneseVoice, speechText } from '~/lib/speech'
import { useSettingsStore } from '~/stores/settings'

/**
 * Synthèse vocale japonaise via l'API Web Speech native (zéro dépendance).
 * État partagé pour toute l'appli : liste de voix, flag `speaking` (une lecture
 * à la fois de toute façon).
 */

interface SpeakOpts {
  rate?: number
  /** Nom de voix à forcer ; par défaut celle des réglages, sinon auto. */
  voiceName?: string
}

interface SpeechApi {
  supported: boolean
  speaking: Readonly<Ref<boolean>>
  /** Voix japonaises disponibles, de la plus fiable à la moins. */
  voices: Readonly<ShallowRef<SpeechSynthesisVoice[]>>
  /** true une fois la liste des voix du navigateur chargée (arrivée async). */
  voicesReady: Readonly<Ref<boolean>>
  /** L'appareil a-t-il une voix japonaise ? (indéterminé tant que !voicesReady) */
  hasJapaneseVoice: Readonly<Ref<boolean>>
  lastError: Readonly<Ref<string | null>>
  speak: (text: string, opts?: SpeakOpts) => void
  stop: () => void
}

let shared: SpeechApi | null = null

function create(): SpeechApi {
  const supported =
    typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window

  const speaking = ref(false)
  const lastError = ref<string | null>(null)
  const voices = shallowRef<SpeechSynthesisVoice[]>([])
  const voicesReady = ref(false)

  function refreshVoices() {
    if (!supported) return
    const all = window.speechSynthesis.getVoices()
    voices.value = japaneseVoices(all)
    if (all.length) voicesReady.value = true
  }

  // Contournement du bug Chrome : la synthèse se met en pause toute seule au
  // bout de ~15 s et peut rester « figée ». Tant qu'on est censé parler, on la
  // relance périodiquement (seulement pour les longs textes).
  let keepAlive: ReturnType<typeof setInterval> | null = null
  function startKeepAlive() {
    stopKeepAlive()
    keepAlive = setInterval(() => {
      const synth = window.speechSynthesis
      if (synth.speaking) synth.resume()
      else stopKeepAlive()
    }, 5000)
  }
  function stopKeepAlive() {
    if (keepAlive) clearInterval(keepAlive)
    keepAlive = null
  }

  if (supported) {
    refreshVoices()
    // Les voix arrivent de façon asynchrone. On écoute 'voiceschanged' (pas
    // toujours émis) ET on re-sonde getVoices() toutes les 250 ms : on s'arrête
    // dès qu'on a des voix, sinon on abandonne au bout de ~4 s.
    window.speechSynthesis.addEventListener('voiceschanged', refreshVoices)
    let tries = 0
    const poll = setInterval(() => {
      refreshVoices()
      if (voices.value.length || window.speechSynthesis.getVoices().length || ++tries >= 16) {
        clearInterval(poll)
        voicesReady.value = true
      }
    }, 250)
  } else {
    voicesReady.value = true
  }

  function speak(rawText: string, opts: SpeakOpts = {}) {
    const text = speechText(rawText)
    if (!supported || !text) return
    const synth = window.speechSynthesis
    const settings = useSettingsStore()
    lastError.value = null

    // Rester synchrone dans le geste utilisateur (politique d'activation
    // Chrome). Ne débloquer que si réellement en pause, et ne couper que pour
    // interrompre une lecture en cours : un cancel()+speak() synchrone quand
    // rien ne joue fait « avaler » l'utterance (bug Chrome).
    if (synth.paused) synth.resume()
    if (synth.speaking || synth.pending) synth.cancel()

    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'ja-JP'
    u.rate = opts.rate ?? settings.values.audioRate ?? 0.85
    // Voix résolue sur la liste FRAÎCHE de ce tick : une référence de voix
    // périmée fait échouer speak() en silence sur certaines versions de Chrome.
    const wanted = opts.voiceName ?? settings.values.audioVoice
    const v = resolveJapaneseVoice(synth.getVoices(), wanted)
    if (v) u.voice = v

    u.onstart = () => {
      speaking.value = true
      if (text.length > 30) startKeepAlive()
    }
    u.onend = () => {
      speaking.value = false
      stopKeepAlive()
    }
    u.onerror = (e) => {
      speaking.value = false
      stopKeepAlive()
      if (e.error && e.error !== 'interrupted' && e.error !== 'canceled') {
        lastError.value = e.error
        console.warn('[speech]', e.error)
      }
    }

    synth.speak(u)
  }

  function stop() {
    if (supported) window.speechSynthesis.cancel()
    speaking.value = false
    stopKeepAlive()
  }

  const hasJapaneseVoice = computed(() => !voicesReady.value || voices.value.length > 0)

  return {
    supported,
    speaking: readonly(speaking),
    voices: readonly(voices) as Readonly<ShallowRef<SpeechSynthesisVoice[]>>,
    voicesReady: readonly(voicesReady),
    hasJapaneseVoice,
    lastError: readonly(lastError),
    speak,
    stop,
  }
}

export function useSpeech(): SpeechApi {
  shared ??= create()
  return shared
}
