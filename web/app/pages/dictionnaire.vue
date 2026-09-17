<script setup lang="ts">
import { computed, ref } from 'vue'
import { DICTIONARY } from '~/data/dictionary'
import { searchDictionary } from '~/lib/dictionary'

useHead({ title: 'Dictionnaire — Japonais' })

const query = ref('')
const searching = computed(() => query.value.trim().length > 0)
const results = computed(() => (searching.value ? searchDictionary(query.value) : []))
</script>

<template>
  <div>
    <PageHeader
      title="Dictionnaire"
      :subtitle="`${DICTIONARY.length.toLocaleString('fr-FR')} mots (JMdict). Cherche en japonais ou en français.`"
    />

    <div class="mb-5">
      <input
        v-model="query"
        type="search"
        autocapitalize="off"
        autocorrect="off"
        spellcheck="false"
        placeholder="食べる, たべる ou « manger »…"
        aria-label="Rechercher un mot"
        class="w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-brand-500 dark:border-neutral-700 dark:bg-neutral-900"
      />
      <p class="mt-1.5 min-h-4 text-xs text-neutral-400">
        <span v-if="searching">{{ results.length }} résultat{{ results.length > 1 ? 's' : '' }}</span>
      </p>
    </div>

    <p
      v-if="!searching"
      class="rounded-xl border border-neutral-200 bg-white p-5 text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400"
    >
      Tape un mot en japonais (kanji ou kana) ou sa traduction en français pour
      commencer.
    </p>
    <p
      v-else-if="!results.length"
      class="rounded-xl border border-neutral-200 bg-white p-5 text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400"
    >
      Aucun mot ne correspond à « {{ query }} ».
    </p>

    <ul v-else class="divide-y divide-neutral-100 overflow-hidden rounded-xl border border-neutral-200 bg-white dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
      <li v-for="e in results" :key="e.id" class="flex items-start gap-3 px-4 py-3">
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-baseline gap-x-2">
            <span class="jp text-lg font-medium">{{ e.kanji ?? e.reading }}</span>
            <span v-if="e.kanji" class="jp text-sm text-neutral-400">{{ e.reading }}</span>
          </div>
          <p class="mt-0.5 text-sm text-neutral-600 dark:text-neutral-300">{{ e.gloss }}</p>
        </div>
        <SpeakButton :text="e.reading" size="sm" :label="`Écouter ${e.kanji ?? e.reading}`" />
      </li>
    </ul>
  </div>
</template>
