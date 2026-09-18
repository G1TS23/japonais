<script setup lang="ts">
import { computed } from 'vue'
import { findKanjiStrokes, sortedByComplexity } from '~/lib/kanji'
import { useDictionaryPopover } from '~/composables/useDictionaryPopover'

const route = useRoute()
const kanji = computed(() => String(route.params.kanji))
const entry = computed(() => findKanjiStrokes(kanji.value))
const { openDefinition } = useDictionaryPopover()

/** Même ordre que la liste (plus simple → plus complexe), pour naviguer d'un kanji au suivant. */
const sorted = computed(() => sortedByComplexity())
const index = computed(() => sorted.value.findIndex((k) => k.kanji === kanji.value))
const prev = computed(() => (index.value > 0 ? sorted.value[index.value - 1] : undefined))
const next = computed(() => (index.value >= 0 && index.value < sorted.value.length - 1 ? sorted.value[index.value + 1] : undefined))

useHead({ title: () => `${kanji.value} — Kanji — Japonais` })
</script>

<template>
  <div v-if="entry">
    <NuxtLink
      to="/kanji"
      class="mb-4 inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
    >
      <AppIcon name="arrow-left" class="h-4 w-4" />
      Kanji
    </NuxtLink>

    <div class="mb-5 flex items-center justify-center gap-3">
      <button
        type="button"
        class="jp cursor-pointer rounded-xl border border-neutral-300 bg-white px-5 py-2 text-5xl transition hover:border-brand-400 dark:border-neutral-700 dark:bg-neutral-900"
        @click="openDefinition(kanji)"
      >
        {{ kanji }}
      </button>
    </div>
    <p class="mb-5 text-center text-xs text-neutral-400">Tape le kanji pour voir sa définition.</p>

    <div class="flex justify-center">
      <KanjiStroke :kanji="kanji" :size="260" />
    </div>

    <div class="mt-6 flex items-center justify-between">
      <NuxtLink
        v-if="prev"
        :to="`/kanji/${encodeURIComponent(prev.kanji)}`"
        :aria-label="`Kanji précédent : ${prev.kanji}`"
        class="jp flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
      >
        <AppIcon name="arrow-left" class="h-4 w-4" />
        {{ prev.kanji }}
      </NuxtLink>
      <div v-else />
      <NuxtLink
        v-if="next"
        :to="`/kanji/${encodeURIComponent(next.kanji)}`"
        :aria-label="`Kanji suivant : ${next.kanji}`"
        class="jp flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
      >
        {{ next.kanji }}
        <AppIcon name="chevron-double-right" class="h-4 w-4" />
      </NuxtLink>
      <div v-else />
    </div>
  </div>

  <div v-else>
    <PageHeader title="Kanji introuvable" />
    <NuxtLink
      to="/kanji"
      class="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
    >
      <AppIcon name="arrow-left" class="h-4 w-4" />
      Kanji
    </NuxtLink>
  </div>
</template>
