import { readonly, ref, shallowRef, type Ref, type ShallowRef } from 'vue'
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

  function refreshVoices() {
    if (!supported) return
    voices.value = japaneseVoices(window.speechSynthesis.getVoices())
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
    // Les voix arrivent souvent de façon asynchrone après le premier appel.
    window.speechSynthesis.addEventListener('voiceschanged', refreshVoices)
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

  return {
    supported,
    speaking: readonly(speaking),
    voices: readonly(voices) as Readonly<ShallowRef<SpeechSynthesisVoice[]>>,
    lastError: readonly(lastError),
    speak,
    stop,
  }
}

export function useSpeech(): SpeechApi {
  shared ??= create()
  return shared
}
