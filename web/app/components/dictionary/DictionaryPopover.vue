<script setup lang="ts">
import { onKeyStroke } from '@vueuse/core'
import { useDictionaryPopover } from '~/composables/useDictionaryPopover'

const { open, loading, term, entries, closeDefinition } = useDictionaryPopover()

onKeyStroke('Escape', () => closeDefinition())
</script>

<template>
  <div class="fixed inset-0 z-50" :class="open || 'pointer-events-none'" :inert="!open">
    <button
      type="button"
      aria-label="Fermer la définition"
      class="absolute inset-0 cursor-default bg-black/40 transition-opacity duration-200 ease-out"
      :class="open ? 'opacity-100' : 'opacity-0'"
      @click="closeDefinition"
    />
    <div
      class="absolute inset-x-0 bottom-0 mx-auto flex max-h-[70vh] max-w-md flex-col rounded-t-2xl border-t border-neutral-200 bg-white px-5 pt-4 transition-transform duration-200 ease-out dark:border-neutral-800 dark:bg-neutral-950"
      :class="open ? 'translate-y-0' : 'translate-y-full'"
      :style="{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.25rem)' }"
    >
      <div class="mb-3 flex items-start justify-between gap-3">
        <div class="jp min-w-0 flex-1 truncate text-xl font-medium">{{ term }}</div>
        <button
          type="button"
          aria-label="Fermer la définition"
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-neutral-100 dark:hover:bg-neutral-800"
          @click="closeDefinition"
        >
          <AppIcon name="x-mark" class="h-5 w-5" />
        </button>
      </div>

      <div class="overflow-y-auto">
        <p v-if="loading" class="pb-4 text-sm text-neutral-400">Recherche…</p>
        <p v-else-if="!entries.length" class="pb-4 text-sm text-neutral-500 dark:text-neutral-400">
          Aucune définition trouvée pour « {{ term }} ».
        </p>
        <ul v-else class="divide-y divide-neutral-100 pb-4 dark:divide-neutral-800">
          <li v-for="e in entries" :key="e.id" class="flex items-start gap-3 py-3 first:pt-0">
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-baseline gap-x-2">
                <span class="jp text-base font-medium">{{ e.kanji ?? e.reading }}</span>
                <span v-if="e.kanji" class="jp text-sm text-neutral-400">{{ e.reading }}</span>
              </div>
              <p class="mt-0.5 text-sm text-neutral-600 dark:text-neutral-300">{{ e.gloss }}</p>
            </div>
            <SpeakButton :text="e.reading" size="sm" :label="`Écouter ${e.kanji ?? e.reading}`" />
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
