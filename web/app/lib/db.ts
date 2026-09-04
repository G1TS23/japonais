import Dexie, { type Table } from 'dexie'

// --- Types des enregistrements ---------------------------------------------

export type CardState = 'new' | 'learning' | 'review' | 'relearning'

/** Carte de vocabulaire pilotée par FSRS (champs FSRS ajoutés à l'étape 3). */
export interface Card {
  id: string
  terme: string
  lecture: string
  sens_fr: string
  sens_fr_source: 'jmdict' | 'manuel'
  sens_en: string
  exemple_jp?: string
  exemple_fr?: string
  nature?: string
  tags: string[]
  // Champs FSRS (placeholders tant que le moteur n'est pas branché)
  state: CardState
  due: number // timestamp ms ; 0 = jamais planifiée
  stability?: number
  difficulty?: number
  reps: number
  lapses: number
  last_review?: number
  suspendue: boolean
  created_at: number
}

export interface ReviewLog {
  id: string
  cardId: string
  rating: 1 | 2 | 3 | 4 // Again / Hard / Good / Easy
  state: CardState
  elapsed_ms: number
  scheduled_days: number
  ts: number
}

export interface KanaStat {
  kana: string
  type: 'hiragana' | 'katakana'
  seen: number
  correct: number
  last_seen: number
  streak: number
}

export interface QuizAttempt {
  id: string
  palier: string
  themes: string[]
  score: number
  total: number
  missed: string[]
  ts: number
}

/** Paires clé/valeur : états de cases du programme, dates de jalons, etc. */
export interface ProgressEntry {
  key: string
  value: unknown
  updated_at: number
}

export interface StudyLogEntry {
  date: string // AAAA-MM-JJ
  minutes_actives: number
  minutes_immersion: number
  note?: string
}

export interface SettingEntry {
  key: string
  value: unknown
}

export interface MetaEntry {
  key: string
  value: unknown
}

// --- Base -----------------------------------------------------------------

export class JaponaisDB extends Dexie {
  cards!: Table<Card, string>
  reviewLogs!: Table<ReviewLog, string>
  kanaStats!: Table<KanaStat, string>
  quizAttempts!: Table<QuizAttempt, string>
  progress!: Table<ProgressEntry, string>
  studyLog!: Table<StudyLogEntry, string>
  settings!: Table<SettingEntry, string>
  meta!: Table<MetaEntry, string>

  constructor() {
    super('japonais')
    this.version(1).stores({
      cards: '&id, terme, state, due, suspendue, *tags',
      reviewLogs: '&id, cardId, ts',
      kanaStats: '&kana, type',
      quizAttempts: '&id, palier, ts',
      progress: '&key',
      studyLog: '&date',
      settings: '&key',
      meta: '&key',
    })
  }
}

/** Ordre stable des tables — utilisé par l'export/import. */
export const TABLE_NAMES = [
  'cards',
  'reviewLogs',
  'kanaStats',
  'quizAttempts',
  'progress',
  'studyLog',
  'settings',
  'meta',
] as const

export type TableName = (typeof TABLE_NAMES)[number]

let _db: JaponaisDB | null = null

/** Instance unique, créée à la première demande (côté client uniquement). */
export function getDb(): JaponaisDB {
  if (!_db) _db = new JaponaisDB()
  return _db
}

export function uid(): string {
  return globalThis.crypto?.randomUUID?.() ?? `id_${Date.now()}_${Math.random().toString(36).slice(2)}`
}
