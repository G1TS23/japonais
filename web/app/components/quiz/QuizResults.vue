<script setup lang="ts">
import { computed } from 'vue'
import type { QuizQuestion } from '~/lib/quiz-session'

const props = defineProps<{
  summary: { score: number; total: number; missed: string[]; durationMs: number }
  missedQuestions: QuizQuestion[]
  /** Mode relecture depuis l'historique : cache "nouveau quiz", "config" devient "Fermer". */
  historical?: boolean
  /** Date affichée à la place du chrono en mode relecture. */
  date?: string
  /** Contexte du quiz (palier + thèmes), affiché en titre au-dessus du score. */
  title?: string
}>()
const emit = defineEmits<{ replay: []; again: []; config: [] }>()

const pct = computed(() => (props.summary.total ? Math.round((props.summary.score / props.summary.total) * 100) : 0))
const seconds = computed(() => Math.round(props.summary.durationMs / 1000))
/** Certaines erreurs (surtout d'anciennes tentatives) n'ont pas de détail stocké. */
const missingDetail = computed(() => props.summary.missed.length - props.missedQuestions.length)
</script>

<template>
  <div class="relative mx-auto max-w-md">
    <!-- Actions rondes : hors de la carte, alignées sur son bord haut, et qui
         restent visibles au défilement. Conteneur h-0 : n'occupe aucune place,
         les boutons débordent vers le bas. -->
    <div
      v-if="historical"
      class="pointer-events-none sticky z-20 flex h-0 flex-col items-end gap-2 md:mr-[-3.25rem]"
      :style="{ top: 'calc(env(safe-area-inset-top) + 3.75rem)' }"
    >
      <AppTooltip v-if="missedQuestions.length" label="Rejouer les erreurs" placement="left">
        <button
          type="button"
          aria-label="Rejouer les erreurs"
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white shadow-sm transition hover:bg-brand-600"
          @click="emit('replay')"
        >
          <AppIcon name="arrow-path" class="h-5 w-5" />
        </button>
      </AppTooltip>
      <AppTooltip label="Fermer le résumé" placement="left">
        <button
          type="button"
          aria-label="Fermer le résumé"
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
          @click="emit('config')"
        >
          <AppIcon name="x-mark" class="h-5 w-5" />
        </button>
      </AppTooltip>
    </div>

    <div class="rounded-2xl border border-neutral-200 bg-white p-8 text-center dark:border-neutral-800 dark:bg-neutral-900">
      <h2 v-if="title" class="mb-3 text-sm font-semibold text-neutral-500 dark:text-neutral-400">{{ title }}</h2>
      <div class="text-5xl font-semibold tabular-nums">{{ pct }}%</div>
      <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        {{ summary.score }} / {{ summary.total }}
        <span v-if="historical && date"> · {{ date }}</span>
        <span v-else> · {{ seconds }} s</span>
      </p>

      <div v-if="missedQuestions.length" class="mt-6 space-y-3 text-left">
        <div class="text-xs font-medium tracking-wide text-neutral-400 uppercase">
          À revoir ({{ missedQuestions.length }})
        </div>
        <div
          v-for="q in missedQuestions"
          :key="q.id"
          class="rounded-lg bg-neutral-50 p-3 text-sm dark:bg-neutral-800/60"
        >
          <div>
            <span class="jp">{{ q.prompt }}</span>
            <span v-if="q.hint && q.theme !== 'vocabulaire'" class="text-neutral-400"> ({{ q.hint }})</span>
          </div>
          <div class="mt-1">
            <span class="text-neutral-400">Bonne réponse : </span>
            <span class="jp font-medium text-neutral-900 dark:text-neutral-100">{{ q.options[q.answer] }}</span>
          </div>
          <div v-if="q.explanation" class="mt-0.5 text-neutral-500 dark:text-neutral-400">{{ q.explanation }}</div>
        </div>
        <p v-if="missingDetail > 0" class="text-xs text-neutral-400">
          {{ missingDetail }} autre(s) erreur(s) sans détail enregistré.
        </p>
      </div>
      <p v-else-if="summary.missed.length" class="mt-4 text-xs text-neutral-400">
        Détail des erreurs indisponible pour cette tentative.
      </p>

      <div class="mt-8 flex flex-col gap-2">
        <button
          v-if="missedQuestions.length"
          class="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
          @click="emit('replay')"
        >
          Rejouer les {{ missedQuestions.length }} erreurs
        </button>
        <button
          v-if="!historical"
          class="rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-medium transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
          @click="emit('again')"
        >
          Nouveau quiz (mêmes réglages)
        </button>
        <button
          class="rounded-lg px-4 py-2 text-sm font-medium text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
          @click="emit('config')"
        >
          {{ historical ? 'Fermer' : 'Changer les réglages' }}
        </button>
      </div>
    </div>
  </div>
</template>
