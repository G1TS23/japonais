import { READING_N5, type ReadingSentence, type ReadingText } from '~/data/reading-n5'

export { READING_N5 }
export type { ReadingSentence, ReadingText }

export function findReadingText(id: string, bank: ReadingText[] = READING_N5): ReadingText | undefined {
  return bank.find((t) => t.id === id)
}

/** Texte brut d'une phrase (segments concaténés), pour l'audio. */
export function sentenceText(sentence: ReadingSentence): string {
  return sentence.map((s) => s.text).join('')
}

/** Texte brut de l'ensemble du corps, pour l'audio du texte entier. */
export function fullText(text: ReadingText): string {
  return text.corps.map(sentenceText).join('')
}
