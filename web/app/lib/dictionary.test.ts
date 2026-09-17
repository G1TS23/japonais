import { describe, expect, it } from 'vitest'
import { DICTIONARY, type DictionaryEntry } from '~/data/dictionary'
import { lookupExact, searchDictionary } from './dictionary'

describe('DICTIONARY (données générées)', () => {
  it('a des ids uniques et des champs obligatoires remplis', () => {
    const ids = new Set<string>()
    for (const e of DICTIONARY) {
      expect(ids.has(e.id), `id dupliqué : ${e.id}`).toBe(false)
      ids.add(e.id)
      expect(e.reading.length).toBeGreaterThan(0)
      expect(e.gloss.length).toBeGreaterThan(0)
    }
  })

  it('couvre plusieurs milliers de mots', () => {
    expect(DICTIONARY.length).toBeGreaterThan(10000)
  })

  it('contient des mots N5 courants', () => {
    expect(DICTIONARY.some((e) => e.kanji === '食べる')).toBe(true)
    expect(DICTIONARY.some((e) => e.reading === 'ありがとう')).toBe(true)
  })
})

const BANK: DictionaryEntry[] = [
  { id: '1', kanji: '食べる', reading: 'たべる', common: true, gloss: 'manger' },
  { id: '2', kanji: '食べ物', reading: 'たべもの', common: true, gloss: 'nourriture, aliment' },
  { id: '3', reading: 'たべすぎ', gloss: 'excès de nourriture' },
  { id: '4', kanji: '飲む', reading: 'のむ', common: true, gloss: 'boire' },
  { id: '5', kanji: '高い', reading: 'たかい', common: true, gloss: 'cher ; haut, élevé' },
  { id: '6', kanji: '高価', reading: 'こうか', gloss: 'coûteux, de valeur' },
]

describe('searchDictionary', () => {
  it("renvoie une liste vide pour une requête vide", () => {
    expect(searchDictionary('', BANK)).toEqual([])
    expect(searchDictionary('   ', BANK)).toEqual([])
  })

  it('trouve une correspondance exacte en japonais (kanji ou lecture)', () => {
    expect(searchDictionary('食べる', BANK).map((e) => e.id)).toEqual(['1'])
    expect(searchDictionary('たべる', BANK).map((e) => e.id)).toEqual(['1'])
  })

  it('classe exact > préfixe > sous-texte, mots courants d’abord dans chaque groupe', () => {
    // "食べ" : rien d'exact, "食べる"/"食べ物" en préfixe (tous deux courants),
    // "たべすぎ" n'a pas "食べ" (pas de kanji) donc absent ici.
    const ids = searchDictionary('食べ', BANK).map((e) => e.id)
    expect(ids).toEqual(['1', '2'])
  })

  it('recherche en français, insensible à la casse et aux accents', () => {
    expect(searchDictionary('manger', BANK).map((e) => e.id)).toEqual(['1'])
    expect(searchDictionary('MANGER', BANK).map((e) => e.id)).toEqual(['1'])
    expect(searchDictionary('coute', BANK).map((e) => e.id)).toContain('6') // coûteux
  })

  it('respecte la limite demandée', () => {
    expect(searchDictionary('たべ', BANK, 1)).toHaveLength(1)
  })

  it('ne renvoie rien si aucune entrée ne correspond', () => {
    expect(searchDictionary('zzzzz', BANK)).toEqual([])
  })
})

describe('lookupExact', () => {
  it('trouve une entrée par kanji ou par lecture exacte', () => {
    expect(lookupExact('食べる', BANK).map((e) => e.id)).toEqual(['1'])
    expect(lookupExact('たかい', BANK).map((e) => e.id)).toEqual(['5'])
  })

  it('renvoie une liste vide sans correspondance', () => {
    expect(lookupExact('存在しない', BANK)).toEqual([])
  })
})
