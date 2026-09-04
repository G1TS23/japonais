import { toRaw } from 'vue'
import { VOCAB_N5, type VocabEntry } from '~/data/vocab'
import { getDb, uid, type Card } from './db'
import { applyRating, newFsrsFields, State, type Grade } from './fsrs'

function dayBounds(now: Date) {
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 1)
  return { start: start.getTime(), end: end.getTime() }
}

/** Importe le deck fourni si l'utilisateur n'a encore aucune carte. Renvoie le nombre ajouté. */
export async function seedDeckIfEmpty(entries: VocabEntry[] = VOCAB_N5, now: Date = new Date()): Promise<number> {
  const db = getDb()
  if ((await db.cards.count()) > 0) return 0

  const cards: Card[] = entries.map((e) => ({
    id: uid(),
    content_id: e.content_id,
    terme: e.terme,
    lecture: e.lecture,
    sens_fr: e.sens_fr,
    sens_fr_source: e.sens_fr_source,
    sens_en: e.sens_en,
    tags: e.tags,
    suspendue: false,
    created_at: now.getTime(),
    ...newFsrsFields(now),
  }))
  await db.cards.bulkAdd(cards)
  return cards.length
}

/**
 * Rattrapage de contenu : complète `sens_fr` sur les cartes déjà présentes
 * qui n'en ont pas encore (ex. deck importé avant l'ajout des traductions
 * françaises), en le récupérant sur l'entrée correspondante de `entries` via
 * `content_id`. Ne touche à rien d'autre (progression FSRS intacte).
 */
export async function syncContentTranslations(entries: VocabEntry[] = VOCAB_N5): Promise<number> {
  const db = getDb()
  const byContentId = new Map(entries.map((e) => [e.content_id, e]))
  const stale = await db.cards.filter((c) => !c.sens_fr && !!c.content_id).toArray()
  if (!stale.length) return 0

  let updated = 0
  await db.transaction('rw', db.cards, async () => {
    for (const card of stale) {
      const source = byContentId.get(card.content_id!)
      if (!source?.sens_fr) continue
      await db.cards.update(card.id, { sens_fr: source.sens_fr, sens_fr_source: source.sens_fr_source })
      updated++
    }
  })
  return updated
}

/** Nombre de cartes distinctes entrées en révision pour la première fois aujourd'hui. */
export async function newCardsIntroducedToday(now: Date = new Date()): Promise<number> {
  const db = getDb()
  const { start, end } = dayBounds(now)
  const logs = await db.reviewLogs.where('ts').between(start, end, true, false).toArray()
  const ids = new Set(logs.filter((l) => l.priorState === State.New).map((l) => l.cardId))
  return ids.size
}

export interface TodayQueue {
  due: Card[]
  fresh: Card[]
}

/** File du jour : révisions dues + nouvelles cartes plafonnées par le réglage utilisateur. */
export async function getTodayQueue(newCardsPerDay: number, now: Date = new Date()): Promise<TodayQueue> {
  const db = getDb()
  const nowMs = now.getTime()

  const [due, allNew, introducedToday] = await Promise.all([
    db.cards
      .where('due')
      .belowOrEqual(nowMs)
      .and((c) => !c.suspendue && c.state !== State.New)
      .sortBy('due'),
    db.cards
      .where('state')
      .equals(State.New)
      .and((c) => !c.suspendue)
      .sortBy('created_at'),
    newCardsIntroducedToday(now),
  ])

  const remaining = Math.max(0, newCardsPerDay - introducedToday)
  return { due, fresh: allNew.slice(0, remaining) }
}

/**
 * Applique une note et persiste la carte + le journal de révision.
 *
 * `card` vient typiquement d'un `ref()` Vue (ex. `current.value` dans
 * SrsReview.vue) : ses champs objets/tableaux (`tags`…) sont alors des
 * proxies réactifs. IndexedDB (structured clone) refuse de cloner un Proxy
 * — d'où `toRaw()` avant tout écriture Dexie.
 */
export async function recordReview(card: Card, retention: number, rating: Grade, now: Date = new Date()): Promise<Card> {
  const db = getDb()
  const raw = toRaw(card)
  const priorState = raw.state
  const { card: fields, scheduledDays } = applyRating(raw, retention, rating, now)
  const updated: Card = { ...raw, ...fields }

  await db.transaction('rw', db.cards, db.reviewLogs, async () => {
    await db.cards.put(updated)
    await db.reviewLogs.add({
      id: uid(),
      cardId: raw.id,
      rating,
      priorState,
      scheduled_days: scheduledDays,
      ts: now.getTime(),
    })
  })
  return updated
}

/**
 * Une carte notée qui reste en Learning/Relearning doit revenir DANS la même
 * session (intervalle en minutes) ; une carte passée en Review a un intervalle
 * en jours et n'a pas à réapparaître avant la prochaine ouverture de /srs.
 */
export function shouldRequeueInSession(state: State): boolean {
  return state === State.Learning || state === State.Relearning
}

/** Texte à afficher pour le sens, avec repli anglais si le français manque. */
export function displaySens(card: Pick<Card, 'sens_fr' | 'sens_en'>, sensLang: 'fr' | 'en'): { text: string; isFallback: boolean } {
  if (sensLang === 'en') return { text: card.sens_en, isFallback: false }
  if (card.sens_fr) return { text: card.sens_fr, isFallback: false }
  return { text: card.sens_en, isFallback: true }
}
