<script setup lang="ts">
import { resolveComponent } from 'vue'

const props = defineProps<{ label: string; value: string | number; hint?: string; to?: string }>()

// `<component :is="'NuxtLink'">` (chaîne) ne rend pas toujours un vrai <a> :
// on résout le composant pour garantir le lien (et donc le curseur pointer).
const NuxtLink = resolveComponent('NuxtLink')
const tag = props.to ? NuxtLink : 'div'
</script>

<template>
  <component
    :is="tag"
    :to="to"
    class="block rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
    :class="
      to
        ? 'cursor-pointer transition hover:border-brand-400 hover:shadow-sm dark:hover:border-brand-600'
        : ''
    "
  >
    <div class="text-2xl font-semibold tabular-nums">{{ value }}</div>
    <div class="mt-1 text-sm font-medium text-neutral-600 dark:text-neutral-300">{{ label }}</div>
    <div v-if="hint" class="mt-0.5 text-xs text-neutral-400">{{ hint }}</div>
  </component>
</template>
