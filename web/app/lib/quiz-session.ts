import { QUIZ_N5, type QuizQuestion, type QuizTheme } from '~/data/quiz-n5'
import { VOCAB_N5, type VocabEntry } from '~/data/vocab'
import { getDb, uid } from './db'

export type { QuizQuestion, QuizTheme }

export const THEMES: { value: QuizTheme; label: string }[] = [
  { value: 'particules', label: 'Particules' },
  { value: 'grammaire', label: 'Grammaire' },
  { value: 'vocabulaire', label: 'Vocabulaire' },
]

function shuffle<T>(arr: T[]): T[] {
  const r = arr.slice()
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[r[i], r[j]] = [r[j]!, r[i]!]
  }
  return r
}

/** Mélange les options d'une question et recalcule l'index de la bonne réponse. */
export function shuffleOptions(q: QuizQuestion): QuizQuestion {
  const correct = q.options[q.answer]
  const options = shuffle(q.options)
  return { ...q, options, answer: options.indexOf(correct!) }
}

/** Sens à afficher pour une entrée de vocabulaire (repli anglais si le français manque). */
function sens(entry: VocabEntry, lang: 'fr' | 'en'): string {
  if (lang === 'en') return entry.sens_en
  return entry.sens_fr ?? entry.sens_en
}

/**
 * Questions de vocabulaire générées à la volée depuis le deck N5 : sens dans
 * un sens ou dans l'autre, distracteurs tirés d'autres entrées.
 */
export function buildVocabQuestions(
  count: number,
  lang: 'fr' | 'en' = 'fr',
  entries: VocabEntry[] = VOCAB_N5,
): QuizQuestion[] {
  const picked = shuffle(entries).slice(0, count)
  return picked.map((entry, i): QuizQuestion => {
    const distractors = shuffle(entries.filter((e) => e.content_id !== entry.content_id)).slice(0, 3)
    const jpToSens = i % 2 === 0

    if (jpToSens) {
      const options = shuffle([sens(entry, lang), ...distractors.map((d) => sens(d, lang))])
      return {
        id: `v-${entry.content_id}-s`,
        theme: 'vocabulaire',
        prompt: entry.terme,
        hint: entry.lecture !== entry.terme ? entry.lecture : undefined,
        options,
        answer: options.indexOf(sens(entry, lang)),
        explanation: `${entry.terme}（${entry.lecture}）= ${sens(entry, lang)}`,
      }
    }

    const options = shuffle([entry.terme, ...distractors.map((d) => d.terme)])
    return {
      id: `v-${entry.content_id}-t`,
      theme: 'vocabulaire',
      prompt: `Quel mot signifie « ${sens(entry, lang)} » ?`,
      options,
      answer: options.indexOf(entry.terme),
      explanation: `${entry.terme}（${entry.lecture}）= ${sens(entry, lang)}`,
    }
  })
}

export interface QuizConfig {
  themes: QuizTheme[]
  length: number | 'all'
  lang?: 'fr' | 'en'
}

/** Construit la liste de questions d'une session à partir de la config. */
export function buildQuiz(config: QuizConfig, handAuthored: QuizQuestion[] = QUIZ_N5): QuizQuestion[] {
  const pool: QuizQuestion[] = []

  const written = handAuthored.filter((q) => config.themes.includes(q.theme))
  pool.push(...written)

  if (config.themes.includes('vocabulaire')) {
    const vocabCount = config.length === 'all' ? 40 : Math.max(config.length, 20)
    pool.push(...buildVocabQuestions(vocabCount, config.lang ?? 'fr'))
  }

  const shuffled = shuffle(pool).map(shuffleOptions)
  return config.length === 'all' ? shuffled : shuffled.slice(0, config.length)
}

export function poolSize(themes: QuizTheme[], handAuthored: QuizQuestion[] = QUIZ_N5): number {
  let n = handAuthored.filter((q) => themes.includes(q.theme)).length
  if (themes.includes('vocabulaire')) n += 40
  return n
}

// --- Persistance ---------------------------------------------------------------

export interface QuizAttemptInput {
  palier: string
  themes: string[]
  score: number
  total: number
  missed: string[]
}

export async function recordQuizAttempt(input: QuizAttemptInput, now: Date = new Date()): Promise<void> {
  // `input.themes` / `input.missed` viennent souvent de refs Vue : les
  // recopier en tableaux simples, sinon IndexedDB refuse de cloner le proxy
  // (DataCloneError).
  await getDb().quizAttempts.add({
    id: uid(),
    palier: input.palier,
    themes: [...input.themes],
    score: input.score,
    total: input.total,
    missed: [...input.missed],
    ts: now.getTime(),
  })
}

export async function recentQuizAttempts(limit = 10) {
  return getDb().quizAttempts.orderBy('ts').reverse().limit(limit).toArray()
}
