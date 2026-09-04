import { getDb, TABLE_NAMES, type TableName } from './db'

export const BACKUP_FORMAT = 'japonais-backup'
export const BACKUP_VERSION = 1

export interface BackupFile {
  format: typeof BACKUP_FORMAT
  version: number
  exported_at: string
  data: Record<string, unknown[]>
}

/** Sérialise toutes les tables en un objet JSON. */
export async function exportAll(): Promise<BackupFile> {
  const db = getDb()
  const data: Record<string, unknown[]> = {}
  await db.transaction('r', db.tables, async () => {
    for (const name of TABLE_NAMES) {
      data[name] = await db.table(name).toArray()
    }
  })
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exported_at: new Date().toISOString(),
    data,
  }
}

/** Déclenche le téléchargement du fichier de sauvegarde. */
export async function downloadBackup(): Promise<void> {
  const backup = await exportAll()
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `japonais-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function isBackup(x: unknown): x is BackupFile {
  return (
    !!x &&
    typeof x === 'object' &&
    (x as BackupFile).format === BACKUP_FORMAT &&
    typeof (x as BackupFile).data === 'object'
  )
}

export interface ImportResult {
  tables: { name: string; count: number }[]
}

/** Remplace intégralement le contenu local par celui de la sauvegarde. */
export async function importAll(raw: string): Promise<ImportResult> {
  const parsed: unknown = JSON.parse(raw)
  if (!isBackup(parsed)) {
    throw new Error('Fichier non reconnu : ce n’est pas une sauvegarde « japonais ».')
  }
  if (parsed.version > BACKUP_VERSION) {
    throw new Error(
      `Sauvegarde en version ${parsed.version}, cette app gère jusqu’à ${BACKUP_VERSION}. Mets l’app à jour.`,
    )
  }

  const db = getDb()
  const result: ImportResult = { tables: [] }
  await db.transaction('rw', db.tables, async () => {
    for (const name of TABLE_NAMES) {
      const rows = Array.isArray(parsed.data[name]) ? parsed.data[name] : []
      await db.table(name).clear()
      if (rows.length) await db.table(name as TableName).bulkPut(rows as never[])
      result.tables.push({ name, count: rows.length })
    }
  })
  return result
}

/** Efface toutes les données locales. */
export async function resetAll(): Promise<void> {
  const db = getDb()
  await db.transaction('rw', db.tables, async () => {
    for (const name of TABLE_NAMES) await db.table(name).clear()
  })
}
