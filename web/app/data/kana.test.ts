import { describe, expect, it } from 'vitest'
import { KANA, kanaChar, matchesRomaji } from './kana'

describe('jeu de données kana', () => {
  it('contient 104 mores (46 base + 20 dakuten + 5 handakuten + 33 yōon)', () => {
    expect(KANA.length).toBe(104)
  })

  it("n'a aucun caractère hiragana ou katakana en double", () => {
    const hira = KANA.map((k) => k.hira)
    const kata = KANA.map((k) => k.kata)
    expect(new Set(hira).size).toBe(hira.length)
    expect(new Set(kata).size).toBe(kata.length)
  })

  it('a des champs hira / kata / romaji non vides pour chaque entrée', () => {
    for (const k of KANA) {
      expect(k.hira, `hira manquant pour romaji=${k.romaji}`).toBeTruthy()
      expect(k.kata, `kata manquant pour romaji=${k.romaji}`).toBeTruthy()
      expect(k.romaji, `romaji manquant pour hira=${k.hira}`).toBeTruthy()
    }
  })

  it('couvre les 4 groupes', () => {
    expect(new Set(KANA.map((k) => k.group))).toEqual(new Set(['base', 'dakuten', 'handakuten', 'yoon']))
  })

  it('kanaChar renvoie le bon caractère selon le script', () => {
    const a = KANA.find((k) => k.romaji === 'a')!
    expect(kanaChar(a, 'hiragana')).toBe('あ')
    expect(kanaChar(a, 'katakana')).toBe('ア')
  })

  it('matchesRomaji accepte le romaji principal et les alternatives, rejette le reste', () => {
    const shi = KANA.find((k) => k.hira === 'し')!
    expect(matchesRomaji(shi, 'shi')).toBe(true)
    expect(matchesRomaji(shi, 'si')).toBe(true) // alternative déclarée
    expect(matchesRomaji(shi, 'chi')).toBe(false)
  })

  it('matchesRomaji ignore la casse et les espaces superflus', () => {
    const a = KANA.find((k) => k.romaji === 'a')!
    expect(matchesRomaji(a, '  A  ')).toBe(true)
  })
})
