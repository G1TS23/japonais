import { readonly, ref, shallowRef, type Ref, type ShallowRef } from 'vue'
import { pickJapaneseVoice } from '~/lib/speech'

/**
 * Synthèse vocale japonaise via l'API Web Speech native (zéro dépendance).
 * État partagé pour toute l'appli : une seule voix résolue, un seul flag
 * `speaking` (une lecture à la fois de toute façon).
 */

interface SpeechApi {
  supported: boolean
  speaking: Readonly<Ref<boolean>>
  voice: Readonly<ShallowRef<SpeechSynthesisVoice | null>>
  lastError: Readonly<Ref<string | null>>
  speak: (text: string, opts?: { rate?: number }) => void
  stop: () => void
}

let shared: SpeechApi | null = null

function create(): SpeechApi {
  const supported =
    typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window

  const speaking = ref(false)
  const lastError = ref<string | null>(null)
  const voice = shallowRef<SpeechSynthesisVoice | null>(null)

  function refreshVoice() {
    if (!supported) return
    voice.value = pickJapaneseVoice(window.speechSynthesis.getVoices())
  }

  // Contournement du bug Chrome : la synthèse se met en pause toute seule au
  // bout de ~15 s et peut rester « figée ». Tant qu'on est censé parler, on la
  // relance périodiquement.
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
    refreshVoice()
    // Les voix arrivent souvent de façon asynchrone après le premier appel.
    window.speechSynthesis.addEventListener('voiceschanged', refreshVoice)
  }

  function speak(text: string, opts: { rate?: number } = {}) {
    if (!supported || !text.trim()) return
    const synth = window.speechSynthesis
    lastError.value = null

    // Tout doit rester synchrone dans le geste utilisateur, sinon Chrome
    // bloque la lecture (politique d'activation). cancel() est sans risque ;
    // resume() débloque un moteur figé par une lecture précédente.
    try {
      synth.cancel()
    } catch {
      /* ignore */
    }
    synth.resume()

    if (!voice.value) refreshVoice()

    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'ja-JP'
    if (voice.value) u.voice = voice.value
    u.rate = opts.rate ?? 0.95
    u.onstart = () => {
      speaking.value = true
      startKeepAlive()
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
    voice: readonly(voice) as Readonly<ShallowRef<SpeechSynthesisVoice | null>>,
    lastError: readonly(lastError),
    speak,
    stop,
  }
}

export function useSpeech(): SpeechApi {
  if (!shared) shared = create()
  return shared
}
