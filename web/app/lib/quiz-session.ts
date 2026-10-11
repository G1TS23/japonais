import { COUNTERS, numberReading, type CounterEntry } from '~/data/numbers'
import { QUIZ_N5, type QuizQuestion, type QuizTheme } from '~/data/quiz-n5'
import { VOCAB_N5, type VocabEntry } from '~/data/vocab'
import { getDb, uid, type QuizAttempt } from './db'
import { buildClozeSeeds } from './grammar-cloze'

export type { QuizQuestion, QuizTheme }

export const THEMES: { value: QuizTheme; label: string }[] = [
  { value: 'particules', label: 'Particules' },
  { value: 'grammaire', label: 'Grammaire' },
  { value: 'vocabulaire', label: 'Vocabulaire' },
  { value: 'chiffres', label: 'Chiffres' },
]

function shuffle<T>(arr: T[]): T[] {
  const r = arr.slice()
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)) // NOSONAR — mélange de quiz, pas un usage cryptographique
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
    // L'énoncé et la « bonne réponse » portent déjà le terme et le sens ; la
    // seule info à ajouter dans le récap est la lecture (rien si le mot est
    // déjà en kana).
    const reading = entry.lecture !== entry.terme ? `Lecture : ${entry.lecture}` : ''

    if (jpToSens) {
      const options = shuffle([sens(entry, lang), ...distractors.map((d) => sens(d, lang))])
      return {
        id: `v-${entry.content_id}-s`,
        theme: 'vocabulaire',
        prompt: entry.terme,
        hint: entry.lecture !== entry.terme ? entry.lecture : undefined,
        options,
        answer: options.indexOf(sens(entry, lang)),
        explanation: reading,
      }
    }

    const options = shuffle([entry.terme, ...distractors.map((d) => d.terme)])
    return {
      id: `v-${entry.content_id}-t`,
      theme: 'vocabulaire',
      prompt: `Quel mot signifie « ${sens(entry, lang)} » ?`,
      options,
      answer: options.indexOf(entry.terme),
      explanation: reading,
    }
  })
}

/**
 * Questions QCM générées depuis les cartes « phrase à trou » de catégorie
 * « particules » (`data/grammar-n5.ts`). Les particules forment un petit pool
 * fermé où n'importe laquelle est un distracteur plausible pour n'importe
 * quelle autre — sûr à générer automatiquement. Les autres catégories de
 * grammaire (verbes, adjectifs…) restent hors de cette génération : leurs
 * distracteurs demandent une curation par point (formes conjuguées liées
 * entre elles), déjà couverte à la main dans `data/quiz-n5.ts`.
 */
export function buildGrammarParticleQuestions(): QuizQuestion[] {
  const seeds = buildClozeSeeds().filter((s) => s.categorie === 'particules')
  const answers = [...new Set(seeds.map((s) => s.answer))]

  return seeds.map((s) => {
    const distractors = shuffle(answers.filter((a) => a !== s.answer)).slice(0, 3)
    const options = shuffle([s.answer, ...distractors])
    return {
      id: `q-${s.contentId}`.replaceAll(':', '-'),
      theme: 'particules',
      prompt: s.cloze,
      options,
      answer: options.indexOf(s.answer),
      explanation: s.sens,
    }
  })
}

interface CounterItem {
  counter: CounterEntry
  n: number
  term: string
  reading: string
}

/** Un item par compteur × lecture 1–10 (`data/numbers.ts`), terme = chiffre kanji + suffixe du compteur. */
function counterItems(): CounterItem[] {
  const items: CounterItem[] = []
  for (const counter of COUNTERS) {
    const suffix = counter.kanji.replace('〜', '')
    counter.readings.forEach((reading, i) => {
      const n = i + 1
      items.push({ counter, n, term: numberReading(n).kanji + suffix, reading })
    })
  }
  return items
}

/** Nombres cardinaux couvrant les pièges de lecture (dizaines, centaines, milliers, 万), pour varier le pool. */
const CARDINAL_SAMPLES = [
  7, 14, 23, 47, 56, 68, 79, 90, 100, 200, 300, 456, 600, 700, 800, 900, 1000, 2500, 3000, 3800, 6000, 8000, 9999,
]

/**
 * Pool complet de questions « chiffres », trois formes : compteur+nombre →
 * lecture, lecture → compteur+nombre, nombre cardinal → lecture. Distracteurs
 * tirés d'un pool de valeurs uniques (évite les doublons d'options entre
 * 〜回/〜階, qui partagent leurs lectures).
 */
