import { describe, expect, it } from 'vitest'
import { hasJapanese, japaneseVoices, pickJapaneseVoice, resolveJapaneseVoice } from './speech'

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
    const local = voice({ lang: 'ja-JP', name: 'Voix système', localService: true })
    expect(pickJapaneseVoice([remote, local])).toBe(local)
  })

  it('privilégie fortement une voix connue-fiable (Kyoko) sur les autres', () => {
    const neural = voice({ lang: 'ja-JP', name: 'Eddy', localService: true, default: true })
    const kyoko = voice({ lang: 'ja-JP', name: 'Kyoko', localService: true })
    expect(pickJapaneseVoice([neural, kyoko])).toBe(kyoko)
  })

  it('à défaut de voix connue, prend la voix système par défaut', () => {
    const plain = voice({ lang: 'ja-JP', name: 'Voix A', localService: true })
    const def = voice({ lang: 'ja-JP', name: 'Voix B', localService: true, default: true })
    expect(pickJapaneseVoice([plain, def])).toBe(def)
  })
})

describe('japaneseVoices', () => {
  it('ne garde que le japonais, trié du plus fiable au moins', () => {
    const en = voice({ lang: 'en-US', name: 'Alex' })
    const eddy = voice({ lang: 'ja-JP', name: 'Eddy', localService: true })
    const kyoko = voice({ lang: 'ja-JP', name: 'Kyoko', localService: true })
    const got = japaneseVoices([en, eddy, kyoko])
    expect(got.map((v) => v.name)).toEqual(['Kyoko', 'Eddy'])
  })
})

describe('resolveJapaneseVoice', () => {
  const kyoko = voice({ lang: 'ja-JP', name: 'Kyoko', localService: true })
  const eddy = voice({ lang: 'ja-JP', name: 'Eddy', localService: true })

  it('renvoie la voix nommée si elle est présente', () => {
    expect(resolveJapaneseVoice([kyoko, eddy], 'Eddy')).toBe(eddy)
  })

  it('retombe sur le choix automatique si le nom est absent ou vide', () => {
    expect(resolveJapaneseVoice([kyoko, eddy], 'Introuvable')).toBe(kyoko)
    expect(resolveJapaneseVoice([kyoko, eddy], '')).toBe(kyoko)
    expect(resolveJapaneseVoice([kyoko, eddy], null)).toBe(kyoko)
  })
})
