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
  speak: (text: string, opts?: { rate?: number }) => void
  stop: () => void
}

let shared: SpeechApi | null = null

function create(): SpeechApi {
  const supported =
    typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window

  const speaking = ref(false)
  const voice = shallowRef<SpeechSynthesisVoice | null>(null)

  function refreshVoice() {
    if (!supported) return
    voice.value = pickJapaneseVoice(window.speechSynthesis.getVoices())
  }

  if (supported) {
    refreshVoice()
    // Les voix arrivent souvent de façon asynchrone après le premier appel.
    window.speechSynthesis.addEventListener('voiceschanged', refreshVoice)
  }

  function utter(text: string, rate: number) {
    const synth = window.speechSynthesis
    if (!voice.value) refreshVoice()

    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'ja-JP'
    if (voice.value) u.voice = voice.value
    u.rate = rate
    u.onstart = () => (speaking.value = true)
    u.onend = () => (speaking.value = false)
    u.onerror = (e) => {
      speaking.value = false
      if (e.error && e.error !== 'interrupted' && e.error !== 'canceled') {
        console.warn('[speech]', e.error)
      }
    }
    // Chrome met la synthèse en pause après ~15 s et, surtout, peut « figer »
    // le moteur : un resume() est inoffensif si rien n'est en pause et
    // débloque le cas où speak() ne produisait plus rien.
    synth.resume()
    synth.speak(u)
  }

  function speak(text: string, opts: { rate?: number } = {}) {
    if (!supported || !text.trim()) return
    const synth = window.speechSynthesis
    const rate = opts.rate ?? 0.95

    // Un cancel() suivi immédiatement d'un speak() perd parfois l'utterance
    // (bug Chrome). On ne coupe que si une lecture est vraiment en cours, et on
    // diffère le nouveau speak d'un tick.
    if (synth.speaking || synth.pending) {
      synth.cancel()
      window.setTimeout(() => utter(text, rate), 60)
    } else {
      utter(text, rate)
    }
  }

  function stop() {
    if (supported) window.speechSynthesis.cancel()
    speaking.value = false
  }

  return {
    supported,
    speaking: readonly(speaking),
    voice: readonly(voice) as Readonly<ShallowRef<SpeechSynthesisVoice | null>>,
    speak,
    stop,
  }
}

export function useSpeech(): SpeechApi {
  if (!shared) shared = create()
  return shared
}
