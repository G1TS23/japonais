/**
 * Notes perso (vocabulaire/grammaire saisis à la main, typiquement depuis un
 * cours) : une note EST une `Card` normale, taguée `perso` — pas de table ni
 * de modèle séparé. Elle entre donc directement dans la file de révision
 * quotidienne existante (`srs-session.ts`), sans rien y changer. Voir le
 * plan posté sur l'issue #21 pour le raisonnement complet.
 */
import { getDb, uid, type Card } from './db'
import { newFsrsFields } from './fsrs'

export const PERSO_TAG = 'perso'

export interface NoteInput {
  type: 'vocab' | 'grammaire'
  /** Vocabulaire : le mot. Grammaire : le titre/la structure (ex. « 〜ながら »). */
  terme: string
  /** Vocabulaire : la lecture. Grammaire : le sens court. */
  lecture: string
  /** Vocabulaire : le sens. Grammaire : l'explication libre. */
  sensFr: string
  exempleJp?: string
  exempleFr?: string
  /** Date de séance (AAAA-MM-JJ), stockée comme tag `seance:AAAA-MM-JJ`. */
  seance?: string
}

function tagsFor(input: NoteInput): string[] {
  const tags = [PERSO_TAG]
  if (input.seance) tags.push(`seance:${input.seance}`)
  return tags
}

function contentFields(input: NoteInput) {
  return {
    kind: input.type === 'grammaire' ? ('perso-note' as const) : undefined,
    terme: input.terme,
    lecture: input.lecture,
    sens_fr: input.sensFr,
    // Pas d'anglais pour une note perso : sens_en (obligatoire, repli si
    // sensLang = 'en') reprend le français, même convention que les cartes
    // de grammaire (`seedGrammarClozeCards`).
    sens_en: input.sensFr,
    sens_fr_source: 'manuel' as const,
    exemple_jp: input.exempleJp,
    exemple_fr: input.exempleFr,
    tags: tagsFor(input),
  }
}

export async function createNote(input: NoteInput, now: Date = new Date()): Promise<void> {
  const card: Card = {
    id: uid(),
    ...contentFields(input),
    suspendue: false,
    created_at: now.getTime(),
    ...newFsrsFields(now),
  }
  await getDb().cards.add(card)
}

/** Met à jour le contenu d'une note existante, sans toucher à sa progression FSRS. */
export async function updateNote(id: string, input: NoteInput): Promise<void> {
  await getDb().cards.update(id, contentFields(input))
}

export async function deleteNote(id: string): Promise<void> {
  await getDb().cards.delete(id)
}
