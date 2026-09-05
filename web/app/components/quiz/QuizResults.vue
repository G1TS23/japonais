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
}>()
const emit = defineEmits<{ replay: []; again: []; config: [] }>()

const pct = computed(() => (props.summary.total ? Math.round((props.summary.score / props.summary.total) * 100) : 0))
const seconds = computed(() => Math.round(props.summary.durationMs / 1000))
/** Certaines erreurs (surtout d'anciennes tentatives) n'ont pas de détail stocké. */
const missingDetail = computed(() => props.summary.missed.length - props.missedQuestions.length)
</script>

<template>
  <div class="mx-auto max-w-md">
    <div class="rounded-2xl border border-neutral-200 bg-white p-8 text-center dark:border-neutral-800 dark:bg-neutral-900">
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
          <div class="jp">{{ q.prompt }}</div>
          <div class="mt-1 text-neutral-500 dark:text-neutral-400">
            <span class="jp font-medium text-green-600 dark:text-green-400">{{ q.options[q.answer] }}</span>
            — {{ q.explanation }}
          </div>
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
