<script setup lang="ts">
defineProps<{ label: string; value: string | number; hint?: string }>()
</script>

<template>
  <div class="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
    <div class="text-2xl font-semibold tabular-nums">{{ value }}</div>
    <div class="mt-1 text-sm font-medium text-neutral-600 dark:text-neutral-300">{{ label }}</div>
    <div v-if="hint" class="mt-0.5 text-xs text-neutral-400">{{ hint }}</div>
  </div>
</template>
