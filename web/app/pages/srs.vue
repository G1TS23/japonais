<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useStorage } from '@vueuse/core'
import { getDb, type Card } from '~/lib/db'
import { State } from '~/lib/fsrs'
import { PERSO_TAG } from '~/lib/notes'
import { getTodayQueue, seedDeckIfEmpty, seedGrammarClozeCards, syncContentTranslations } from '~/lib/srs-session'
import { bumpDailyStreak, getDailyStreak } from '~/lib/streak'
import { useLiveQuery } from '~/composables/useLiveQuery'
import { useSettingsStore } from '~/stores/settings'

useHead({ title: 'Review — Japonais' })

const settings = useSettingsStore()
onMounted(() => settings.load())

const view = ref<'idle' | 'running' | 'done'>('idle')
useScrollTopOn(view)
const queue = ref<Card[]>([])
type Summary = { total: number; again: number; hard: number; good: number; easy: number; durationMs: number }
const lastSummary = ref<Summary | null>(null)
const streak = ref(0)
const seeding = ref(true)

// Portée de la session : tout le deck, ou seulement les notes perso.
// Mémorisée d'une visite à l'autre, comme les réglages de quiz (quiz.vue).
const scope = useStorage<'all' | 'perso'>('srs:scope', 'all')
const scopeTag = () => (scope.value === 'perso' ? PERSO_TAG : undefined)

const db = getDb()
// `deps: [scope]` : liveQuery ne resouscrit que sur une écriture Dexie, pas
// sur un changement de `scope` (un simple ref Vue, pas une table) — sans
// cette dépendance explicite, les compteurs restent figés sur l'ancienne
// portée tant qu'aucune carte n'est modifiée par ailleurs.
const totalCards = useLiveQuery(
  () => db.cards.filter((c) => !scopeTag() || c.tags.includes(scopeTag()!)).count(),
  0,
  [scope],
)
const dueNow = useLiveQuery(
  () =>
    db.cards
      .where('due')
      .belowOrEqual(Date.now())
      .and((c) => !c.suspendue && c.state !== State.New && (!scopeTag() || c.tags.includes(scopeTag()!)))
      .count(),
  0,
  [scope],
)
const matureCards = useLiveQuery(
  () => db.cards.filter((c) => c.stability >= 21 && (!scopeTag() || c.tags.includes(scopeTag()!))).count(),
  0,
  [scope],
)
const newAvailable = useLiveQuery(
  () =>
    db.cards
      .where('state')
      .equals(State.New)
      .and((c) => !c.suspendue && (!scopeTag() || c.tags.includes(scopeTag()!)))
      .count(),
  0,
  [scope],
)

onMounted(async () => {
  await seedDeckIfEmpty()
  await seedGrammarClozeCards()
  await syncContentTranslations()
  seeding.value = false
  streak.value = await getDailyStreak('srsStreak')
})

async function start() {
  await settings.load()
  const q = await getTodayQueue(settings.values.newCardsPerDay, new Date(), scopeTag())
  queue.value = [...q.due, ...q.fresh]
  if (!queue.value.length) return
  view.value = 'running'
}

async function onFinish(summary: Summary) {
  lastSummary.value = summary
  streak.value = await bumpDailyStreak('srsStreak')
  view.value = 'done'
}

async function continueReviewing() {
  await start()
  if (view.value !== 'running') view.value = 'idle' // plus rien à réviser
}
</script>

<template>
  <div>
    <PageHeader title="Review" subtitle="Répétition espacée (FSRS) — vocabulaire N5." />

    <div v-if="view === 'idle'" class="space-y-5">
      <SettingField label="Portée">
        <SegmentedControl
          label="Portée"
          :model-value="scope"
          :options="[
            { value: 'all', label: 'Tout' },
            { value: 'perso', label: 'Mes notes' },
          ]"
          @update:model-value="scope = $event as 'all' | 'perso'"
        />
      </SettingField>

      <section class="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Cartes" :value="totalCards" :hint="scope === 'perso' ? 'mes notes' : 'deck N5'" />
        <StatCard label="À réviser" :value="dueNow" />
        <StatCard label="Nouvelles dispo." :value="newAvailable" :hint="`plafond ${settings.values.newCardsPerDay}/j`" />
        <StatCard label="Mûres" :value="matureCards" hint="stabilité ≥ 21 j" />
      </section>

      <div v-if="seeding" class="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500 dark:border-neutral-700">
        Préparation du deck…
      </div>
      <template v-else>
        <button
          class="w-full rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="dueNow === 0 && newAvailable === 0"
          @click="start"
        >
          Réviser
        </button>
        <p v-if="dueNow === 0 && newAvailable === 0" class="text-center text-sm text-neutral-400">
          Rien à réviser pour l'instant — repasse plus tard, ou augmente le plafond de nouvelles cartes dans Réglages.
        </p>
      </template>
    </div>

    <SrsReview v-else-if="view === 'running'" :queue="queue" @finish="onFinish" @quit="view = 'idle'" />

    <SrsResults
      v-else-if="view === 'done' && lastSummary"
      :summary="lastSummary"
      :streak="streak"
      @again="continueReviewing"
      @done="view = 'idle'"
    />
  </div>
</template>
