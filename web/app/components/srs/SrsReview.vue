<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import type { Card } from '~/lib/db'
import { previewRatings, Rating, type RatingPreview } from '~/lib/fsrs'
import { displaySens, recordReview, shouldRequeueInSession } from '~/lib/srs-session'
import { useSettingsStore } from '~/stores/settings'

const props = defineProps<{ queue: Card[] }>()
const emit = defineEmits<{
  finish: [summary: { total: number; again: number; hard: number; good: number; easy: number; durationMs: number }]
  quit: []
}>()

const settings = useSettingsStore()

// File de travail locale et mutable : une carte notée Again/Hard qui reste en
// apprentissage (Learning/Relearning) est réinsérée un peu plus loin dans la
// file pour revenir DANS la même session — sinon on ne la revoit jamais avant
// la prochaine ouverture de /srs. Les cartes qui passent en Review (Good/Easy,
// ou Hard sur une carte déjà mûre) ne sont pas réinjectées : leur prochain
// intervalle se compte en jours, pas en minutes.
const REQUEUE_GAP = 3
const queue = ref<Card[]>(props.queue.slice())
const index = ref(0)
const total = props.queue.length
const seen = ref<Set<string>>(new Set())

const phase = ref<'front' | 'back'>('front')
const preview = ref<RatingPreview[]>([])
const startedAt = Date.now()
const tally = { again: 0, hard: 0, good: 0, easy: 0 }

const current = computed<Card | undefined>(() => queue.value[index.value])
const doneCount = computed(() => Math.min(seen.value.size, total))
// Cartes requeuées en plus du total de départ. Ne pas dériver ce nombre de
// `doneCount` vs `index` : `seen` grandit dès la notation, `index` seulement
// après le await recordReview() (écriture Dexie) — décalage qui faisait
// clignoter "+1 à revoir" même sans requeue.
const extraToReview = computed(() => queue.value.length - total)

const meaning = computed(() => (current.value ? displaySens(current.value, settings.values.sensLang) : null))

watch(
  current,
  (c) => {
    phase.value = 'front'
    preview.value = []
    if (c) preview.value = previewRatings(c, settings.values.retention)
  },
  { immediate: true },
)

function flip() {
  if (phase.value === 'front') phase.value = 'back'
}

async function rate(rating: Rating.Again | Rating.Hard | Rating.Good | Rating.Easy) {
  const c = current.value
  if (!c || phase.value !== 'back') return
  if (rating === Rating.Again) tally.again++
  else if (rating === Rating.Hard) tally.hard++
  else if (rating === Rating.Good) tally.good++
  else tally.easy++

  seen.value.add(c.id)
  const updated = await recordReview(c, settings.values.retention, rating)

  if (shouldRequeueInSession(updated.state)) {
    const pos = Math.min(queue.value.length, index.value + 1 + REQUEUE_GAP)
    queue.value.splice(pos, 0, updated)
  }

  if (index.value + 1 >= queue.value.length) {
    emit('finish', { total, ...tally, durationMs: Date.now() - startedAt })
    return
  }
  index.value++
}

function onKey(e: KeyboardEvent) {
  if (phase.value === 'front' && (e.key === ' ' || e.key === 'Enter')) {
    e.preventDefault()
    flip()
    return
  }
  if (phase.value === 'back') {
    if (e.key === '1') rate(Rating.Again)
    else if (e.key === '2') rate(Rating.Hard)
    else if (e.key === '3') rate(Rating.Good)
    else if (e.key === '4') rate(Rating.Easy)
  }
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))

const labelFor = (r: Rating) => preview.value.find((p) => p.rating === r)?.intervalLabel ?? '…'
</script>

<template>
  <div v-if="current" class="mx-auto max-w-md">
    <div class="mb-6 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
      <span>{{ doneCount }} / {{ total }}</span>
      <button
        class="-mx-2 -my-0.5 rounded px-2 py-0.5 transition hover:bg-neutral-200/60 hover:text-neutral-900 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-100"
        @click="emit('quit')"
      >
        Quitter
      </button>
    </div>
    <div class="mb-1 h-1.5 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
      <div
        class="h-full bg-brand-500 transition-all"
        :style="{ width: `${Math.round((doneCount / total) * 100)}%` }"
      />
    </div>
    <div class="mb-5 min-h-4 text-right text-xs text-amber-500">
      <span v-if="extraToReview > 0">+{{ extraToReview }} à revoir</span>
    </div>

    <div class="flex min-h-72 flex-col items-center justify-center gap-4 rounded-2xl border border-neutral-200 bg-white p-8 text-center dark:border-neutral-800 dark:bg-neutral-900">
      <div class="jp text-4xl">{{ current.terme }}</div>

      <template v-if="phase === 'back'">
        <div class="jp text-lg text-neutral-500 dark:text-neutral-400">{{ current.lecture }}</div>
        <div class="text-xl">
          {{ meaning?.text }}
          <span v-if="meaning?.isFallback" class="ml-1 align-middle text-[10px] font-medium text-neutral-400">EN</span>
        </div>
        <p v-if="current.exemple_jp" class="jp mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          {{ current.exemple_jp }}
        </p>
        <p v-if="current.exemple_fr" class="text-sm text-neutral-400">{{ current.exemple_fr }}</p>
      </template>

      <button
        v-else
        class="mt-2 rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
        @click="flip"
      >
        Afficher la réponse
      </button>
    </div>

    <div v-if="phase === 'back'" class="mt-4 grid grid-cols-4 gap-2">
      <button
        class="rounded-lg border border-red-300 py-2.5 text-center text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/40"
        @click="rate(Rating.Again)"
      >
        Again<span class="block text-[10px] font-normal opacity-70">{{ labelFor(Rating.Again) }}</span>
      </button>
      <button
        class="rounded-lg border border-amber-300 py-2.5 text-center text-sm font-medium text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-300 dark:hover:bg-amber-950/40"
        @click="rate(Rating.Hard)"
      >
        Hard<span class="block text-[10px] font-normal opacity-70">{{ labelFor(Rating.Hard) }}</span>
      </button>
      <button
        class="rounded-lg border border-green-300 py-2.5 text-center text-sm font-medium text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-300 dark:hover:bg-green-950/40"
        @click="rate(Rating.Good)"
      >
        Good<span class="block text-[10px] font-normal opacity-70">{{ labelFor(Rating.Good) }}</span>
      </button>
      <button
        class="rounded-lg border border-blue-300 py-2.5 text-center text-sm font-medium text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-950/40"
        @click="rate(Rating.Easy)"
      >
        Easy<span class="block text-[10px] font-normal opacity-70">{{ labelFor(Rating.Easy) }}</span>
      </button>
    </div>
    <p class="mt-3 text-center text-xs text-neutral-400">Espace pour retourner · 1-4 pour noter</p>
  </div>
</template>
