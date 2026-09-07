<script setup lang="ts">
import { computed } from 'vue'
import { useSpeech } from '~/composables/useSpeech'
import { useSettingsStore } from '~/stores/settings'

const props = withDefaults(
  defineProps<{ text: string; label?: string; rate?: number; size?: 'sm' | 'md' }>(),
  { size: 'md' },
)

const settings = useSettingsStore()
const { supported, speaking, speak } = useSpeech()

const show = computed(() => supported && settings.values.audioEnabled && Boolean(props.text.trim()))
</script>

<template>
  <button
    v-if="show"
    type="button"
    :aria-label="label ?? `Écouter : ${text}`"
    :title="label ?? 'Écouter'"
    class="inline-flex shrink-0 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
    :class="[
      size === 'sm' ? 'h-7 w-7' : 'h-9 w-9',
      speaking && 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400',
    ]"
    @click.stop="speak(text, { rate: rate ?? settings.values.audioRate })"
  >
    <AppIcon name="speaker-wave" :class="size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'" />
  </button>
</template>
