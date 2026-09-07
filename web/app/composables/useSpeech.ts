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

  function speak(text: string, opts: { rate?: number } = {}) {
    if (!supported || !text.trim()) return
    const synth = window.speechSynthesis
    synth.cancel() // coupe une lecture en cours avant d'enchaîner
    if (!voice.value) refreshVoice()

    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'ja-JP'
    if (voice.value) u.voice = voice.value
    u.rate = opts.rate ?? 0.95
    u.onstart = () => (speaking.value = true)
    u.onend = () => (speaking.value = false)
    u.onerror = () => (speaking.value = false)
    synth.speak(u)
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
