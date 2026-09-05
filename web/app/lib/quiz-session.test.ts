import { beforeEach, describe, expect, it } from 'vitest'
import { reactive } from 'vue'
import { QUIZ_N5 } from '~/data/quiz-n5'
import { getDb } from './db'
import {
  buildQuiz,
  buildVocabQuestions,
  poolSize,
  recentQuizAttempts,
  recordQuizAttempt,
  shuffleOptions,
} from './quiz-session'

beforeEach(async () => {
  await getDb().quizAttempts.clear()
})

describe('banque QUIZ_N5', () => {
  it('a des ids uniques', () => {
    const ids = QUIZ_N5.map((q) => q.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('chaque question a un index de réponse valide et au moins 3 options', () => {
    for (const q of QUIZ_N5) {
      expect(q.options.length).toBeGreaterThanOrEqual(3)
      expect(q.answer).toBeGreaterThanOrEqual(0)
      expect(q.answer).toBeLessThan(q.options.length)
      expect(q.explanation.length).toBeGreaterThan(0)
    }
  })

  it('n’a pas d’options dupliquées au sein d’une question', () => {
    for (const q of QUIZ_N5) {
      expect(new Set(q.options).size, q.id).toBe(q.options.length)
    }
  })
})

describe('shuffleOptions', () => {
  it('conserve la bonne réponse après mélange', () => {
    for (const q of QUIZ_N5) {
      const s = shuffleOptions(q)
      expect(s.options[s.answer]).toBe(q.options[q.answer])
      expect(new Set(s.options)).toEqual(new Set(q.options))
    }
  })
})

describe('buildVocabQuestions', () => {
  it('génère le nombre demandé, chaque question ayant 4 options dont la bonne', () => {
    const qs = buildVocabQuestions(15, 'fr')
    expect(qs).toHaveLength(15)
    for (const q of qs) {
      expect(q.theme).toBe('vocabulaire')
      expect(q.options).toHaveLength(4)
      expect(q.options[q.answer]).toBeDefined()
      expect(new Set(q.options).size).toBe(4)
    }
  })
})

describe('buildQuiz', () => {
  it('ne tire que des questions des thèmes choisis', () => {
    const qs = buildQuiz({ themes: ['particules'], length: 'all' })
    expect(qs.length).toBeGreaterThan(0)
    expect(qs.every((q) => q.theme === 'particules')).toBe(true)
  })

  it('respecte la longueur demandée', () => {
    const qs = buildQuiz({ themes: ['particules', 'grammaire', 'vocabulaire'], length: 10 })
    expect(qs).toHaveLength(10)
  })

  it('mélange les options (recalcule answer)', () => {
    const qs = buildQuiz({ themes: ['grammaire'], length: 'all' })
    for (const q of qs) expect(q.options[q.answer]).toBeDefined()
  })
})

describe('poolSize', () => {
  it('somme les questions rédigées des thèmes + 40 pour le vocabulaire', () => {
    const particules = QUIZ_N5.filter((q) => q.theme === 'particules').length
    expect(poolSize(['particules'])).toBe(particules)
    expect(poolSize(['particules', 'vocabulaire'])).toBe(particules + 40)
  })
})

describe('recordQuizAttempt', () => {
  it('accepte des tableaux réactifs Vue sans DataCloneError', async () => {
    // Reproduit l'appel réel : quiz.vue passe `themes.value` (un ref Vue).
    const themes = reactive(['particules', 'grammaire'])
    await expect(
      recordQuizAttempt({ palier: 'n5', themes, score: 5, total: 10, missed: reactive(['p-wa']) }),
    ).resolves.toBeUndefined()
    const rows = await recentQuizAttempts()
    expect(rows[0]?.themes).toEqual(['particules', 'grammaire'])
    expect(Array.isArray(rows[0]?.missed)).toBe(true)
  })

  it('enregistre une tentative et la relit, plus récente en premier', async () => {
    await recordQuizAttempt(
      { palier: 'n5', themes: ['particules'], score: 7, total: 10, missed: ['p-wa'] },
      new Date('2026-02-01T10:00:00Z'),
    )
    await recordQuizAttempt(
      { palier: 'n5', themes: ['grammaire'], score: 9, total: 10, missed: [] },
      new Date('2026-02-02T10:00:00Z'),
    )
    const rows = await recentQuizAttempts()
    expect(rows).toHaveLength(2)
    expect(rows[0]?.score).toBe(9)
    expect(rows[1]?.missed).toEqual(['p-wa'])
  })
})
