<script setup lang="ts">
defineProps<{ step: string }>()
</script>

<template>
  <div
    class="rounded-xl border border-dashed border-neutral-300 bg-white/50 p-8 text-center dark:border-neutral-700 dark:bg-neutral-900/50"
  >
    <p class="text-sm text-neutral-500 dark:text-neutral-400">
      Module prévu à l’<span class="font-medium text-neutral-700 dark:text-neutral-200">{{ step }}</span>
      du plan de construction.
    </p>
    <p class="mt-1 text-xs text-neutral-400">
      Voir <code>SPEC-V1.md</code> §7.
    </p>
    <slot />
  </div>
</template>
