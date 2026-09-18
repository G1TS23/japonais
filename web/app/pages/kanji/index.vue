<script setup lang="ts">
import { computed } from 'vue'
import { KANJI_STROKES, sortedByComplexity } from '~/lib/kanji'

useHead({ title: 'Kanji — Japonais' })

const sorted = computed(() => sortedByComplexity())
</script>

<template>
  <div>
    <PageHeader title="Kanji" :subtitle="`${KANJI_STROKES.length} kanji du palier N5, tracé et animation d'écriture.`" />

    <div class="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8">
      <NuxtLink
        v-for="k in sorted"
        :key="k.kanji"
        :to="`/kanji/${encodeURIComponent(k.kanji)}`"
        class="jp flex flex-col items-center gap-1 rounded-xl border border-neutral-200 bg-white py-3 transition hover:border-brand-400 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800/60"
      >
        <span class="text-2xl">{{ k.kanji }}</span>
        <span class="text-[10px] text-neutral-400">{{ k.strokes.length }} traits</span>
      </NuxtLink>
    </div>
  </div>
</template>
