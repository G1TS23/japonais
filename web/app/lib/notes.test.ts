import { beforeEach, describe, expect, it } from 'vitest'
import { getDb } from './db'
import { getTodayQueue } from './srs-session'
import { createNote, deleteNote, PERSO_TAG, updateNote, type NoteInput } from './notes'

const NOW = new Date('2026-01-10T12:00:00Z')

const VOCAB_INPUT: NoteInput = {
  type: 'vocab',
  terme: '頑張る',
  lecture: 'がんばる',
  sensFr: 'faire des efforts',
}

const GRAMMAIRE_INPUT: NoteInput = {
  type: 'grammaire',
  terme: '〜ながら',
  lecture: 'en faisant à la fois',
  sensFr: 'deux actions simultanées, par la même personne',
  seance: '2026-01-08',
}

beforeEach(async () => {
  const db = getDb()
  await db.cards.clear()
  await db.reviewLogs.clear()
})

describe('createNote', () => {
  it('crée une carte vocabulaire taguée perso', async () => {
    await createNote(VOCAB_INPUT, NOW)
    const [card] = await getDb().cards.toArray()
    expect(card?.kind).toBeUndefined()
    expect(card).toMatchObject({
      terme: '頑張る',
      lecture: 'がんばる',
      sens_fr: 'faire des efforts',
      sens_en: 'faire des efforts',
      sens_fr_source: 'manuel',
      tags: [PERSO_TAG],
      suspendue: false,
    })
  })

  it('crée une carte grammaire (kind perso-note) avec le tag de séance', async () => {
    await createNote(GRAMMAIRE_INPUT, NOW)
    const [card] = await getDb().cards.toArray()
    expect(card).toMatchObject({ kind: 'perso-note', tags: [PERSO_TAG, 'seance:2026-01-08'] })
  })

  it('produit une carte exploitable par la file de révision du jour', async () => {
    await createNote(VOCAB_INPUT, NOW)
    const q = await getTodayQueue(10, NOW, PERSO_TAG)
    expect(q.fresh).toHaveLength(1)
    expect(q.fresh[0]?.terme).toBe('頑張る')
  })

  it("n'apparaît pas dans la file filtrée sur perso si la carte n'est pas taguée perso", async () => {
    const db = getDb()
    await db.cards.add({
      id: 'autre',
      terme: 'X',
      lecture: 'x',
      sens_fr: null,
      sens_fr_source: null,
      sens_en: 'x',
      tags: ['n5'],
      suspendue: false,
      created_at: NOW.getTime(),
      due: NOW.getTime(),
      stability: 0,
      difficulty: 0,
      elapsed_days: 0,
      scheduled_days: 0,
      learning_steps: 0,
      reps: 0,
      lapses: 0,
      state: 0,
    })
    const q = await getTodayQueue(10, NOW, PERSO_TAG)
    expect(q.fresh).toHaveLength(0)
  })
})

describe('updateNote', () => {
  it('met à jour le contenu sans toucher à la progression FSRS', async () => {
    await createNote(VOCAB_INPUT, NOW)
    const [card] = await getDb().cards.toArray()
    await getDb().cards.update(card!.id, { reps: 3 }) // simule une révision déjà faite

    await updateNote(card!.id, { ...VOCAB_INPUT, sensFr: 'persévérer' })

    const updated = await getDb().cards.get(card!.id)
    expect(updated?.sens_fr).toBe('persévérer')
    expect(updated?.reps).toBe(3)
  })

  it('retire kind quand on repasse de grammaire à vocabulaire', async () => {
    await createNote(GRAMMAIRE_INPUT, NOW)
    const [card] = await getDb().cards.toArray()
    await updateNote(card!.id, VOCAB_INPUT)
    const updated = await getDb().cards.get(card!.id)
    expect(updated?.kind).toBeUndefined()
  })
})

describe('deleteNote', () => {
  it('supprime la carte', async () => {
    await createNote(VOCAB_INPUT, NOW)
    const [card] = await getDb().cards.toArray()
    await deleteNote(card!.id)
    expect(await getDb().cards.count()).toBe(0)
  })
})
