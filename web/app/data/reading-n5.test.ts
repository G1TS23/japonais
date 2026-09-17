import { describe, expect, it } from 'vitest'
import { READING_N5 } from './reading-n5'

const HAS_KANJI = /[㐀-䶿一-龯]/

describe('banque READING_N5', () => {
  it('a des ids uniques, tous préfixés n5-', () => {
    const ids = READING_N5.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id.startsWith('n5-'), id).toBe(true)
  })

  it('remplit les champs obligatoires de chaque texte', () => {
    for (const t of READING_N5) {
      expect(t.titre.length, t.id).toBeGreaterThan(0)
      expect(t.resume.length, t.id).toBeGreaterThan(0)
      expect(t.corps.length, t.id).toBeGreaterThan(0)
      expect(t.vocabCle.length, t.id).toBeGreaterThan(0)
    }
  })

  it('donne une lecture à tout segment contenant un kanji', () => {
    for (const t of READING_N5) {
      for (const [i, sentence] of t.corps.entries()) {
        for (const seg of sentence) {
          if (HAS_KANJI.test(seg.text)) {
            expect(seg.reading?.length, `${t.id} phrase ${i} : « ${seg.text} » sans lecture`).toBeGreaterThan(0)
          }
        }
      }
    }
  })

  it('ne donne une lecture qu’en kana (pas de kanji dans `reading`)', () => {
    for (const t of READING_N5) {
      for (const sentence of t.corps) {
        for (const seg of sentence) {
          if (seg.reading) expect(HAS_KANJI.test(seg.reading), `${t.id} : « ${seg.reading} »`).toBe(false)
        }
      }
    }
  })

  it('aucune phrase vide', () => {
    for (const t of READING_N5) {
      for (const sentence of t.corps) expect(sentence.length, t.id).toBeGreaterThan(0)
    }
  })
})
