import { getDb } from '~/lib/db'

interface StreakValue {
  count: number
  date: string // AAAA-MM-JJ
}

function dayStr(offset = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return d.toISOString().slice(0, 10)
}

/** Incrémente la série quotidienne pour `key` et renvoie sa nouvelle valeur. */
export async function bumpDailyStreak(key = 'kanaStreak'): Promise<number> {
  const db = getDb()
  const row = await db.progress.get(key)
  const cur = (row?.value as StreakValue | undefined) ?? { count: 0, date: '' }
  const today = dayStr(0)

  let next: StreakValue
  if (cur.date === today) next = cur
  else if (cur.date === dayStr(-1)) next = { count: cur.count + 1, date: today }
  else next = { count: 1, date: today }

  await db.progress.put({ key, value: next, updated_at: Date.now() })
  return next.count
}

/** Série courante (0 si interrompue). */
export async function getDailyStreak(key = 'kanaStreak'): Promise<number> {
  const row = await getDb().progress.get(key)
  const cur = row?.value as StreakValue | undefined
  if (!cur) return 0
  return cur.date === dayStr(0) || cur.date === dayStr(-1) ? cur.count : 0
}
