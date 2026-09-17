import { describe, expect, it } from 'vitest'
import type { ReadingText } from '~/data/reading-n5'
import { findReadingText, fullText, sentenceText } from './reading'

const SAMPLE: ReadingText = {
  id: 'n5-test',
  palier: 'N5',
  titre: 'Test',
  resume: 'Texte de test.',
  vocabCle: ['食べる'],
  corps: [
    [{ text: '私', reading: 'わたし' }, { text: 'は' }, { text: '学生', reading: 'がくせい' }, { text: 'です。' }],
    [{ text: '毎日', reading: 'まいにち' }, { text: '勉強します', reading: 'べんきょうします', lookup: '勉強する' }, { text: '。' }],
  ],
}

describe('sentenceText', () => {
  it('concatène le texte affiché des segments, sans les lectures', () => {
    expect(sentenceText(SAMPLE.corps[0]!)).toBe('私は学生です。')
  })
})

describe('fullText', () => {
  it('concatène toutes les phrases du texte', () => {
    expect(fullText(SAMPLE)).toBe('私は学生です。毎日勉強します。')
  })
})

describe('findReadingText', () => {
  it('trouve un texte par id', () => {
    expect(findReadingText('n5-test', [SAMPLE])?.titre).toBe('Test')
  })

  it('renvoie undefined sans correspondance', () => {
    expect(findReadingText('inconnu', [SAMPLE])).toBeUndefined()
  })
})