function numberQuestionPool(): QuizQuestion[] {
  const items = counterItems()
  const uniqueReadings = [...new Set(items.map((i) => i.reading))]
  const uniqueTerms = [...new Set(items.map((i) => i.term))]
  const pool: QuizQuestion[] = []

  shuffle(items).forEach((item, i) => {
    if (i % 2 === 0) {
      const distractors = shuffle(uniqueReadings.filter((r) => r !== item.reading)).slice(0, 3)
      const options = shuffle([item.reading, ...distractors])
      pool.push({
        id: `c-${item.counter.id}-${item.n}-r`,
        theme: 'chiffres',
        prompt: item.term,
        options,
        answer: options.indexOf(item.reading),
        explanation: item.counter.label,
      })
    } else {
      const distractors = shuffle(uniqueTerms.filter((t) => t !== item.term)).slice(0, 3)
      const options = shuffle([item.term, ...distractors])
      pool.push({
        id: `c-${item.counter.id}-${item.n}-t`,
        theme: 'chiffres',
        prompt: item.reading,
        options,
        answer: options.indexOf(item.term),
        explanation: item.counter.label,
      })
    }
  })

  const uniqueCardinalReadings = CARDINAL_SAMPLES.map((n) => numberReading(n).kana)
  CARDINAL_SAMPLES.forEach((n) => {
    const r = numberReading(n)
    const distractors = shuffle(uniqueCardinalReadings.filter((k) => k !== r.kana)).slice(0, 3)
    const options = shuffle([r.kana, ...distractors])
    pool.push({
      id: `c-cardinal-${n}`,
      theme: 'chiffres',
      prompt: r.kanji,
      options,
      answer: options.indexOf(r.kana),
      explanation: `${n}`,
    })
  })

  return pool
}

/** Questions « chiffres » générées à la volée (voir `numberQuestionPool`). */
export function buildNumberQuestions(count: number): QuizQuestion[] {
  return shuffle(numberQuestionPool()).slice(0, count)
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

  if (config.themes.includes('particules')) {
    pool.push(...buildGrammarParticleQuestions())
  }

  if (config.themes.includes('vocabulaire')) {
    const vocabCount = config.length === 'all' ? 40 : Math.max(config.length, 20)
    pool.push(...buildVocabQuestions(vocabCount, config.lang ?? 'fr'))
  }

  if (config.themes.includes('chiffres')) {
    const numberCount = config.length === 'all' ? numberQuestionPool().length : Math.max(config.length, 20)
    pool.push(...buildNumberQuestions(numberCount))
  }

  const shuffled = shuffle(pool).map(shuffleOptions)
  return config.length === 'all' ? shuffled : shuffled.slice(0, config.length)
}

export function poolSize(themes: QuizTheme[], handAuthored: QuizQuestion[] = QUIZ_N5): number {
  let n = handAuthored.filter((q) => themes.includes(q.theme)).length
  if (themes.includes('particules')) n += buildGrammarParticleQuestions().length
  if (themes.includes('vocabulaire')) n += 40
  if (themes.includes('chiffres')) n += numberQuestionPool().length
  return n
}

// --- Persistance ---------------------------------------------------------------

export interface QuizAttemptInput {
  palier: string
  themes: string[]
  score: number
  total: number
  missed: string[]
  missedQuestions: QuizQuestion[]
  durationMs: number
}

export async function recordQuizAttempt(input: QuizAttemptInput, now: Date = new Date()): Promise<void> {
  // Les tableaux/objets viennent de refs Vue (proxies réactifs) : IndexedDB
  // refuse de les cloner tels quels (DataCloneError). Le round-trip JSON
  // produit des structures 100 % simples (les questions ne contiennent que
  // des chaînes / nombres / tableaux de chaînes).
  await getDb().quizAttempts.add({
    id: uid(),
    palier: input.palier,
    themes: [...input.themes],
    score: input.score,
    total: input.total,
    missed: [...input.missed],
    // NOSONAR (S7784) — structuredClone() échoue ici : mêmes restrictions que
    // l'algorithme de clonage structuré d'IndexedDB sur les proxies Vue (voir
    // commentaire ci-dessus). Le round-trip JSON contourne le problème.
    missedQuestions: JSON.parse(JSON.stringify(input.missedQuestions)) as QuizQuestion[],
    durationMs: input.durationMs,
    ts: now.getTime(),
  })
}

export async function recentQuizAttempts(limit = 20) {
  return getDb().quizAttempts.orderBy('ts').reverse().limit(limit).toArray()
}

// --- Statistiques ------------------------------------------------------------

const THEME_BY_PREFIX: Record<string, QuizTheme> = { p: 'particules', g: 'grammaire', v: 'vocabulaire', c: 'chiffres' }

