import { describe, expect, it } from 'vitest'
import type { KanjiStrokes } from '~/data/kanji-strokes'
import { findKanjiStrokes, sortedByComplexity } from './kanji'

const BANK: KanjiStrokes[] = [{ kanji: '一', strokes: ['M10,50 L90,50'] }]

describe('findKanjiStrokes', () => {
  it('trouve un kanji par son caractère', () => {
    expect(findKanjiStrokes('一', BANK)?.strokes).toEqual(['M10,50 L90,50'])
  })

  it('renvoie undefined sans correspondance', () => {
    expect(findKanjiStrokes('存', BANK)).toBeUndefined()
  })
})

describe('sortedByComplexity', () => {
  it('trie du moins de traits au plus de traits, sans muter la banque', () => {
    const bank: KanjiStrokes[] = [
      { kanji: '三', strokes: ['a', 'b', 'c'] },
      { kanji: '一', strokes: ['a'] },
      { kanji: '二', strokes: ['a', 'b'] },
    ]
    expect(sortedByComplexity(bank).map((k) => k.kanji)).toEqual(['一', '二', '三'])
    expect(bank.map((k) => k.kanji)).toEqual(['三', '一', '二'])
  })
})
