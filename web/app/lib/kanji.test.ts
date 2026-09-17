import { describe, expect, it } from 'vitest'
import type { KanjiStrokes } from '~/data/kanji-strokes'
import { findKanjiStrokes } from './kanji'

const BANK: KanjiStrokes[] = [{ kanji: '一', strokes: ['M10,50 L90,50'] }]

describe('findKanjiStrokes', () => {
  it('trouve un kanji par son caractère', () => {
    expect(findKanjiStrokes('一', BANK)?.strokes).toEqual(['M10,50 L90,50'])
  })

  it('renvoie undefined sans correspondance', () => {
    expect(findKanjiStrokes('存', BANK)).toBeUndefined()
  })
})
