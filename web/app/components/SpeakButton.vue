<script setup lang="ts">
import { computed, ref } from 'vue'
import { useSpeech } from '~/composables/useSpeech'
import { useSettingsStore } from '~/stores/settings'

const props = withDefaults(
  defineProps<{ text: string; label?: string; rate?: number; size?: 'sm' | 'md' }>(),
  { size: 'md' },
)

const settings = useSettingsStore()
const { supported, speak, hasJapaneseVoice } = useSpeech()

// On masque le bouton si aucune voix japonaise n'est installée (sinon la
// lecture se fait avec une voix inadaptée). Optimiste tant que les voix du
// navigateur ne sont pas encore chargées.
const show = computed(
  () => supported && hasJapaneseVoice.value && settings.values.audioEnabled && Boolean(props.text.trim()),
)

// Retour visuel LOCAL au clic (l'état `speaking` de useSpeech est partagé :
// l'utiliser colorierait tous les boutons de la page à la fois).
const active = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined
function onClick() {
  active.value = true
  clearTimeout(timer)
  timer = setTimeout(() => (active.value = false), 700)
  speak(props.text, { rate: props.rate })
}
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
      active && 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100',
    ]"
    @click.stop="onClick"
  >
    <AppIcon name="speaker-wave" :class="size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'" />
  </button>
</template>
