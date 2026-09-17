<script setup lang="ts">
import { computed } from 'vue'
import { useStorage } from '@vueuse/core'
import { findReadingText, fullText, sentenceText } from '~/lib/reading'
import { useDictionaryPopover } from '~/composables/useDictionaryPopover'

const route = useRoute()
const text = computed(() => findReadingText(String(route.params.id)))
const { openDefinition } = useDictionaryPopover()

/** Mémorisé d'une lecture à l'autre : préférence stable pour tout le texte. */
const showFurigana = useStorage('lecture:furigana', true)

useHead({ title: () => (text.value ? `${text.value.titre} — Lecture` : 'Lecture') + ' — Japonais' })

const PUNCTUATION_ONLY = /^[。、！？\s]+$/
function isTappable(segText: string): boolean {
  return !PUNCTUATION_ONLY.test(segText)
}
</script>

<template>
  <div v-if="text">
    <NuxtLink
      to="/lecture"
      class="mb-4 inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
    >
      <AppIcon name="arrow-left" class="h-4 w-4" />
      Lecture
    </NuxtLink>

    <PageHeader :title="text.titre" :subtitle="text.resume" />

    <div class="mb-5 flex flex-wrap items-center gap-6 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <SettingField label="Furigana" inline>
        <ToggleSwitch v-model="showFurigana" label="Afficher la furigana" />
      </SettingField>
      <SpeakButton :text="fullText(text)" label="Écouter tout le texte" />
    </div>

    <div v-if="text.vocabCle.length" class="mb-5">
      <h2 class="mb-2 text-sm font-semibold text-neutral-500 dark:text-neutral-400">Vocabulaire clé</h2>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="v in text.vocabCle"
          :key="v"
          type="button"
          class="jp cursor-pointer rounded-lg border border-neutral-300 px-3 py-1.5 text-sm transition hover:border-brand-400 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
          @click="openDefinition(v)"
        >
          {{ v }}
        </button>
      </div>
    </div>

    <div class="space-y-4 rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <div v-for="(sentence, i) in text.corps" :key="i" class="flex items-start gap-2">
        <p class="jp leading-loose" :class="showFurigana ? 'text-2xl' : 'text-xl'">
          <template v-for="(seg, j) in sentence" :key="j">
            <button
              v-if="isTappable(seg.text)"
              type="button"
              class="cursor-pointer rounded transition hover:bg-brand-50 dark:hover:bg-brand-900/30"
              @click="openDefinition(seg.lookup ?? seg.text)"
            >
              <ruby v-if="seg.reading">{{ seg.text }}<rt v-show="showFurigana" class="jp text-[0.5em] text-neutral-400">{{ seg.reading }}</rt></ruby>
              <template v-else>{{ seg.text }}</template>
            </button>
            <template v-else>{{ seg.text }}</template>
          </template>
        </p>
        <SpeakButton :text="sentenceText(sentence)" size="sm" :label="`Écouter : ${sentenceText(sentence)}`" />
      </div>
    </div>
  </div>

  <div v-else>
    <PageHeader title="Texte introuvable" />
    <NuxtLink
      to="/lecture"
      class="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
    >
      <AppIcon name="arrow-left" class="h-4 w-4" />
      Lecture
    </NuxtLink>
  </div>
</template>
