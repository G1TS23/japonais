<script setup lang="ts">
import { computed } from 'vue'
import { romajiOf, type DrillResult } from '~/lib/kana-session'

const props = defineProps<{ result: DrillResult; streak: number }>()
const emit = defineEmits<{ again: []; replay: []; config: [] }>()

const pct = computed(() =>
  props.result.total ? Math.round((props.result.firstTryCorrect / props.result.total) * 100) : 0,
)
const seconds = computed(() => Math.round(props.result.durationMs / 1000))
</script>

<template>
  <div class="mx-auto max-w-md">
    <div class="rounded-2xl border border-neutral-200 bg-white p-8 text-center dark:border-neutral-800 dark:bg-neutral-900">
      <div class="text-5xl font-semibold tabular-nums">{{ pct }}%</div>
      <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        {{ result.firstTryCorrect }} / {{ result.total }} du premier coup · {{ seconds }} s
      </p>
      <p v-if="streak > 0" class="mt-2 text-sm">🔥 Série : {{ streak }} jour{{ streak > 1 ? 's' : '' }}</p>

      <div v-if="result.missed.length" class="mt-6 text-left">
        <div class="mb-2 text-xs font-medium tracking-wide text-neutral-400 uppercase">
          À revoir ({{ result.missed.length }})
        </div>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="ch in result.missed"
            :key="ch"
            class="inline-flex items-baseline gap-1 rounded-lg bg-neutral-100 px-2 py-1 dark:bg-neutral-800"
          >
            <span class="jp text-lg">{{ ch }}</span>
            <span class="text-xs text-neutral-500">{{ romajiOf(ch) }}</span>
          </span>
        </div>
      </div>

      <div class="mt-8 flex flex-col gap-2">
        <button
          v-if="result.missed.length"
          class="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
          @click="emit('replay')"
        >
          Rejouer les {{ result.missed.length }} ratés
        </button>
        <button
          class="rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-medium hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
          @click="emit('again')"
        >
          Nouvelle session (mêmes réglages)
        </button>
        <button
          class="rounded-lg px-4 py-2 text-sm font-medium text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
          @click="emit('config')"
        >
          Changer les réglages
        </button>
      </div>
    </div>
  </div>
</template>
