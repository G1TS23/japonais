/**
 * Fine couche au-dessus de `ts-fsrs` : convertit entre notre `Card` Dexie
 * (champs FSRS en nombres/timestamps) et les types de `ts-fsrs` (Date), et
 * expose les deux opérations dont l'app a besoin : prévisualiser les 4
 * intervalles (Again/Hard/Good/Easy) et appliquer une note.
 */
import {
  createEmptyCard,
  fsrs,
  generatorParameters,
  Rating,
  State,
  type Card as FsrsCard,
  type CardInput,
  type Grade,
} from 'ts-fsrs'
import type { Card as DbCard } from './db'

export { Rating, State }
export type { Grade }

export const GRADES: Grade[] = [Rating.Again, Rating.Hard, Rating.Good, Rating.Easy]

/** Champs FSRS d'une carte neuve, à fusionner dans un nouveau `Card` Dexie. */
export function newFsrsFields(now: Date = new Date()) {
  const c = createEmptyCard(now)
  return {
    due: c.due.getTime(),
    stability: c.stability,
    difficulty: c.difficulty,
    elapsed_days: c.elapsed_days,
    scheduled_days: c.scheduled_days,
    learning_steps: c.learning_steps,
    reps: c.reps,
    lapses: c.lapses,
    state: c.state,
    last_review: undefined as number | undefined,
  }
}

function toCardInput(card: DbCard): CardInput {
  return {
    due: card.due,
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsed_days,
    scheduled_days: card.scheduled_days,
    learning_steps: card.learning_steps,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
    last_review: card.last_review ?? null,
  }
}

type FsrsFields = Pick<
  DbCard,
  | 'due'
  | 'stability'
  | 'difficulty'
  | 'elapsed_days'
  | 'scheduled_days'
  | 'learning_steps'
  | 'reps'
  | 'lapses'
  | 'state'
  | 'last_review'
>

function fromFsrsCard(c: FsrsCard): FsrsFields {
  return {
    due: c.due.getTime(),
    stability: c.stability,
    difficulty: c.difficulty,
    elapsed_days: c.elapsed_days,
    scheduled_days: c.scheduled_days,
    learning_steps: c.learning_steps,
    reps: c.reps,
    lapses: c.lapses,
    state: c.state,
    last_review: c.last_review ? c.last_review.getTime() : undefined,
  }
}

function scheduler(retention: number) {
  return fsrs(generatorParameters({ request_retention: retention, enable_fuzz: true }))
}

export interface RatingPreview {
  rating: Grade
  due: number
  intervalLabel: string
}

/** Les 4 issues possibles (Again/Hard/Good/Easy) pour l'écran de révision. */
export function previewRatings(card: DbCard, retention: number, now: Date = new Date()): RatingPreview[] {
  const record = scheduler(retention).repeat(toCardInput(card), now)
  return GRADES.map((rating) => {
    const due = record[rating].card.due
    return { rating, due: due.getTime(), intervalLabel: formatInterval(now, due) }
  })
}

export interface AppliedRating {
  card: FsrsFields
  scheduledDays: number
}

/** Applique la note choisie et renvoie les nouveaux champs FSRS à persister. */
export function applyRating(card: DbCard, retention: number, rating: Grade, now: Date = new Date()): AppliedRating {
  const { card: nextCard, log } = scheduler(retention).next(toCardInput(card), now, rating)
  return { card: fromFsrsCard(nextCard), scheduledDays: log.scheduled_days }
}

/** Formatage court d'un intervalle pour les boutons de notation. */
export function formatInterval(from: Date, to: Date): string {
  const ms = to.getTime() - from.getTime()
  const mins = Math.round(ms / 60_000)
  if (mins < 60) return `${Math.max(1, mins)} min`
  const hours = mins / 60
  if (hours < 24) return `${Math.round(hours)} h`
  const days = hours / 24
  if (days < 30) return `${Math.round(days)} j`
  const months = days / 30.44
  if (months < 12) return `${Math.round(months)} mois`
  return `${(days / 365.25).toFixed(1)} ans`
}
