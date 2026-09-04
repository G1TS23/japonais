import { beforeEach, describe, expect, it } from 'vitest'
import { getDb, type Card } from './db'
import { BACKUP_FORMAT, downloadBackup, exportAll, importAll, resetAll } from './backup'

function sampleCard(overrides: Partial<Card> = {}): Card {
  return {
    id: 'card-1',
    terme: '食べる',
    lecture: 'たべる',
    sens_fr: 'manger',
    sens_fr_source: 'jmdict',
    sens_en: 'to eat',
    tags: ['n5', 'verbe'],
    state: 'new',
    due: 0,
    reps: 0,
    lapses: 0,
    suspendue: false,
    created_at: Date.now(),
    ...overrides,
  }
}

beforeEach(async () => {
  await resetAll()
})

describe('exportAll / importAll', () => {
  it('exporte toutes les tables, y compris vides', async () => {
    const backup = await exportAll()
    expect(backup.format).toBe(BACKUP_FORMAT)
    expect(backup.data.cards).toEqual([])
    expect(backup.data.kanaStats).toEqual([])
  })

  it('round-trip : ce qui est exporté puis importé restaure les mêmes données', async () => {
    const db = getDb()
    await db.cards.put(sampleCard())
    await db.kanaStats.put({ kana: 'あ', type: 'hiragana', seen: 3, correct: 2, last_seen: 1, streak: 0 })

    const backup = await exportAll()
    await resetAll()
    expect(await db.cards.count()).toBe(0)

    const result = await importAll(JSON.stringify(backup))
    expect(result.tables.find((t) => t.name === 'cards')?.count).toBe(1)

    const restored = await db.cards.get('card-1')
    expect(restored?.terme).toBe('食べる')
    expect(await db.kanaStats.get('あ')).toMatchObject({ seen: 3, correct: 2 })
  })

  it('import remplace intégralement (pas de fusion) le contenu existant', async () => {
    const db = getDb()
    await db.cards.put(sampleCard({ id: 'old' }))

    const backup = await exportAll() // ne contient que "old"
    await db.cards.put(sampleCard({ id: 'new-not-in-backup' }))

    await importAll(JSON.stringify(backup))

    expect(await db.cards.get('old')).toBeDefined()
    expect(await db.cards.get('new-not-in-backup')).toBeUndefined()
  })

  it('rejette un fichier qui n’est pas une sauvegarde reconnue', async () => {
    await expect(importAll(JSON.stringify({ hello: 'world' }))).rejects.toThrow()
  })

  it('rejette un JSON invalide', async () => {
    await expect(importAll('{ pas du json')).rejects.toThrow()
  })
})

describe('resetAll', () => {
  it('vide toutes les tables', async () => {
    const db = getDb()
    await db.cards.put(sampleCard())
    await db.settings.put({ key: 'theme', value: 'dark' })

    await resetAll()

    expect(await db.cards.count()).toBe(0)
    expect(await db.settings.count()).toBe(0)
  })
})

describe('downloadBackup', () => {
  it('est exposée pour usage navigateur (non testée ici, nécessite le DOM)', () => {
    expect(typeof downloadBackup).toBe('function')
  })
})
