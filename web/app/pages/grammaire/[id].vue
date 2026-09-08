<script setup lang="ts">
import { computed } from 'vue'
import { CATEGORY_LABELS, findGrammarPoint, relatedPoints } from '~/lib/grammar'

const route = useRoute()
const point = computed(() => findGrammarPoint(String(route.params.id)))
const related = computed(() => (point.value ? relatedPoints(point.value) : []))

useHead({ title: () => (point.value ? `${point.value.titre} — Grammaire` : 'Grammaire') + ' — Japonais' })
</script>

<template>
  <div v-if="point">
    <NuxtLink
      to="/grammaire"
      class="mb-4 inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
    >
      <AppIcon name="arrow-left" class="h-4 w-4" />
      Grammaire
    </NuxtLink>

    <PageHeader :title="point.titre" :subtitle="point.sens" />

    <div class="mb-6 flex flex-wrap gap-2">
      <span class="rounded-full bg-brand-100 px-2.5 py-1 text-xs font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
        {{ point.palier }}
      </span>
      <span class="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
        {{ CATEGORY_LABELS[point.categorie] }}
      </span>
    </div>

    <div class="space-y-5">
      <section class="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 class="mb-2 text-sm font-semibold text-neutral-500 dark:text-neutral-400">Structure</h2>
        <p class="jp text-lg">{{ point.structure }}</p>
      </section>

      <section class="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 class="mb-2 text-sm font-semibold text-neutral-500 dark:text-neutral-400">Explication</h2>
        <p class="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">{{ point.explication }}</p>
      </section>

      <section class="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 class="mb-3 text-sm font-semibold text-neutral-500 dark:text-neutral-400">Exemples</h2>
        <ul class="space-y-3.5">
          <li v-for="(e, i) in point.exemples" :key="i">
            <div class="flex items-start gap-2">
              <span class="jp text-base">{{ e.jp }}</span>
              <SpeakButton :text="e.lecture ?? e.jp" size="sm" :label="`Écouter : ${e.jp}`" />
            </div>
            <div v-if="e.lecture" class="jp mt-0.5 text-xs text-neutral-400">{{ e.lecture }}</div>
            <div class="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">{{ e.fr }}</div>
          </li>
        </ul>
      </section>

      <section
        v-if="point.notes?.length"
        class="rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/50 dark:bg-amber-950/30"
      >
        <h2 class="mb-2 text-sm font-semibold text-amber-800 dark:text-amber-200">À retenir</h2>
        <ul class="list-disc space-y-1.5 pl-4 text-sm text-amber-900 dark:text-amber-100">
          <li v-for="(n, i) in point.notes" :key="i">{{ n }}</li>
        </ul>
      </section>

      <section
        v-if="related.length"
        class="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <h2 class="mb-3 text-sm font-semibold text-neutral-500 dark:text-neutral-400">Voir aussi</h2>
        <div class="flex flex-wrap gap-2">
          <NuxtLink
            v-for="r in related"
            :key="r.id"
            :to="`/grammaire/${r.id}`"
            class="jp rounded-lg border border-neutral-300 px-3 py-1.5 text-sm transition hover:border-brand-400 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            {{ r.titre }}
          </NuxtLink>
        </div>
      </section>
    </div>
  </div>

  <div v-else>
    <PageHeader title="Point introuvable" />
    <NuxtLink
      to="/grammaire"
      class="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
    >
      <AppIcon name="arrow-left" class="h-4 w-4" />
      Grammaire
    </NuxtLink>
  </div>
</template>