/** Thème d'une question déduit du préfixe de son id (`p-…`, `g-…`, `v-…`). */
function themeOfId(id: string): QuizTheme | null {
  return THEME_BY_PREFIX[id.split('-')[0] ?? ''] ?? null
}

export interface QuizStats {
  attempts: number
  totalQuestions: number
  totalCorrect: number
  /** Réussite globale, 0–100. */
  accuracy: number
  /** Meilleur score sur une tentative, 0–100. */
  bestPct: number
  /** Réussite sur les `recentN` dernières tentatives, 0–100. */
  recentAccuracy: number
  /** Nombre de tentatives prises en compte dans `recentAccuracy`. */
  recentCount: number
  /** Durée moyenne par question en ms (tentatives chronométrées uniquement). */
  avgMsPerQuestion: number
  lastTs: number | null
  /** Score % par tentative, ordre chronologique — pour le graphe d'évolution. */
  history: { ts: number; pct: number }[]
  /** Nombre d'erreurs par thème (déduit des ids ratés). */
  errorsByTheme: Record<QuizTheme, number>
  /** Questions les plus souvent ratées, ratées ≥ 2 fois, triées décroissant. */
  toughest: { id: string; prompt: string; theme: QuizTheme | null; misses: number }[]
}

const EMPTY_STATS: QuizStats = {
  attempts: 0,
  totalQuestions: 0,
  totalCorrect: 0,
  accuracy: 0,
  bestPct: 0,
  recentAccuracy: 0,
  recentCount: 0,
  avgMsPerQuestion: 0,
  lastTs: null,
  history: [],
  errorsByTheme: { particules: 0, grammaire: 0, vocabulaire: 0, chiffres: 0 },
  toughest: [],
}

const pct = (correct: number, total: number) => (total ? Math.round((correct / total) * 100) : 0)

/** Agrège toutes les tentatives de quiz en un jeu de statistiques. */
export function summarizeQuizAttempts(attempts: QuizAttempt[], recentN = 5): QuizStats {
  if (!attempts.length) return { ...EMPTY_STATS, errorsByTheme: { ...EMPTY_STATS.errorsByTheme } }

  const sorted = [...attempts].sort((a, b) => a.ts - b.ts)

  const totalQuestions = sorted.reduce((s, a) => s + a.total, 0)
  const totalCorrect = sorted.reduce((s, a) => s + a.score, 0)
  const bestPct = sorted.reduce((m, a) => Math.max(m, pct(a.score, a.total)), 0)

  const recent = sorted.slice(-recentN)
  const recentQ = recent.reduce((s, a) => s + a.total, 0)
  const recentC = recent.reduce((s, a) => s + a.score, 0)

  const timed = sorted.filter((a) => a.durationMs && a.total)
  const timedMs = timed.reduce((s, a) => s + (a.durationMs ?? 0), 0)
  const timedQ = timed.reduce((s, a) => s + a.total, 0)

  const errorsByTheme: Record<QuizTheme, number> = { particules: 0, grammaire: 0, vocabulaire: 0, chiffres: 0 }
  const missCount = new Map<string, number>()
  const promptById = new Map<string, string>()
  for (const q of QUIZ_N5) promptById.set(q.id, q.prompt)

  for (const a of sorted) {
    for (const q of a.missedQuestions ?? []) promptById.set(q.id, q.prompt)
    for (const id of a.missed) {
      const theme = themeOfId(id)
      if (theme) errorsByTheme[theme]++
      missCount.set(id, (missCount.get(id) ?? 0) + 1)
    }
  }

  const toughest = [...missCount.entries()]
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, misses]) => ({ id, prompt: promptById.get(id) ?? id, theme: themeOfId(id), misses }))

  return {
    attempts: sorted.length,
    totalQuestions,
    totalCorrect,
    accuracy: pct(totalCorrect, totalQuestions),
    bestPct,
    recentAccuracy: pct(recentC, recentQ),
    recentCount: recent.length,
    avgMsPerQuestion: timedQ ? Math.round(timedMs / timedQ) : 0,
    lastTs: sorted.at(-1)?.ts ?? null,
    history: sorted.map((a) => ({ ts: a.ts, pct: pct(a.score, a.total) })),
    errorsByTheme,
    toughest,
  }
}

/** Charge toutes les tentatives et renvoie les statistiques agrégées. */
export async function computeQuizStats(recentN = 5): Promise<QuizStats> {
  const attempts = await getDb().quizAttempts.toArray()
  return summarizeQuizAttempts(attempts, recentN)
}
