<script setup lang="ts">
import { computed, ref } from 'vue'
import { useStorage } from '@vueuse/core'
import { GRAMMAR_N5, groupByCategory, searchGrammar } from '~/lib/grammar'

useHead({ title: 'Grammaire — Japonais' })

const query = ref('')
/** Catégorie dépliée/repliée — mémorisé d'une visite à l'autre. */
const collapsed = useStorage<string[]>('grammaire:collapsed', [])

const results = computed(() => searchGrammar(query.value))
const searching = computed(() => query.value.trim().length > 0)
const groups = computed(() => groupByCategory(results.value))

function toggle(categorie: string) {
  collapsed.value = collapsed.value.includes(categorie)
    ? collapsed.value.filter((c) => c !== categorie)
    : [...collapsed.value, categorie]
}
/** En recherche, tout est déplié pour ne rien masquer des résultats. */
const isOpen = (categorie: string) => searching.value || !collapsed.value.includes(categorie)
</script>

<template>
  <div>
    <PageHeader
      title="Grammaire"
      :subtitle="`${GRAMMAR_N5.length} points du palier N5, classés par thème.`"
    />

    <div class="mb-5">
      <input
        v-model="query"
        type="search"
        autocapitalize="off"
        autocorrect="off"
        spellcheck="false"
        placeholder="Rechercher — « thème », « て », « obligation »…"
        aria-label="Rechercher un point de grammaire"
        class="w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-brand-500 dark:border-neutral-700 dark:bg-neutral-900"
      />
      <p class="mt-1.5 min-h-4 text-xs text-neutral-400">
        <span v-if="searching">{{ results.length }} résultat{{ results.length > 1 ? 's' : '' }}</span>
      </p>
    </div>

    <p
      v-if="searching && !results.length"
      class="rounded-xl border border-neutral-200 bg-white p-5 text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400"
    >
      Aucun point ne correspond à « {{ query }} ».
    </p>

    <div class="space-y-4">
      <section
        v-for="g in groups"
        :key="g.categorie"
        class="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
      >
        <button
          type="button"
          class="flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left transition hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
          :aria-expanded="isOpen(g.categorie)"
          @click="toggle(g.categorie)"
        >
          <span class="text-sm font-semibold">{{ g.label }}</span>
          <span class="shrink-0 text-xs text-neutral-400">{{ g.points.length }}</span>
        </button>

        <ul v-if="isOpen(g.categorie)" class="divide-y divide-neutral-100 dark:divide-neutral-800">
          <li v-for="p in g.points" :key="p.id">
            <NuxtLink
              :to="`/grammaire/${p.id}`"
              class="block px-5 py-3 transition hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
            >
              <div class="flex flex-wrap items-baseline gap-x-2">
                <span class="jp text-sm font-medium">{{ p.titre }}</span>
              </div>
              <div class="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">{{ p.sens }}</div>
              <div class="jp mt-1 text-xs text-neutral-400">{{ p.structure }}</div>
            </NuxtLink>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>
