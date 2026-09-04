import { computed } from 'vue'
import { getDb, type KanaStat } from '~/lib/db'
import { useLiveQuery } from '~/composables/useLiveQuery'
import type { KanaAccuracy } from '~/lib/kana-session'

/** Statistiques kana en lecture réactive. */
export function useKanaStats() {
  const rows = useLiveQuery(() => getDb().kanaStats.toArray(), [] as KanaStat[])

  const byChar = computed(() => {
    const m = new Map<string, KanaAccuracy>()
    for (const r of rows.value) {
      m.set(r.kana, {
        seen: r.seen,
        correct: r.correct,
        accuracy: r.seen ? r.correct / r.seen : 0,
      })
    }
    return m
  })

  const worked = computed(() => rows.value.filter((r) => r.seen > 0).length)

  return { rows, byChar, worked }
}

/** Enregistre une réponse (chaque présentation compte). */
export async function recordKanaAnswer(
  char: string,
  type: 'hiragana' | 'katakana',
  correct: boolean,
): Promise<void> {
  const db = getDb()
  await db.transaction('rw', db.kanaStats, async () => {
    const prev = await db.kanaStats.get(char)
    if (prev) {
      await db.kanaStats.put({
        ...prev,
        seen: prev.seen + 1,
        correct: prev.correct + (correct ? 1 : 0),
        last_seen: Date.now(),
        streak: correct ? prev.streak + 1 : 0,
      })
    } else {
      await db.kanaStats.put({
        kana: char,
        type,
        seen: 1,
        correct: correct ? 1 : 0,
        last_seen: Date.now(),
        streak: correct ? 1 : 0,
      })
    }
  })
}
