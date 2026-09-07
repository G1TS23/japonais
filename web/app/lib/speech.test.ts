import { describe, expect, it } from 'vitest'
import { hasJapanese, pickJapaneseVoice } from './speech'

describe('hasJapanese', () => {
  it('détecte hiragana, katakana et kanji', () => {
    expect(hasJapanese('たべる')).toBe(true)
    expect(hasJapanese('テスト')).toBe(true)
    expect(hasJapanese('食べる')).toBe(true)
    expect(hasJapanese('わたし＿＿ がくせいです。')).toBe(true)
  })

  it('renvoie false pour du texte non japonais', () => {
    expect(hasJapanese('Quel mot signifie « manger » ?')).toBe(false)
    expect(hasJapanese('romaji only 123')).toBe(false)
    expect(hasJapanese('')).toBe(false)
  })
})

function voice(over: Partial<SpeechSynthesisVoice>): SpeechSynthesisVoice {
  return {
    lang: 'en-US',
    name: 'Voice',
    default: false,
    localService: false,
    voiceURI: 'x',
    ...over,
  } as SpeechSynthesisVoice
}

describe('pickJapaneseVoice', () => {
  it('renvoie null sans voix japonaise', () => {
    expect(pickJapaneseVoice([voice({ lang: 'en-US' }), voice({ lang: 'fr-FR' })])).toBeNull()
    expect(pickJapaneseVoice([])).toBeNull()
  })

  it('ne retient que les voix japonaises (ja / ja-JP)', () => {
    const jp = voice({ lang: 'ja-JP', name: 'Kyoko' })
    expect(pickJapaneseVoice([voice({ lang: 'en-US' }), jp])).toBe(jp)
  })

  it('préfère une voix locale (hors-ligne) à une voix distante', () => {
    const remote = voice({ lang: 'ja-JP', name: 'Google 日本語' })
    const local = voice({ lang: 'ja-JP', name: 'Hattori', localService: true })
    expect(pickJapaneseVoice([remote, local])).toBe(local)
  })

  it('à service égal, préfère une voix « améliorée » puis la voix par défaut', () => {
    const plain = voice({ lang: 'ja-JP', name: 'Voix A' })
    const enhanced = voice({ lang: 'ja-JP', name: 'Voix B (Enhanced)' })
    expect(pickJapaneseVoice([plain, enhanced])).toBe(enhanced)

    const def = voice({ lang: 'ja-JP', name: 'Voix C', default: true })
    expect(pickJapaneseVoice([plain, def])).toBe(def)
  })
})
