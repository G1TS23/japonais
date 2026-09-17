<script setup lang="ts">
import { READING_N5 } from '~/lib/reading'

useHead({ title: 'Lecture — Japonais' })
</script>

<template>
  <div>
    <PageHeader title="Lecture" :subtitle="`${READING_N5.length} texte${READING_N5.length > 1 ? 's' : ''} — palier N5.`" />

    <ul class="space-y-3">
      <li v-for="t in READING_N5" :key="t.id">
        <NuxtLink
          :to="`/lecture/${t.id}`"
          class="block rounded-xl border border-neutral-200 bg-white p-4 transition hover:border-brand-400 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800/60"
        >
          <div class="flex items-baseline gap-2">
            <span class="jp text-lg font-medium">{{ t.titre }}</span>
            <span class="rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
              {{ t.palier }}
            </span>
          </div>
          <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{{ t.resume }}</p>
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>
